import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { stringify } from 'csv-stringify/sync';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Optional: Add authentication to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Fetch unsent registrations in batches for scalability
    const BATCH_SIZE = 1000; // Adjust based on your needs
    let hasMore = true;
    let skip = 0;
    const allUnsentUsers: any[] = [];
    const userIdsToMark: string[] = [];

    // Fetch all unsent registrations in batches
    while (hasMore) {
      const batch = await User.find({
        emailSent: { $ne: true },
        isActive: true
      })
        .select('firstName surname cellphone email address suburb province temple registrationDate')
        .sort({ registrationDate: 1 }) // Oldest first
        .skip(skip)
        .limit(BATCH_SIZE)
        .lean();

      if (batch.length === 0) {
        hasMore = false;
      } else {
        allUnsentUsers.push(...batch);
        userIdsToMark.push(...batch.map(u => u._id.toString()));
        skip += BATCH_SIZE;

        // If batch is smaller than BATCH_SIZE, we've reached the end
        if (batch.length < BATCH_SIZE) {
          hasMore = false;
        }
      }
    }

    // If no unsent registrations, return early
    if (allUnsentUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No unsent registrations found',
        count: 0,
        timestamp: new Date().toISOString()
      });
    }

    // Generate CSV
    const csvData = stringify(allUnsentUsers.map(user => ({
      'Cellphone': user.cellphone,
      'Status': "active",
      'Registration Date': new Date(user.registrationDate).toISOString(),
    })), {
      header: true,
      columns: [
        'Cellphone',
        'Status',
        'Registration Date',
      ]
    });

    // Send email with CSV attachment
    const recipientEmail = process.env.REGISTRATION_EMAIL_RECIPIENT;
    if (!recipientEmail) {
      throw new Error('REGISTRATION_EMAIL_RECIPIENT environment variable is not set');
    }

    const fromEmail = process.env.EMAIL_FROM || 'registrations@shembeark.com';
    const timestamp = new Date().toISOString();
    const dateString = timestamp.split('T')[0];

    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: `New Registrations Report - ${allUnsentUsers.length} registrations (${dateString})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            New Registrations Report
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Total new registrations:</strong> ${allUnsentUsers.length}</p>
            <p><strong>Report generated at:</strong> ${timestamp}</p>
          </div>
          
          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0056b3;">
              📎 The detailed registration data is attached as a CSV file.
            </p>
          </div>
          
          <div style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
            <p>This is an automated report from the Shembe Ark registration system.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `registrations-${dateString}.csv`,
          content: Buffer.from(csvData).toString('base64'),
        }
      ]
    });

    // Check if email was successfully sent
    if (emailResult.data?.id) {
      console.log(`Successfully sent ${allUnsentUsers.length} registrations via email. Email ID: ${emailResult.data.id}`);
      
      // TODO: Mark as sent logic commented out for testing
      // const now = new Date();
      // const updateResult = await User.updateMany(
      //   { _id: { $in: userIdsToMark } },
      //   {
      //     $set: {
      //       emailSent: true,
      //       sentAt: now
      //     }
      //   }
      // );

      return NextResponse.json({
        success: true,
        message: 'Registrations sent successfully (not marked as sent for testing)',
        count: allUnsentUsers.length,
        emailId: emailResult.data.id,
        timestamp: timestamp,
        note: 'Records NOT marked as sent - testing mode'
      });
    } else {
      throw new Error('Failed to send email - no email ID returned');
    }

  } catch (error: any) {
    console.error('Error sending registrations:', error);
    
    // Return detailed error information
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send registrations',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Handle POST requests for manual triggering
export async function POST(request: NextRequest) {
  // Same logic as GET - allows manual triggering via POST
  return GET(request);
}

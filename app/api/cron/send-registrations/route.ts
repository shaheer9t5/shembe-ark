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
        .select('cellphone registrationDate')
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
      'name': '',
      'surname': '',
      'cellphone': `+27${user.cellphone}`,
      'status': 'active',
    })), {
      header: true,
      columns: [
        'name',
        'surname',
        'cellphone',
        'status',
      ]
    });

    // Send email with CSV attachment
    const recipientEmail = process.env.REGISTRATION_EMAIL_RECIPIENT;
    if (!recipientEmail) {
      throw new Error('REGISTRATION_EMAIL_RECIPIENT environment variable is not set');
    }

    const fromEmail = process.env.EMAIL_FROM || 'registrations@shembeark.co.za';
    const timestamp = new Date().toISOString();
    const dateString = timestamp.split('T')[0];

    // Get CC recipients from environment variable (comma-separated)
    const ccRecipients = process.env.EMAIL_CC 
      ? process.env.EMAIL_CC.split(',').map(email => email.trim()).filter(Boolean)
      : undefined;

    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      ...(ccRecipients && ccRecipients.length > 0 && { cc: ccRecipients }),
      subject: `New Registrations Report - ${allUnsentUsers.length} registrations (${dateString})`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Registration Report</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Header with Logo -->
            <div style="text-align: center; padding: 40px 20px 30px 20px; border-bottom: 2px solid #171717;">
              <img src="https://register.shembeark.co.za/shembe-ark.png" alt="Shembe Ark" style="height: 40px; width: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
              <h1 style="margin: 0; color: #171717; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Registration Report
              </h1>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 20px;">
              
              <!-- Stats Card -->
              <div style="background-color: #ffffff; border: 2px solid #171717; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
                <div style="text-align: center; margin-bottom: 25px;">
                  <div style="display: inline-block; background-color: #171717; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; margin-bottom: 15px;">
                    NEW REGISTRATIONS
                  </div>
                  <h2 style="margin: 0; color: #171717; font-size: 48px; font-weight: 700; line-height: 1;">
                    ${allUnsentUsers.length}
                  </h2>
                </div>
                
                <div style="border-top: 1px solid #e5e5e5; padding-top: 20px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #666; font-size: 14px; font-weight: 500;">Report Generated:</td>
                      <td style="padding: 8px 0; color: #171717; font-size: 14px; font-weight: 600; text-align: right;">
                        ${new Date(timestamp).toLocaleDateString('en-ZA', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666; font-size: 14px; font-weight: 500;">Time Zone:</td>
                      <td style="padding: 8px 0; color: #171717; font-size: 14px; font-weight: 600; text-align: right;">SAST</td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- Attachment Notice -->
              <div style="background-color: #f8f9fa; border: 2px solid #e5e5e5; border-radius: 8px; padding: 25px; text-align: center; margin-bottom: 30px;">
                <div style="font-size: 32px; margin-bottom: 10px;">📎</div>
                <h3 style="margin: 0 0 8px 0; color: #171717; font-size: 18px; font-weight: 600;">
                  Complete Registration Data
                </h3>
                <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
                  All registration details are included in the attached CSV file:<br>
                  <strong style="color: #171717;">registrations-${dateString}.csv</strong>
                </p>
              </div>

              <!-- System Info -->
              <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e5e5;">
                <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.4;">
                  This automated report was generated by the Shembe Ark registration system.<br>
                  Providing complimentary internet access to our community.
                </p>
              </div>

            </div>
          </div>
        </body>
        </html>
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
      
      // Mark users as sent
      const now = new Date();
      const updateResult = await User.updateMany(
        { _id: { $in: userIdsToMark } },
        {
          $set: {
            emailSent: true,
            sentAt: now
          }
        }
      );

      console.log(`Marked ${updateResult.modifiedCount} users as sent`);

      return NextResponse.json({
        success: true,
        message: 'Registrations sent successfully',
        count: allUnsentUsers.length,
        markedAsSent: updateResult.modifiedCount,
        emailId: emailResult.data.id,
        timestamp: timestamp
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

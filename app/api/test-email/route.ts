import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { stringify } from 'csv-stringify/sync';
import { Resend } from 'resend';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Starting email test...');
    
    await connectDB();
    console.log('✅ Connected to database');

    // Get ALL users for testing (no emailSent filter)
    const allUsers = await User.find({
      isActive: true
    })
      .select('firstName surname cellphone email address suburb province temple registrationDate emailSent')
      .sort({ registrationDate: -1 }) // Newest first
      .limit(50) // Limit to 50 for testing
      .lean();

    console.log(`📊 Found ${allUsers.length} total registrations`);

    // If no registrations, create a test CSV with sample data
    let csvData: string;
    let actualCount = allUsers.length;
    
    if (allUsers.length === 0) {
      console.log('📝 No registrations found, creating sample data for test');
      const sampleData = [{
        'First Name': 'Test',
        'Surname': 'User',
        'Cellphone': '812345678',
        'Email': 'test@example.com',
        'Address': '123 Test Street',
        'Suburb': 'Test Suburb',
        'Province': 'Gauteng',
        'Temple': 'Test Temple',
        'Registration Date': new Date().toISOString(),
        'Email Sent': 'false'
      }];
      
      csvData = stringify(sampleData, {
        header: true,
        columns: [
          'First Name',
          'Surname', 
          'Cellphone',
          'Email',
          'Address',
          'Suburb',
          'Province',
          'Temple',
          'Registration Date',
          'Email Sent'
        ]
      });
      actualCount = 1;
    } else {
      // Generate CSV from actual data
      csvData = stringify(allUsers.map(user => ({
        'First Name': user.firstName,
        'Surname': user.surname,
        'Cellphone': user.cellphone,
        'Email': user.email || '',
        'Address': user.address,
        'Suburb': user.suburb,
        'Province': user.province,
        'Temple': user.temple,
        'Registration Date': new Date(user.registrationDate).toISOString(),
        'Email Sent': user.emailSent ? 'true' : 'false'
      })), {
        header: true,
        columns: [
          'First Name',
          'Surname',
          'Cellphone', 
          'Email',
          'Address',
          'Suburb',
          'Province',
          'Temple',
          'Registration Date',
          'Email Sent'
        ]
      });
    }

    // Send test email
    const recipientEmail = process.env.REGISTRATION_EMAIL_RECIPIENT;
    if (!recipientEmail) {
      throw new Error('REGISTRATION_EMAIL_RECIPIENT environment variable is not set');
    }

    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    const timestamp = new Date().toISOString();
    const dateString = timestamp.split('T')[0];

    console.log(`📧 Sending test email from ${fromEmail} to ${recipientEmail}`);

    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      subject: `🧪 TEST - All Registrations Report (${actualCount} total) - ${dateString}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #856404; margin: 0;">🧪 TEST EMAIL</h2>
            <p style="margin: 5px 0 0 0; color: #856404;">This is a test of the registration email system with ALL users.</p>
          </div>
          
          <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
            All Registrations Report (Test)
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Total registrations:</strong> ${actualCount} ${allUsers.length === 0 ? '(sample data)' : '(all users)'}</p>
            <p><strong>Report generated at:</strong> ${timestamp}</p>
            <p><strong>Test mode:</strong> All users included (limited to 50 max)</p>
            <p><strong>Note:</strong> Includes both sent and unsent registrations</p>
          </div>
          
          <div style="background-color: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #0056b3;">
              📎 The registration data is attached as a CSV file with email status.
            </p>
          </div>
          
          <div style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px;">
            <p>This is a test email from the Shembe Ark registration system.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `test-all-registrations-${dateString}.csv`,
          content: Buffer.from(csvData).toString('base64'),
        }
      ]
    });

    if (emailResult.data?.id) {
      console.log('✅ Test email sent successfully!');
      console.log(`📧 Email ID: ${emailResult.data.id}`);
      
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully!',
        emailId: emailResult.data.id,
        registrationCount: actualCount,
        recipient: recipientEmail,
        from: fromEmail,
        timestamp: timestamp,
        note: allUsers.length === 0 ? 'No registrations found, sent sample data' : `Sent ALL registration data (${allUsers.length} users, limited to 50 max for testing)`
      });
    } else {
      throw new Error('Failed to send test email - no email ID returned');
    }

  } catch (error: any) {
    console.error('❌ Test email error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send test email',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

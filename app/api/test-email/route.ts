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
      .select('cellphone registrationDate')
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
        'name': '',
        'surname': '',
        'cellphone': '+27812345678',
        'status': 'active'
      }];
      
      csvData = stringify(sampleData, {
        header: true,
        columns: [
          'name',
          'surname',
          'cellphone',
          'status'
        ]
      });
      actualCount = 1;
    } else {
      // Generate CSV from actual data
      csvData = stringify(allUsers.map(user => ({
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
    }

    // Send test email
    const recipientEmail = "shaheer.rana2002@gmail.com"

    const fromEmail = process.env.EMAIL_FROM || 'onboarding@resend.dev';
    const timestamp = new Date().toISOString();
    const dateString = timestamp.split('T')[0];
    // Create timestamp string for filename (YYYY-MM-DD-HHMMSS)
    const timestampString = timestamp.replace(/[:.]/g, '-').replace('T', '-').slice(0, -5);

    // Get CC recipients from environment variable (comma-separated)
    const ccRecipients = "liaqat@9t5.com.au"

    console.log(`📧 Sending test email from ${fromEmail} to ${recipientEmail}`);
    console.log(`📋 CC recipients: ${ccRecipients}`);

    const emailResult = await resend.emails.send({
      from: fromEmail,
      to: recipientEmail,
      cc: ccRecipients,
      subject: `🧪 TEST - All Registrations Report (${actualCount} total) - ${dateString}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Test Registration Report</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: 'Montserrat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            
            <!-- Test Warning Banner -->
            <div style="background-color: #fff3cd; border: 2px solid #856404; padding: 15px 20px; text-align: center;">
              <h3 style="margin: 0; color: #856404; font-size: 16px; font-weight: 600;">🧪 TEST EMAIL</h3>
              <p style="margin: 5px 0 0 0; color: #856404; font-size: 14px;">This is a test of the registration email system</p>
            </div>

            <!-- Header with Logo -->
            <div style="text-align: center; padding: 40px 20px 30px 20px; border-bottom: 2px solid #171717;">
              <img src="https://register.shembeark.co.za/shembe-ark.png" alt="Shembe Ark" style="height: 40px; width: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
              <h1 style="margin: 0; color: #171717; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                Test Registration Report
              </h1>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 20px;">
              
              <!-- Stats Card -->
              <div style="background-color: #ffffff; border: 2px solid #171717; border-radius: 8px; padding: 30px; margin-bottom: 30px;">
                <div style="text-align: center; margin-bottom: 25px;">
                  <div style="display: inline-block; background-color: #171717; color: #ffffff; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 500; margin-bottom: 15px;">
                    ALL REGISTRATIONS (TEST)
                  </div>
                  <h2 style="margin: 0; color: #171717; font-size: 48px; font-weight: 700; line-height: 1;">
                    ${actualCount}
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
                      <td style="padding: 8px 0; color: #666; font-size: 14px; font-weight: 500;">Test Data:</td>
                      <td style="padding: 8px 0; color: #171717; font-size: 14px; font-weight: 600; text-align: right;">
                        ${allUsers.length === 0 ? 'Sample Data' : 'Real Data (Max 50)'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666; font-size: 14px; font-weight: 500;">Includes:</td>
                      <td style="padding: 8px 0; color: #171717; font-size: 14px; font-weight: 600; text-align: right;">Sent + Unsent</td>
                    </tr>
                  </table>
                </div>
              </div>

              <!-- Attachment Notice -->
              <div style="background-color: #f8f9fa; border: 2px solid #e5e5e5; border-radius: 8px; padding: 25px; text-align: center; margin-bottom: 30px;">
                <div style="font-size: 32px; margin-bottom: 10px;">📎</div>
                <h3 style="margin: 0 0 8px 0; color: #171717; font-size: 18px; font-weight: 600;">
                  Registration Data
                </h3>
                <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">
                  Registration details are included in the attached CSV file:<br>
                  <strong style="color: #171717;">test-all-registrations-${timestampString}.csv</strong>
                </p>
              </div>

              <!-- System Info -->
              <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e5e5;">
                <p style="margin: 0; color: #999; font-size: 12px; line-height: 1.4;">
                  This is a test email from the Shembe Ark registration system.<br>
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
          filename: `test-all-registrations-${timestampString}.csv`,
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

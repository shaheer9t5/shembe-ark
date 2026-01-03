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
              <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMzIwIDMyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xNS45ODYxIDMwLjU0NjlDMTQuMTk4IDI5LjgxNTEgMTIuNzY3NSAyOC43MjU3IDExLjY5NDYgMjcuMjg5N0MxMC42MjE3IDI1Ljg1MzcgMTAuMDYwNSAyNC4xMjA2IDEwIDIyLjA5NTlIMTguMDEwOUMxOC4xMjY0IDIzLjI0MDMgMTguNTIyNSAyNC4xMTUxIDE5LjE5OTMgMjQuNzE0OEMxOS44NzYgMjUuMzE0NSAyMC43NTYzIDI1LjYxNzEgMjEuODQwMiAyNS42MTcxQzIyLjkyNDEgMjUuNjE3MSAyMy44Mzc0IDI1LjM1ODUgMjQuNDgxMiAyNC44NDY5QzI1LjEyNDkgMjQuMzM1MiAyNS40NDk1IDIzLjYxOTkgMjUuNDQ5NSAyMi43MTIxQzI1LjQ0OTUgMjEuOTQ3MyAyNS4xOTA5IDIxLjMyMDEgMjQuNjc5MiAyMC44MTk0QzI0LjE2NzYgMjAuMzE4NyAyMy41MzQ4IDE5LjkxMTYgMjIuNzg2NiAxOS41ODdDMjIuMDM4MyAxOS4yNjI0IDIwLjk3NjQgMTguODk5MiAxOS41OTU0IDE4LjQ4NjZDMTcuNTk4MiAxNy44NzA0IDE1Ljk2OTYgMTcuMjU0MiAxNC43MDk3IDE2LjYzNzlDMTMuNDQ5NyAxNi4wMjE3IDEyLjM2MDMgMTUuMTEzOSAxMS40NTI1IDEzLjkwOUMxMC41NDQ3IDEyLjcwNCAxMC4wODggMTEuMTM2IDEwLjA4OCA5LjE5OTI4QzEwLjA4OCA2LjMyMTc1IDExLjEyNzkgNC4wNzE0NSAxMy4yMTMxIDIuNDQyODdDMTUuMjk4NCAwLjgxNDI5IDE4LjAxMDkgMCAyMS4zNTYgMEMyNC43MDEyIDAgMjcuNTAxNyAwLjgxNDI5IDI5LjU4NyAyLjQ0Mjg3QzMxLjY3MjIgNC4wNzE0NSAzMi43ODM2IDYuMzM4MjYgMzIuOTMyMiA5LjI0MzNIMjQuNzg5M0MyNC43Mjg4IDguMjQ3NDQgMjQuMzY1NiA3LjQ2MDY2IDIzLjY4ODkgNi44ODg0NkMyMy4wMTIxIDYuMzE2MjUgMjIuMTQ4MyA2LjAzMDE1IDIxLjA5MiA2LjAzMDE1QzIwLjE4NDEgNi4wMzAxNSAxOS40NDY5IDYuMjcyMjQgMTguODkxMiA2Ljc1NjQxQzE4LjMzNTUgNy4yNDA1OCAxOC4wNTQ5IDcuOTM5MzMgMTguMDU0OSA4Ljg0NzE2QzE4LjA1NDkgOS44NDMwMSAxOC41MjI1IDEwLjYyNDMgMTkuNDYzNCAxMS4xOEMyMC40MDQyIDExLjczNTcgMjEuODY3NyAxMi4zNDA5IDIzLjg2NDkgMTIuOTg0NkMyNS44NjIyIDEzLjY2MTQgMjcuNDc5NyAxNC4zMDUxIDI4LjcyODcgMTQuOTIxM0MyOS45Nzc2IDE1LjUzNzUgMzEuMDU2IDE2LjQzNDQgMzEuOTYzOCAxNy42MDYzQzMyLjg3MTcgMTguNzc4MiAzMy4zMjgzIDIwLjI5MTIgMzMuMzI4MyAyMi4xMzk5QzMzLjMyODMgMjMuOTg4NiAzMi44ODI3IDI1LjUwMTYgMzEuOTg1OCAyNi45Mzc2QzMxLjA4OSAyOC4zNzM2IDI5Ljc5MDYgMjkuNTE4IDI4LjA5MDUgMzAuMzcwOEMyNi4zOTAzIDMxLjIyMzYgMjQuMzc2NiAzMS42NDczIDIyLjA2MDMgMzEuNjQ3M0MxOS43NDQgMzEuNjQ3MyAxNy43NzQzIDMxLjI3ODcgMTUuOTg2MSAzMC41NDY5WiIgZmlsbD0iYmxhY2siLz48cGF0aCBkPSJNNjkuNDMyMiAwLjQ0MDE1NVYzMS4zMzkySDYxLjkwNTVWMTguNjE4Nkg1MC4xOTczVjMxLjMzOTJINDIuNjcwN1YwLjQ0MDE1NUg1MC4xOTczVjEyLjU0NDVINjEuOTA1NVYwLjQ0MDE1NUg2OS40MzIyWiIgZmlsbD0iYmxhY2siLz48cGF0aCBkPSJNODYuMjk1NyA2LjQ3MDMxVjEyLjcyMDVIOTYuMzc1M1YxOC41MzA2SDg2LjI5NTdWMjUuMzA5SDk3LjY5NThWMzEuMzM5Mkg3OC43NjlWMC40NDAxNTVIOTcuNjk1OFY2LjQ3MDMxSDg2LjI5NTdaIiBmaWxsPSJibGFjayIvPjxwYXRoIGQ9Ik0xNDIuMDMxIDAuNDQwMTU1VjMxLjMzOTJIMTM0LjUwNFYxMi44MDg2TDEyNy41OTMgMzEuMzM5MkgxMjEuNTE5TDEyNC41NjUgMTIuNzY0NlYzMS4zMzkySDEwNy4wMzhWMC40NDAxNTVIMTE1LjkyOUwxMjQuNiAyMS44MzE4TDEzMy4xODMgMC40NDAxNTVIMTQyLjAzMVoiIGZpbGw9ImJsYWNrIi8+PHBhdGggZD0iTTE3NC4zODggMTguMTU2NUMxNzUuNDcyIDE5LjU0ODUgMTc2LjAxNiAyMS4xNDQgMTc2LjAxNiAyMi45MzIyQzE3Ni4wMTYgMjUuNTEyNiAxNzUuMTE0IDI3LjU1OTMgMTczLjMwOSAyOS4wNzI0QzE3MS41MDUgMzAuNTg1NCAxNjguOTkgMzEuMzM5MiAxNjUuNzYxIDMxLjMzOTJIMTUxLjM2N1YwLjQ0MDE1NUgxNjUuMjc2QzE2OC40MTggMC40NDAxNTUgMTcwLjg3MiAxLjE2MDkxIDE3Mi42NDkgMi41OTY5MkMxNzQuNDI2IDQuMDMyOTQgMTc1LjMxMiA1Ljk4NjEzIDE3NS4zMTIgOC40NTEwMUMxNzUuMzEyIDEwLjI3MjIgMTc0LjgzMyAxMS43Nzk3IDE3My44ODEgMTIuOTg0NkMxNzIuOTMgMTQuMTg5NiAxNzEuNjU5IDE1LjAyNTkgMTcwLjA3NCAxNS40OTM1QzE3MS44NjIgMTUuODczMiAxNzMuMzA0IDE2Ljc2NDUgMTc0LjM4OCAxOC4xNTY1Wk0xNTguODk0IDEyLjk0MDZIMTYzLjgyNEMxNjUuMDU2IDEyLjk0MDYgMTY2LjAwMyAxMi42NzEgMTY2LjY2MyAxMi4xMjYzQzE2Ny4zMjMgMTEuNTgxNiAxNjcuNjUzIDEwLjc4MzggMTY3LjY1MyA5LjcyNzQ3QzE2Ny42NTMgOC42NzEwOSAxNjcuMzIzIDcuODYyMyAxNjYuNjYzIDcuMzA2NkMxNjYuMDAzIDYuNzUwOTEgMTY1LjA1NiA2LjQ3MDMxIDE2My44MjQgNi40NzAzMUgxNTguODk0VjEyLjk0MDZaTTE2Ny4zNjcgMjQuNDA2N0MxNjguMDU1IDIzLjgzNDUgMTY4LjQwMiAyMy4wMDM3IDE2OC40MDIgMjEuOTE5OEMxNjguNDAyIDIwLjgzNTkgMTY4LjA0NCAxOS45ODMxIDE2Ny4zMjMgMTkuMzY2OUMxNjYuNjAyIDE4Ljc1MDcgMTY1LjYxMiAxOC40NDI2IDE2NC4zNTIgMTguNDQyNkgxNTguODk0VjI1LjI2NUgxNjQuNDRDMTY1LjcgMjUuMjY1IDE2Ni42NzkgMjQuOTc4OSAxNjcuMzY3IDI0LjQwNjdaIiBmaWxsPSJibGFjayIvPjxwYXRoIGQ9Ik0xOTIuODg1IDYuNDcwMzFWMTIuNzIwNUgyMDIuOTY1VjE4LjUzMDZIMTkyLjg4NVYyNS4zMDlIMjA0LjI4NVYzMS4zMzkySDE4NS4zNTlWMC40NDAxNTVIMjA0LjI4NVY2LjQ3MDMxSDE5Mi44ODVaIiBmaWxsPSJibGFjayIvPjxwYXRoIGQ9Ik0yMzguODI3IDI0LjUxNjhIMjI1LjQ0NkwyMjIuOTgxIDMxLjMzOTJIMjE4Ljc1NUwyMjkuODQ3IDAuODM2MzA0SDIzNC40NjlMMjQ1LjUxNyAzMS4zMzkySDI0MS4yOTJMMjM4LjgyNyAyNC41MTY4Wk0yMzcuNjgyIDIxLjI1OTZMMjMyLjEzNiA1Ljc2NjA2TDIyNi41OSAyMS4yNTk2SDIzNy42ODJaIiBmaWxsPSJibGFjayIvPjxwYXRoIGQ9Ik0yNzIuNDk5IDMxLjMzOTJMMjY1LjE5MiAxOC43OTQ3SDI2MC4zNVYzMS4zMzkySDI1Ni4zNDVWMC42NjAyNDhIMjY2LjI0OEMyNjguNTY1IDAuNjYwMjQ4IDI3MC41MjMgMS4wNTYzOSAyNzIuMTI0IDEuODQ4NjdDMjczLjcyNiAyLjY0MDk1IDI3NC45MTkgMy43MTM4NCAyNzUuNzEyIDUuMDYxODJDMjc2LjUwNCA2LjQwOTggMjc2LjkgNy45NTAzNSAyNzYuOSA5LjY4MzQ3QzI3Ni45IDExLjc5NjIgMjc2LjI4OSAxMy42NjE0IDI3NS4wNzQgMTUuMjczNUMyNzMuODU4IDE2Ljg4NTUgMjcyLjAzMSAxNy45NTg0IDI2OS41OTQgMTguNDg2NkwyNzcuMjk2IDMxLjMzOTJIMjcyLjQ5OVpNMjYwLjM1IDE1LjU4MTZIMjY2LjI0OEMyNjguNDIyIDE1LjU4MTYgMjcwLjA1IDE1LjA0NzkgMjcxLjEzNCAxMy45NzVDMjcyLjIxOCAxMi45MDIxIDI3Mi43NjMgMTEuNDcxNiAyNzIuNzYzIDkuNjgzNDdDMjcyLjc2MyA3Ljg5NTMzIDI3Mi4yMjkgNi40NTM4MSAyNzEuMTU2IDUuNDU3OTZDMjcwLjA4MyA0LjQ2MjEgMjY4LjQ0OSAzLjk2MTQzIDI2Ni4yNDggMy45NjE0M0gyNjAuMzVWMTUuNTgxNloiIGZpbGw9ImJsYWNrIi8+PHBhdGggZD0iTTMwNC43NjIgMzEuMzM5MkwyOTIuMTMgMTcuMzQyMlYzMS4zMzkySDI4OC4xMjRWMC42NjAyNDhIMjkyLjEzVjE0Ljg3NzNMMzA0LjgwNiAwLjY2MDI0OEgzMDkuODY4TDI5NS45NTkgMTYuMDIxN0wzMTAgMzEuMzM5MkgzMDQuNzYyWiIgZmlsbD0iYmxhY2siLz48L3N2Zz4=" alt="Shembe Ark" style="height: 40px; width: auto; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto;">
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

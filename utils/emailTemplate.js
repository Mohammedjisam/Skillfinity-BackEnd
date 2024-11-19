function otpEmailTemplate(otp) {
  return {
    subject: "Your One-Time Password (OTP) for Authentication",
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your OTP Code</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <tr>
            <td style="padding: 40px 0; text-align: center; background-color: #4a90e2;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0;">Your One-Time Password</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <p style="font-size: 16px; margin-bottom: 20px;">Hello,</p>
              <p style="font-size: 16px; margin-bottom: 20px;">Your One-Time Password (OTP) for authentication is:</p>
              <div style="background-color: #f0f0f0; border-radius: 4px; padding: 20px; text-align: center; margin-bottom: 20px;">
                <h2 style="font-size: 36px; color: #4a90e2; margin: 0;">${otp}</h2>
              </div>
              <p style="font-size: 16px; margin-bottom: 20px;">This OTP is valid for a limited time. Please do not share this code with anyone.</p>
              <p style="font-size: 16px; margin-bottom: 20px;">If you didn't request this OTP, please ignore this email or contact our support team.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f0f0f0; padding: 20px 30px; text-align: center;">
              <p style="font-size: 14px; color: #666; margin: 0;">This is an automated message, please do not reply to this email.</p>
              <p style="font-size: 14px; color: #666; margin: 10px 0 0;">© 2023 Your Company Name. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };
}

module.exports = otpEmailTemplate;
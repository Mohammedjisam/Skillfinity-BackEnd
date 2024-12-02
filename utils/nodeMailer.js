const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    let info = await transporter.sendMail({
      from: `"Skillfinity" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });

    console.log("Email sent:", info);
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw new Error("Failed to send email");
  }
};

const otpEmailTemplate = (otp) => {
  return {
    subject: "🔐 Your Skillfinity OTP Code",
    htmlContent: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Skillfinity OTP</title>
      </head>
      <body style="font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f4f7fa; margin: 0; padding: 0;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="min-width: 100%; background-color: #f4f7fa;">
          <tr>
            <td align="center" style="padding: 40px 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <tr>
                  <td style="padding: 40px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                     <tr>
  <td align="center" style="padding-bottom: 30px;">
    <div style="font-family: 'Arial Black', sans-serif; font-size: 48px; font-weight: 900; color: #0066cc; letter-spacing: -2px;">
      skillfinity
    </div>
  </td>
</tr>
                      <tr>
                        <td align="center" style="padding-bottom: 20px;">
                          <h1 style="color: #333333; font-size: 24px; margin: 0;">🔑 Your One-Time Password (OTP)</h1>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-bottom: 30px;">
                          <p style="color: #666666; font-size: 16px; line-height: 24px; margin: 0;">Use the following OTP to complete your action: 🚀</p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding-bottom: 30px;">
                          <table cellpadding="0" cellspacing="0" border="0" style="background-color: #f0f7ff; border-radius: 8px; overflow: hidden;">
                            <tr>
                              <td style="padding: 20px 40px;">
                                <h2 style="color: #0066cc; font-size: 36px; margin: 0;">${otp}</h2>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 30px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td align="center" style="padding-bottom: 15px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <circle cx="12" cy="12" r="10"></circle>
                                  <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                              </td>
                            </tr>
                            <tr>
                              <td align="center">
                                <p style="color: #666666; font-size: 14px; line-height: 21px; margin: 0;">⏰ This OTP will expire in 2 minutes for security reasons.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-bottom: 30px;">
                          <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                              <td align="center" style="padding-bottom: 15px;">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                </svg>
                              </td>
                            </tr>
                            <tr>
                              <td align="center">
                                <p style="color: #666666; font-size: 14px; line-height: 21px; margin: 0;">🛡️ If you didn't request this OTP, please ignore this email.</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #f8f9fa; border-top: 1px solid #e9ecef; padding: 20px 40px; border-radius: 0 0 8px 8px;">
                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                      <tr>
                        <td align="center">
                          <p style="color: #999999; font-size: 12px; line-height: 18px; margin: 0;">© 2024 Skillfinity. All rights reserved. 🌟</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };
};

module.exports = { mailSender, otpEmailTemplate };

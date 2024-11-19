const nodemailer = require("nodemailer");

const mailSender = async (email, title, body) => {
    try {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587, 
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
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
      subject: "Your OTP Code",
      htmlContent: `<h1>OTP HERE IS</h1><h2>${otp}</h2>`,
    };
};

module.exports = { mailSender, otpEmailTemplate };
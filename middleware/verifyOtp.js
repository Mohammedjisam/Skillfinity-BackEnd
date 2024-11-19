require("dotenv").config();
const otpSchema =require('../model/otpStore')

const verifyOtp = async (req, res, next) => {
  try {
    const { otp, email } = req.body;
    const otpData = await otpSchema.findOne({ email });
    if (!otpData) {
      return res
        .status(404)
        .json({ success: false, message: "OTP not found." });
    }

    if (otp === otpData.otp) {
  
      next(); 
    } else {
      console.log("Invalid OTP.");
      return res.status(401).json({ success: false, message: "Invalid OTP." });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

module.exports = { verifyOtp };
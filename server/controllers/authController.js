const User = require('../models/User');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).json({ message: 'Please provide all details including verification code' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Verify OTP code
    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord || otpRecord.code !== otp) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      isVerified: true, // Verification is complete since OTP verified
    });

    // Delete the OTP code
    await OTP.deleteOne({ email });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
// @access  Public
exports.logout = async (req, res) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({ success: true, data: {} });
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRE,
  });

  const refreshToken = jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE,
  });

  const options = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // Match JWT_REFRESH_EXPIRE
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('refreshToken', refreshToken, options)
    .json({
      success: true,
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
};

const sendEmail = require('../utils/sendEmail');

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      // Return 200/success anyway to prevent enumeration
      return res.status(200).json({
        success: true,
        message: 'If the email matches an account, reset instructions have been sent.'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const frontendOrigins = process.env.FRONTEND_URL
      ? process.env.FRONTEND_URL.split(',').map(o => o.trim())
      : ['http://localhost:5173'];
    const primaryFrontendUrl = frontendOrigins[0];
    const resetUrl = `${primaryFrontendUrl}/reset-password/${resetToken}`;

    const message = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 2px dashed #E7E1B1; background-color: #FBF5DD; color: #0D530E;">
        <div style="text-align: center; border-bottom: 1px solid #E7E1B1; padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="color: #0D530E; font-size: 28px; margin: 0; font-family: Georgia, serif; font-weight: bold; letter-spacing: 1px;">DIGITAL TIME CAPSULE</h1>
          <p style="color: #306D29; font-size: 14px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Account Recovery</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6;">We received a request to reset the password for your Time Capsule account.</p>
        <p style="font-size: 16px; line-height: 1.6;">Click the button below to forge a new password. This link will expire in 15 minutes.</p>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${resetUrl}" style="background-color: #0D530E; border: 1px solid #306D29; color: #FBF5DD; padding: 12px 30px; text-decoration: none; font-family: Georgia, serif; font-size: 16px; font-weight: bold; letter-spacing: 1px; display: inline-block; box-shadow: 3px 3px 0px #E7E1B1;">Reset Password</a>
        </div>
        <div style="border-top: 1px solid #E7E1B1; padding-top: 20px; margin-top: 30px; text-align: center;">
          <p style="font-size: 12px; color: #306D29; margin: 0; font-style: italic;">If you did not request a password reset, please ignore this email.</p>
          <p style="font-size: 11px; color: #306D29; opacity: 0.7; margin: 8px 0 0 0;">Digital Time Capsule • Archiving Your Memories</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Recovery - Digital Time Capsule',
        html: message
      });

      res.status(200).json({
        success: true,
        message: 'If the email matches an account, reset instructions have been sent.'
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const crypto = require('crypto');
    // Hash sent token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Send verification OTP
// @route   POST /api/auth/send-otp
// @access  Public
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide an email' });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Generate 6-digit numeric OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Upsert the OTP record (delete existing OTP for this email if any, then save)
    await OTP.findOneAndUpdate(
      { email },
      { code, createdAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const message = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 2px dashed #E7E1B1; background-color: #FBF5DD; color: #0D530E; text-align: center;">
        <div style="border-bottom: 1px solid #E7E1B1; padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="color: #0D530E; font-size: 28px; margin: 0; font-family: Georgia, serif; font-weight: bold; letter-spacing: 1px;">DIGITAL TIME CAPSULE</h1>
          <p style="color: #306D29; font-size: 14px; margin: 5px 0 0 0; text-transform: uppercase; letter-spacing: 2px;">Signup Verification</p>
        </div>
        <p style="font-size: 16px; line-height: 1.6; text-align: left; color: #0D530E;">Thank you for creating an account with Digital Time Capsule.</p>
        <p style="font-size: 16px; line-height: 1.6; text-align: left; color: #0D530E;">Use the verification code below to complete your registration:</p>
        <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: bold; color: #0D530E; letter-spacing: 6px; margin: 30px auto; background-color: #fdfdf9; border: 1px solid #E7E1B1; padding: 15px 30px; display: inline-block; box-shadow: inset 2px 2px 5px rgba(0,0,0,0.02);">
          ${code}
        </div>
        <p style="font-size: 12px; color: #306D29; margin-top: 20px; font-style: italic;">This verification code will expire in 10 minutes.</p>
        <div style="border-top: 1px solid #E7E1B1; padding-top: 20px; margin-top: 35px;">
          <p style="font-size: 11px; color: #306D29; opacity: 0.7; margin: 0;">Digital Time Capsule • Archiving Your Memories</p>
        </div>
      </div>
    `;

    try {
      await sendEmail({
        email,
        subject: 'Signup Verification Code - Digital Time Capsule',
        html: message
      });

      res.status(200).json({
        success: true,
        message: 'Verification code sent to your email.'
      });
    } catch (mailErr) {
      console.error('Failed to send OTP email:', mailErr.message);
      // In development, the email is saved locally anyway, so let it return 200
      if (process.env.NODE_ENV !== 'production') {
        return res.status(200).json({
          success: true,
          message: 'Verification code generated locally for testing.'
        });
      }
      res.status(500).json({ message: 'Failed to send verification email' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



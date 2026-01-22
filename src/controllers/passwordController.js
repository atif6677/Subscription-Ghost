const User = require("../models/signupModel");
const { ForgotPasswordRequest } = require("../models/forgotPasswordModel");
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { sendEmail } = require('../services/emailService'); 
const saltRounds = parseInt(process.env.SALT_ROUNDS);

exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new AppError('User not found', 404);

    const id = uuidv4();
    const request = new ForgotPasswordRequest({
        _id: id, 
        userId: user._id,
        isActive: true
    });
    await request.save();

    const protocol = req.protocol;
    const host = req.get('host');
    const resetURL = `${protocol}://${host}/password/resetpassword/${id}`;
    
    console.log("🔑 Generated Reset Link:", resetURL);

    await sendEmail({
        toEmail: user.email,
        toName: user.name,
        subject: "Password Reset Link",
        htmlContent: `
            <h3>Reset Your Password</h3>
            <p>Click the link below to reset your password:</p>
            <a href="${resetURL}">${resetURL}</a>
            <br>
            <p>If you didn't request this, please ignore this email.</p>
        `
    });

    res.json({ message: 'Password reset link has been sent to your email' });
});

exports.getResetPasswordForm = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const request = await ForgotPasswordRequest.findById(id);

    if (!request || !request.isActive) {
        return res.send(`<script>alert('Invalid or expired link'); window.location.href='/login.html';</script>`);
    }

    res.send(`
        <html>
            <head>
                <title>Reset Password</title>
                <style>
                    body { font-family: sans-serif; display: flex; justify-content: center; padding-top: 50px; background: #f4f4f4; }
                    form { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
                    input { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; }
                    button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
                    button:hover { background: #0056b3; }
                </style>
            </head>
            <body>
                <form action="/password/resetpassword/${id}" method="POST">
                    <h3>Reset Your Password</h3>
                    <input type="password" name="newPassword" placeholder="Enter new password" required minlength="6" />
                    <button type="submit">Update Password</button>
                </form>
            </body>
        </html>
    `);
});

exports.postResetPassword = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
        // Send alert if password is too short
        return res.send(`
            <script>
                alert('Password must be at least 6 characters long');
                window.history.back(); 
            </script>
        `);
    }

    const request = await ForgotPasswordRequest.findById(id);
    if (!request || !request.isActive) {
        return res.send(`<script>alert('Invalid or expired reset link'); window.location.href='/login.html';</script>`);
    }

    const user = await User.findById(request.userId);
    if (!user) {
        return res.send(`<script>alert('User not found'); window.location.href='/login.html';</script>`);
    }

  
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    user.password = hashedPassword;
    await user.save();

    request.isActive = false;
    await request.save();

    res.send(`
        <div style="text-align:center; padding-top:50px; font-family:sans-serif;">
            <h2 style="color:green;">Password Updated!</h2>
            <p>You can now <a href="/login.html">Login here</a>.</p>
        </div>
    `);
});
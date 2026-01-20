const cron = require('node-cron');
const brevo = require('@getbrevo/brevo');
const Subscription = require('../models/subscriptionModel');
const User = require('../models/signupModel');

// Initialize Brevo
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

const sendEmail = async (toEmail, userName, subName, daysLeft) => {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = `⚠️ Alert: ${subName} Trial Ends Soon!`;
    sendSmtpEmail.htmlContent = `
        <h3>Hi ${userName},</h3>
        <p>Your free trial for <b>${subName}</b> is ending in <b>${daysLeft} days</b>.</p>
        <p>If you don't cancel it, you will be charged.</p>
        <br>
        <p>- Subscription Ghost 👻</p>
    `;
    sendSmtpEmail.sender = { name: "Subscription Ghost", email: process.env.EMAIL_USER || "noreply@subscriptionghost.com" };
    sendSmtpEmail.to = [{ email: toEmail, name: userName }];

    try {
        await apiInstance.sendTransacEmail(sendSmtpEmail);
        console.log(`📧 Email sent to ${toEmail} for ${subName}`);
    } catch (err) {
        console.error("❌ Email Failed:", err.body || err.message);
    }
};

const checkExpiringTrials = async () => {
    console.log('🔍 Cron Job: Checking for expiring trials...');
    
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    // Normalize time to ensure accurate comparison
    threeDaysFromNow.setHours(0, 0, 0, 0);
    const endOfTargetDay = new Date(threeDaysFromNow);
    endOfTargetDay.setHours(23, 59, 59, 999);

    try {
        // Find active subscriptions with trials ending in exactly 3 days
        const subs = await Subscription.find({
            isActive: true,
            trialDays: { $gt: 0 }, 
            nextBillingDate: {
                $gte: threeDaysFromNow,
                $lte: endOfTargetDay
            }
        }).populate('user'); // This works because 'ref' in subscriptionModel points to "User" schema

        if (subs.length === 0) {
            console.log("✅ No trials expiring in 3 days.");
            return;
        }

        for (const sub of subs) {
            if (sub.user && sub.user.email) {
                await sendEmail(sub.user.email, sub.user.name, sub.name, 3);
            }
        }

    } catch (err) {
        console.error('❌ Cron Job Error:', err);
    }
};

const startCronJob = () => {
    // Run every day at 08:00 AM
    cron.schedule('0 8 * * *', () => {
        checkExpiringTrials();
    });
};

module.exports = { startCronJob };
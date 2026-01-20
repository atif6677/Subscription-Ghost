const cron = require('node-cron');
const Subscription = require('../models/subscriptionModel');
const { sendEmail } = require('../services/emailService'); 

const checkExpiringTrials = async () => {
    console.log('🔍 Cron Job: Checking for expiring trials...');
    
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    threeDaysFromNow.setHours(0, 0, 0, 0);
    
    const endOfTargetDay = new Date(threeDaysFromNow);
    endOfTargetDay.setHours(23, 59, 59, 999);

    try {
        const subs = await Subscription.find({
            isActive: true,
            trialDays: { $gt: 0 }, 
            nextBillingDate: {
                $gte: threeDaysFromNow,
                $lte: endOfTargetDay
            }
        }).populate('user');

        if (subs.length === 0) {
            console.log("✅ No trials expiring in 3 days.");
            return;
        }

        for (const sub of subs) {
            if (sub.user && sub.user.email) {
                // ✅ Use the new Service
                await sendEmail({
                    toEmail: sub.user.email,
                    toName: sub.user.name,
                    subject: `⚠️ Alert: ${sub.name} Trial Ends Soon!`,
                    htmlContent: `
                        <h3>Hi ${sub.user.name},</h3>
                        <p>Your free trial for <b>${sub.name}</b> is ending in <b>3 days</b>.</p>
                        <p>If you don't cancel it, you will be charged.</p>
                        <br>
                        <p>- Subscription Ghost 👻</p>
                    `
                });
            }
        }

    } catch (err) {
        console.error('❌ Cron Job Error:', err);
    }
};

const startCronJob = () => {
    cron.schedule('0 8 * * *', checkExpiringTrials);
};

module.exports = { startCronJob };
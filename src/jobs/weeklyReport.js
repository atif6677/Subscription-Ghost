const cron = require('node-cron');
const brevo = require('@getbrevo/brevo');
const User = require('../models/signupModel'); 
const News = require('../models/newsModel'); 

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
);

const sendWeeklyEmail = async (user, newsContent) => {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "📅 Subscription Ghost: Weekly Market Watch";
    sendSmtpEmail.htmlContent = `
        <h2>Weekly Subscription News</h2>
        <p>Hi ${user.name}, here is what's happening in the subscription world:</p>
        <hr>
        ${newsContent}
        <hr>
        <p><a href="http://localhost:3000/login.html">Login to your dashboard</a></p>
    `;
    sendSmtpEmail.sender = { name: "Subscription Ghost", email: process.env.EMAIL_USER || "noreply@subscriptionghost.com" };
    sendSmtpEmail.to = [{ email: user.email, name: user.name }];

    await apiInstance.sendTransacEmail(sendSmtpEmail);
};

const startWeeklyReport = () => {
  // Run every Monday at 09:00 AM
  cron.schedule('0 9 * * 1', async () => {
    console.log('📰 Preparing Weekly Reports...');
    try {
        // 1. Get the latest news
        const newsDoc = await News.findOne().sort({ generatedAt: -1 });
        const newsContent = newsDoc ? newsDoc.content : "<p>No news updates this week.</p>";

        // 2. Get all users
        const users = await User.find({});

        // 3. Send email to each user
        for (const user of users) {
            console.log(`Sending report to ${user.email}...`);
            await sendWeeklyEmail(user, newsContent);
        }
        console.log("✅ Weekly reports sent.");

    } catch (error) {
      console.error('Weekly Report Error:', error);
    }
  });
};

module.exports = startWeeklyReport;
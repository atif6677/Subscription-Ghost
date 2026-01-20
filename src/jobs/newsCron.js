const cron = require('node-cron'); // Fixed Typo
const News = require('../models/newsModel');
const { fetchMarketNews } = require('../services/aiService');

const generateWeeklyNews = async () => {
  console.log('📰 Fetching Weekly News...');
  try {
    const newsContent = await fetchMarketNews();
    
    // Safety Check
    if (!newsContent || newsContent.includes("Ghost Error")) {
        console.log("⚠️ AI failed, skipping DB update.");
        return "Failed to generate news.";
    }

    await News.deleteMany({});
    await News.create({ content: newsContent });
    console.log('✅ Weekly News Updated');
    return "News updated.";
  } catch (err) {
    console.error('❌ Failed to update news:', err);
    return "Error updating news.";
  }
};

const startNewsCron = () => {
  // Run every Monday at 9 AM
  cron.schedule('0 9 * * 1', generateWeeklyNews);
};

module.exports = { startNewsCron, generateWeeklyNews };
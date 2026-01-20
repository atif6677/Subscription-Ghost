
const Subscription = require('../models/subscriptionModel');
const News = require('../models/newsModel'); 
const { fetchSubscriptionDetails, fetchMarketNews } = require('../services/aiService'); 
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// --- NEWS ---
exports.getNews = asyncHandler(async (req, res) => {
    let news = await News.findOne().sort({ generatedAt: -1 });
    
    if (!news || news.content.includes("unavailable")) {
        if (news) await News.deleteOne({ _id: news._id });
        const content = await fetchMarketNews();
        news = await News.create({ content: content || "News unavailable" });
    }
    res.send(news.content);
});

// --- AI PREVIEW ---
exports.previewSubscription = asyncHandler(async (req, res) => {
    const { serviceName } = req.body;
    if (!serviceName) throw new AppError('Service Name required', 400);
    
    const aiData = await fetchSubscriptionDetails(serviceName);
    res.json({ status: 'success', data: aiData });
});

// --- ADD SUBSCRIPTION ---
exports.createSubscription = asyncHandler(async (req, res) => {
    const { userId, serviceName, startDate, price, trialDays } = req.body;

    if (!userId) {
        throw new AppError('User ID is missing. Please re-login.', 400);
    }
    if (!req.user || !req.user._id) {
        throw new AppError('Authentication failed. User not found.', 401);
    }
    if(userId.toString() !== req.user._id.toString()) {
        throw new AppError('Unauthorized: You can only add subscriptions for yourself.', 401);
    }

    const start = new Date(startDate);
    const billingDate = new Date(start);
    billingDate.setDate(billingDate.getDate() + parseInt(trialDays || 0));

    const newSub = await Subscription.create({
      user: userId,
      name: serviceName,
      price, 
      trialDays: trialDays || 0, 
      startDate,
      nextBillingDate: billingDate,
      isActive: true 
    });
    
    res.status(201).json({ status: 'success', data: newSub });
});

// --- GET SUBSCRIPTIONS ---
exports.getUserSubscriptions = asyncHandler(async (req, res) => {
    if (!req.params.userId) {
         throw new AppError('User ID missing in URL', 400);
    }

    if(req.params.userId.toString() !== req.user._id.toString()) {
        throw new AppError('Unauthorized: User ID mismatch.', 401);
    }
    
    // FIX: Return ALL subscriptions (even inactive) so history works.
    // Frontend will filter them.
    const subs = await Subscription.find({ user: req.params.userId }).sort({ createdAt: -1 });
    res.json(subs);
});

// --- DELETE SUBSCRIPTION (SOFT DELETE) ---
exports.deleteSubscription = asyncHandler(async (req, res) => {
    const sub = await Subscription.findById(req.params.id);
    
    if (!sub) throw new AppError('Subscription not found', 404);
    
    if (sub.user.toString() !== req.user._id.toString()) {
        throw new AppError('Not authorized to delete this subscription', 401);
    }
    
    // FIX: Soft Delete (Mark inactive instead of removing)
    sub.isActive = false;
    await sub.save();

    res.json({ status: 'success', message: 'Subscription cancelled (Archived)' });
});

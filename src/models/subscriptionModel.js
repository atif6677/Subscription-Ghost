const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  startDate: { type: Date, required: true },
  trialDays: { type: Number, default: 0 },
  nextBillingDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
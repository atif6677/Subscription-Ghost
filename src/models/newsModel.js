const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, default: 'Weekly Market Watch' },
  content: { type: String, required: true },
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('News', newsSchema);
const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  items: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'courses'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);


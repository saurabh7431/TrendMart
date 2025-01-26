const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
  quantity: { type: Number, required: true },
  totalMRP: { type: Number, required: true },
  platformFee: { type: Number, default: 20 },
  payableAmount: { type: Number, required: true },
  razorpayOrderId: { type: String, required: true },
  paymentId: { type: String },
  orderDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Pending', 'Paid', 'Failed'], default: 'Pending' },
});

module.exports = mongoose.model('order', orderSchema);

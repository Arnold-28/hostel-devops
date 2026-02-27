const mongoose = require('mongoose');
const { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, COMPLAINT_STATUSES } = require('../utils/constants');

const complaintSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    category: { type: String, enum: COMPLAINT_CATEGORIES, required: true },
    description: { type: String, required: true, trim: true },
    priority: { type: String, enum: COMPLAINT_PRIORITIES, required: true },
    status: { type: String, enum: COMPLAINT_STATUSES, default: 'Submitted', index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);

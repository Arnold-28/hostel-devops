const express = require('express');
const Complaint = require('../models/Complaint');
const { requireAuth, requireRole } = require('../middleware/auth');
const { COMPLAINT_CATEGORIES, COMPLAINT_PRIORITIES, COMPLAINT_STATUSES } = require('../utils/constants');

const router = express.Router();

router.post('/', requireAuth, async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can submit complaints' });
    }

    const { category, description, priority } = req.body || {};
    if (!category || !description || !priority) {
      return res.status(400).json({ message: 'category, description, priority are required' });
    }

    if (!COMPLAINT_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    if (!COMPLAINT_PRIORITIES.includes(priority)) {
      return res.status(400).json({ message: 'Invalid priority' });
    }

    const complaint = await Complaint.create({
      student: req.user._id,
      category,
      description,
      priority,
      status: 'Submitted',
    });

    res.status(201).json({ complaint });
  } catch (err) {
    next(err);
  }
});

// Student: gets only their own complaints
// Admin: gets all complaints + supports filters by category/status
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { category, status } = req.query;

    const query = {};
    if (req.user.role === 'student') {
      query.student = req.user._id;
    }

    if (category) query.category = category;
    if (status) query.status = status;

    const complaints = await Complaint.find(query)
      .populate('student', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({ complaints });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', requireAuth, requireRole('admin'), async (req, res, next) => {
  try {
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ message: 'status is required' });
    if (!COMPLAINT_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    complaint.status = status;
    await complaint.save();

    const populated = await Complaint.findById(complaint._id).populate('student', 'name email role');
    res.status(200).json({ complaint: populated });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

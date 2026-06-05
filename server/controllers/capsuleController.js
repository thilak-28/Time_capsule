const Capsule = require('../models/Capsule');

// @desc    Create a new capsule
// @route   POST /api/capsules
// @access  Private
exports.createCapsule = async (req, res) => {
  try {
    req.body.creator = req.user.id;

    const capsule = await Capsule.create(req.body);

    res.status(201).json({
      success: true,
      data: capsule,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all capsules for current user
// @route   GET /api/capsules
// @access  Private
exports.getCapsules = async (req, res) => {
  try {
    const capsules = await Capsule.find({ creator: req.user.id });

    res.status(200).json({
      success: true,
      count: capsules.length,
      data: capsules,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single capsule
// @route   GET /api/capsules/:id
// @access  Private
exports.getCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    // Check ownership or recipient or public status
    const isCreator = capsule.creator.toString() === req.user.id;
    const isRecipient = capsule.recipients.some(r => r.userId && r.userId.toString() === req.user.id);
    const isPublic = capsule.privacy === 'public' && capsule.status === 'delivered';

    if (!isCreator && !isRecipient && !isPublic) {
      return res.status(401).json({ message: 'Not authorized to view this capsule' });
    }

    // If sealed and not unlocked, restrict content for non-creators
    if (capsule.status === 'sealed' && capsule.unlockDate > new Date() && !isCreator) {
      return res.status(403).json({ message: 'This capsule is still sealed' });
    }

    res.status(200).json({
      success: true,
      data: capsule,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Update capsule
// @route   PUT /api/capsules/:id
// @access  Private
exports.updateCapsule = async (req, res) => {
  try {
    let capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    // Check ownership
    if (capsule.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to update this capsule' });
    }

    // Prevent editing sealed/delivered capsules
    if (capsule.status !== 'draft') {
      return res.status(400).json({ message: 'Sealed or Delivered capsules cannot be edited' });
    }

    capsule = await Capsule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: capsule,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete capsule
// @route   DELETE /api/capsules/:id
// @access  Private
exports.deleteCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    // Check ownership
    if (capsule.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this capsule' });
    }

    await capsule.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Seal a capsule
// @route   POST /api/capsules/:id/seal
// @access  Private
exports.sealCapsule = async (req, res) => {
  try {
    let capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    if (capsule.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    capsule.status = 'sealed';
    await capsule.save();

    res.status(200).json({
      success: true,
      data: capsule,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get received capsules (inbox)
// @route   GET /api/capsules/inbox
// @access  Private
exports.getInbox = async (req, res) => {
  try {
    const capsules = await Capsule.find({
      'recipients.userId': req.user.id,
      status: 'delivered',
    });

    res.status(200).json({
      success: true,
      count: capsules.length,
      data: capsules,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get public capsules
// @route   GET /api/capsules/public
// @access  Public
exports.getPublicCapsules = async (req, res) => {
  try {
    const capsules = await Capsule.find({
      privacy: 'public',
      status: 'delivered',
    });

    res.status(200).json({
      success: true,
      count: capsules.length,
      data: capsules,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Upload media to a capsule
// @route   POST /api/capsules/:id/upload
// @access  Private
exports.uploadMedia = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);

    if (!capsule) {
      return res.status(404).json({ message: 'Capsule not found' });
    }

    if (capsule.creator.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (capsule.status !== 'draft') {
      return res.status(400).json({ message: 'Can only upload media to draft capsules' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'Please upload at least one file' });
    }

    // Extract Cloudinary URLs from uploaded files
    const fileUrls = req.files.map(file => file.path);

    // Append to capsule's media array
    capsule.media.push(...fileUrls);
    await capsule.save();

    res.status(200).json({
      success: true,
      count: fileUrls.length,
      data: capsule,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Trigger manual capsule delivery
// @route   POST /api/capsules/trigger-delivery
// @access  Public (Protected by API token)
exports.triggerDelivery = async (req, res) => {
  try {
    const token = req.headers['x-scheduler-token'];
    const expectedToken = process.env.SCHEDULER_TOKEN;

    if (!expectedToken) {
      return res.status(500).json({ message: 'Scheduler token not configured on server' });
    }

    if (token !== expectedToken) {
      return res.status(401).json({ message: 'Unauthorized trigger' });
    }

    console.log('Delivery triggered via API...');
    const { deliverCapsules } = require('../utils/scheduler');
    await deliverCapsules();

    res.status(200).json({
      success: true,
      message: 'Capsule delivery check executed successfully',
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete all capsules for current user
// @route   DELETE /api/capsules
// @access  Private
exports.deleteAllCapsules = async (req, res) => {
  try {
    await Capsule.deleteMany({ creator: req.user.id });
    res.status(200).json({
      success: true,
      message: 'All your capsules have been deleted successfully',
      data: {},
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// server/routes/videos.js
const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videosController');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/videos'); // Store videos in the uploads/videos directory
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Generate a unique filename
    },
  });

const upload = multer({ storage });

// Get a video by ID
router.get('/videos/:video_id', videoController.getVideoById);

router.get('/videos/watch/:video_id', videoController.getVideoFileById);

// Get all videos
router.get('/videos', videoController.getAllVideos);

// Upload a video
router.post('/videos/upload', upload.single('video'), videoController.createAndUploadVideo);

module.exports = router;

// videoController.js
const prisma = require('../config/db');
const path = require('path');
const fs = require('fs');

const createAndUploadVideo = async (req, res) => {
  try {
    // Check if a file was provided in the request
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Access the uploaded video file using req.file
    const videoFile = req.file;

    // Extract metadata about the video from the request body
    let {
      titulo,
      miniatura_ruta,
      descripcion,
      duracion,
      fecha_publicacion,
      user_id,
      visibilidad_id,
    } = req.body;

    duracion = Number(duracion);
    user_id = Number(user_id);
    visibilidad_id = Number(visibilidad_id);

    // Generate a unique filename for the video
    const videoFileName = Date.now() + '-' + videoFile.originalname;

    // Create the destination directory if it doesn't exist
    const destinationDir = 'uploads/videos';
    if (!fs.existsSync(destinationDir)) {
      fs.mkdirSync(destinationDir, { recursive: true });
    }

    // Set the path where the video will be stored
    const videoPath = path.join(destinationDir, videoFileName);

    // Move the uploaded video file to the specified path
    fs.renameSync(videoFile.path, videoPath);

    // Use Prisma to create a new video record
    const video = await prisma.VIDEOS.create({
      data: {
        titulo,
        miniatura_ruta,
        video_ruta: videoFileName, // Store the actual filename in video_ruta
        descripcion,
        duracion,
        fecha_publicacion,
        user_id,
        visibilidad_id,
      },
    });

    res.status(201).json({ message: 'Video created and uploaded successfully', video });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creating and uploading video' });
  }
};



const getVideoById = async (req, res) => {
  try {
    let { video_id } = req.params;
    video_id = Number(video_id);
    const video = await prisma.VIDEOS.findUnique({
      where: { video_id },
    });
    res.json(video);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting video' });
  }
}

const getVideoFileById = async (req, res) => {
  try {
    let { video_id } = req.params;
    video_id = Number(video_id);
    const video = await prisma.VIDEOS.findUnique({
      where: { video_id },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Get the absolute path to the video file
    const videoPath = path.join(__dirname, '..', 'uploads', 'videos', video.video_ruta);

    // Send the video file
    res.sendFile(videoPath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting video' });
  }
};


const getAllVideos = async (req, res) => {
  try {
    const videos = await prisma.VIDEOS.findMany();
    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error getting videos' });
  }
}

module.exports = {
  createAndUploadVideo,
  getVideoById,
  getAllVideos,
  getVideoFileById,
};



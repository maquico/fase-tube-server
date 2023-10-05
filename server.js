const express = require('express');
const env = require('dotenv');
const cors = require('cors');
const videoRoutes = require('./routes/videosRouter');
const usersRoutes = require('./routes/usersRouter');
const multer = require('multer');
const fs = require('fs');

const destinationDir = 'uploads/videos';
if (!fs.existsSync(destinationDir)) {
  fs.mkdirSync(destinationDir, { recursive: true });
}

const destinationDir2 = 'uploads/miniaturas';
if (!fs.existsSync(destinationDir2)) {
  fs.mkdirSync(destinationDir2, { recursive: true });
}

env.config();

const app = express();

app.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/videos'); // Store videos in the uploads/videos directory
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname); // Generate a unique filename
    },
  });

const upload = multer({ storage });

// Parse incoming JSON into objects
app.use(express.json());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));
app.use('/api', videoRoutes);
app.use('/api', usersRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${process.env.PORT}.`);
    
});
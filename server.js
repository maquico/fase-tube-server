const express = require('express');
const env = require('dotenv');
const cors = require('cors');
const videoRoutes = require('./routes/videosRouter');
const usersRoutes = require('./routes/usersRouter');
const multer = require('multer');
const fs = require('fs');
// const { clerkClient } = require("@clerk/clerk-sdk-node");
// const { IncomingHttpHeaders } = require("http");
const { Webhook } = require("svix");

const destinationDir = 'uploads/videos';
if (!fs.existsSync(destinationDir)) {
  fs.mkdirSync(destinationDir, { recursive: true });
}

const destinationDir2 = 'uploads/miniaturas';
if (!fs.existsSync(destinationDir2)) {
  fs.mkdirSync(destinationDir2, { recursive: true });
}

env.config();
const webhookSecret = process.env.WEBHOOK_SECRET || "";
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

app.post('/api/webhooks/user', (req, res) => {
  console.log("Webhook request received");
  webhookHandler(req, res);
}
);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(process.env.PORT, () => {
    console.log(`Servidor corriendo en puerto ${process.env.PORT}.`);
    
});


async function webhookHandler(req, res) {
  
  console.log("Webhook recibido")
  const payload = await req.body; // Use req.body to access the request body
  const wh = new Webhook(webhookSecret);
  let evt = null;

  try {
    evt = wh.verify(
      JSON.stringify(payload),
      req.headers // Use req.headers to access the request headers
    );
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({}); // Return a JSON response with a 400 status code
  }

  const eventType = evt.type;
  if (eventType === "user.created" || eventType === "user.updated" || eventType === "user.deleted") {
    const { id, ...attributes } = evt.data;
    console.log("Usuario creado o actualizado:" + id)
    console.log("Atributos: " + attributes)

    try {
      await prisma.USUARIOS.upsert({
        where: { clave: id },
        create: {
          usuario_id: id,
          attributes,
        },
        update: { attributes },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({}); // Return a JSON response with a 500 status code
    }
  }

  return res.status(200).json({}); // Return a JSON response with a 200 status code
}
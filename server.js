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
const prisma = require('./config/db');
const { listenerCount } = require('process');

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
  let wh = null;
  let payload = null;
  let evt = null;
  let emailObject;
  let emailAddress;
  let nombres;
  let apellidos;
  let username;

  try {
  console.log("Webhook recibido")
  payload = await req.body; // Use req.body to access the request body
  wh = new Webhook(webhookSecret);
  } catch (error) {
    console.error(error);
  }
  
  try {
    evt = wh.verify(
      JSON.stringify(payload),
      req.headers // Use req.headers to access the request headers
    );
    console.log("Evento verificado" + JSON.stringify(evt))
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({}); // Return a JSON response with a 400 status code
  }
  
  const eventType = evt.type;
  if (eventType === "user.created" || eventType === "user.updated" || eventType === "user.deleted") {
    let { id, ...attributes } = evt.data;
    attributes = Object.entries(attributes);
    console.log("ID: " + id);
    console.log("TYPE ID: " + typeof id);
    console.log("ATTRIBUTES: " + attributes);
    console.log("TYPE ATTR: " + typeof attributes);
  
    for (const [key, value] of attributes) {
      if (key === 'email_addresses') {
        // Check if the key is 'email_addresses'
        emailObject = value[0]; // Assuming it's the first element in the array
        emailAddress = emailObject.email_address;
        console.log(`Email Address: ${emailAddress}`);
      } else if (key === 'first_name' && value) {
        // Check if the key is 'first_name' and it has a value
        username = await generarUsername(emailAddress);
        nombres = value
      } else if (key === 'last_name' && value){
        apellidos = value
      }
    }
    
    console.log("NOMBRES")
    try {
        await prisma.USUARIOS.upsert({
            where: { username: username },
            create: {
              clave: id,
              corrreo: emailAddress,
              nombres: nombres, // Use the 'first_name' value
              apellidos: apellidos,
              username: username,
            },
            update: {
              corrreo: emailAddress,
              nombres: nombres, // Use the 'first_name' value
              apellidos: apellidos,
              username: username,
            },
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({}); // Return a JSON response with a 500 status code
        }
      }
    }




async function generarUsername(email){
  // Generate the base username from the email address
  let baseUsername = email.split('@')[0];
    
  // Check if the user already exists in the database
  let usernameExists = true;
  let username = baseUsername;
  let usernameSuffix = 1;
  
  while (usernameExists) {
    // Check if the username already exists
    const existingUser = await prisma.USUARIOS.findUnique({
      where: {
        username: username, // Assuming 'username' is the field in your model
      },
    });
  
    if (existingUser) {
      // If the username exists, add a numeric suffix
      username = `${baseUsername}${usernameSuffix}`;
      usernameSuffix++;
    } else {
      // If the username doesn't exist, set the flag to false to exit the loop
      usernameExists = false;
    }
  }
  return username;
}
// usersController.js
const prisma = require('../config/db');
const { clerkClient } = require("@clerk/clerk-sdk-node");
const { IncomingHttpHeaders } = require("http");
const { Webhook, WebhookRequiredHeaders } = require("svix");


const sign_in = async (req, res) => {

    try {
        const {
            username,
            nombres,
            apellidos,
            corrreo,
        } = req.body
    
        // Check if the user already exists in the database
        const existingUser = await prisma.USUARIOS.findUnique({
        where: {
          corrreo: email, // Assuming 'corrreo' is the email field in your model
        },
      });

        console.log("Usuario encontrado:" + existingUser)
    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error validando existencia de usuario' });
    }
    
  try {
    if (!existingUser) {
        // User doesn't exist, create a new user record
        const newUser = await prisma.USUARIOS.create({
          data: {
            corrreo: corrreo,
            nombres: nombres,
            apellidos: apellidos,
            username: username,
          },
        });
        res.status(201).json({ message: 'User created successfully', user: newUser });
      }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error creando usuario' });
  }
  
  
}

const webhookSecret = process.env.WEBHOOK_SECRET || "";

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

module.exports = {
    sign_in,
    webhookHandler,
}
// usersController.js
const prisma = require('../config/db');
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




module.exports = {
    sign_in,
}
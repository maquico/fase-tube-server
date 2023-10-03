const dotenv = require('dotenv');
const mysql = require('mysql2');
const { PrismaClient } = require('@prisma/client');

// dotenv.config();

// // Create a connection to the database
// const connection = mysql.createConnection({
//     host: process.env.DB_HOST,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME
// });


const prisma = new PrismaClient();
module.exports = prisma;
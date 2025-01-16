import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 5001; // Default port to 4000 or use environment variable
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// MySQL database connection configuration
const dbConfig = {
    host: "localhost",
    user: "root", // Replace with your MySQL username
    port: process.env.MYSQL_PORT || 3306,
    password: process.env.MYSQL_PASS, // Replace with your actual password
    database: "finance_trackerDB",
    multipleStatements: true, // Enable multiple statements
};

let connection;

async function connectToDatabase() {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log("Connected to MySQL database");
    } catch (err) {
        console.error("Error connecting to MySQL database:", err);
    }
}

// Function to initialize database tables
async function initializeDatabase() {
    try {
        const sqlFilePath = path.join(__dirname, 'db', 'tables.sql');

        if (!fs.existsSync(sqlFilePath)) {
            throw new Error(`SQL file not found at path: ${sqlFilePath}`);
        }

        const sqlCommands = fs.readFileSync(sqlFilePath, 'utf8');

        // Run all the commands in the SQL file
        await connection.query(sqlCommands);

        console.log("Tables initialized successfully");
    } catch (err) {
        console.error("Error initializing tables:", err.message);
        throw err;
    }
}

// Route to initialize database tables
app.get('/initialize_table', async (req, res) => {
    try {
        await initializeDatabase();
        res.send("Tables initialized successfully");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error initializing tables");
    }
});

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/auth', authRoutes);

// Start server and connect to the database
app.listen(port, async () => {
    console.log(`Server running on port ${port}`);
    await connectToDatabase();
});

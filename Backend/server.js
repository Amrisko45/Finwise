import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import "dotenv/config";
import session from "express-session";

import addExpenseRouter from "./routes/expenses.js";
import addIncomeRouter from "./routes/income.js";
import addBudgetRouter from "./routes/budget.js";
import addFinancialGoalsRouter from "./routes/financialGoals.js";
import addDashboardRouter from "./routes/dashboard.js";
import addProcessPrompt from "./routes/chatbot.js";
import addAdminDashboardRouter from "./routes/admindashboard.js";
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
  database: 'finance_trackerdb',
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
    const sqlFilePath = path.join(__dirname, "db", "tables.sql");

    if (!fs.existsSync(sqlFilePath)) {
      throw new Error(`SQL file not found at path: ${sqlFilePath}`);
    }

    const sqlCommands = fs.readFileSync(sqlFilePath, "utf8");

    // Run all the commands in the SQL file
    await connection.query(sqlCommands);

    console.log("Tables initialized successfully");
  } catch (err) {
    console.error("Error initializing tables:", err.message);
    throw err;
  }
}

// Route to initialize database tables
app.get("/initialize_table", async (req, res) => {
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
app.use("/auth", authRoutes);
app.use("/api", addExpenseRouter);
app.use("/api", addIncomeRouter);
app.use("/api", addBudgetRouter);
app.use("/api", addFinancialGoalsRouter);
app.use("/api", addDashboardRouter);
app.use("/api", addProcessPrompt);
app.use("/api", addAdminDashboardRouter);
// Start server and connect to the database
app.listen(port, async () => {
  console.log(`Server running on port ${port}`);
  await connectToDatabase();
});

//mySecurePassword123!

import express from "express";
import db from "../db/db.js";
import cors from "cors";

const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const router = express.Router();

router.get("/get-details", async (req, res) => {
  const user_id = process.env.USER_ID || req.query.user_id || req.body.user_id;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  let connection;
  try {
    connection = await db.getConnection();

    const [[overview]] = await connection.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) AS total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
        (COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) - 
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)) AS savings
      FROM (
        SELECT amount, 'income' AS type FROM Income WHERE user_id = ? AND MONTH(date) = MONTH(CURRENT_DATE()) 
        UNION ALL
        SELECT amount, 'expense' AS type FROM Expenses WHERE user_id = ? AND MONTH(date) = MONTH(CURRENT_DATE())
      ) AS transactions;`,
      [user_id, user_id]
    );

    res.status(200).json({ financialOverview: overview });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  } finally {
    if (connection) connection.release();
  }
});

router.get("/get-monthly-data", async (req, res) => {
  const user_id = process.env.USER_ID;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  let connection;
  try {
    connection = await db.getConnection();

    // Fetch monthly income data
    const [incomeData] = await connection.query(
      `SELECT 
           MONTH(date) AS month, 
           SUM(amount) AS total_income 
         FROM Income 
         WHERE user_id = ? 
         GROUP BY MONTH(date) 
         ORDER BY month;`,
      [user_id]
    );

    // Fetch monthly expense data
    const [expenseData] = await connection.query(
      `SELECT 
           MONTH(date) AS month, 
           SUM(amount) AS total_expenses 
         FROM Expenses 
         WHERE user_id = ? 
         GROUP BY MONTH(date) 
         ORDER BY month;`,
      [user_id]
    );

    // Combine income and expense data into a single response
    const monthlyData = {
      income: Array(12).fill(0), // Initialize array for 12 months
      expenses: Array(12).fill(0), // Initialize array for 12 months
    };

    incomeData.forEach((row) => {
      monthlyData.income[row.month - 1] = row.total_income;
    });

    expenseData.forEach((row) => {
      monthlyData.expenses[row.month - 1] = row.total_expenses;
    });

    res.status(200).json({ monthlyData });
  } catch (error) {
    console.error("Error fetching monthly data:", error);
    res.status(500).json({ error: "Failed to fetch monthly data" });
  } finally {
    if (connection) connection.release();
  }
});

export default router;

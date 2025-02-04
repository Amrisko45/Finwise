import express from "express";
import db from "../db/db.js";
import cors from "cors";

const app = express();
const port = 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

router.get("/total-users", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [[{ total }]] = await connection.query(
      "SELECT COUNT(*) AS total FROM users"
    );
    connection.release();
    res.json({ totalUsers: total });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

// Active Users (last X days)
router.get("/active-users", async (req, res) => {
  const days = parseInt(req.query.days) || 30;
  try {
    const connection = await db.getConnection();
    const [[{ active }]] = await connection.query(
      `SELECT COUNT(*) AS active 
         FROM users 
         WHERE last_login >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [days]
    );
    connection.release();
    res.json({ activeUsers: active });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/total-transactions", async (req, res) => {
  try {
    const connection = await db.getConnection();

    const [[income]] = await connection.query(
      `SELECT COUNT(*) AS count FROM income`
    );
    const [[expenses]] = await connection.query(
      `SELECT COUNT(*) AS count FROM expenses`
    );

    connection.release();
    const total = income.count + expenses.count;
    res.json({ totalTransactions: total });
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/top-expense-category", async (req, res) => {
  try {
    const connection = await db.getConnection();

    // For transaction count version
    const [result] = await connection.query(`
        SELECT 
          ec.category_name,
          COUNT(*) AS transaction_count
        FROM Expenses e
        JOIN Expense_Category ec ON e.category_id = ec.category_id
        GROUP BY ec.category_name
        ORDER BY transaction_count DESC
        LIMIT 1
      `);

    connection.release();
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/monthly-cashflow", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [results] = await connection.query(`
        SELECT 
          YEAR(date) AS year,
          MONTH(date) AS month,
          COALESCE(SUM(i.amount), 0) AS total_income,
          COALESCE(SUM(e.amount), 0) AS total_expenses
        FROM 
          (SELECT date FROM Income
           UNION 
           SELECT date FROM Expenses) AS dates
        LEFT JOIN Income i USING(date)
        LEFT JOIN Expenses e USING(date)
        GROUP BY YEAR(date), MONTH(date)
        ORDER BY year, month
      `);

    connection.release();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/average-savings-trend", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [results] = await connection.query(`
        SELECT 
  YEAR,
  MONTH,
  AVG(net_savings) AS average_savings,
  COUNT(user_id) AS users_count
FROM (
  SELECT 
    YEAR(i.date) AS YEAR,
    MONTH(i.date) AS MONTH,
    i.user_id,
    (COALESCE(SUM(i.amount), 0) - COALESCE(SUM(e.amount), 0)) AS net_savings
  FROM Income i
  LEFT JOIN Expenses e 
    ON i.user_id = e.user_id 
    AND YEAR(i.date) = YEAR(e.date)
    AND MONTH(i.date) = MONTH(e.date)
  GROUP BY YEAR(i.date), MONTH(i.date), i.user_id
  
  UNION ALL
  
  SELECT 
    YEAR(e.date) AS YEAR,
    MONTH(e.date) AS MONTH,
    e.user_id,
    (0 - COALESCE(SUM(e.amount), 0)) AS net_savings
  FROM Expenses e
  LEFT JOIN Income i 
    ON e.user_id = i.user_id 
    AND YEAR(e.date) = YEAR(i.date)
    AND MONTH(e.date) = MONTH(i.date)
  WHERE i.user_id IS NULL
  GROUP BY YEAR(e.date), MONTH(e.date), e.user_id
) AS savings_data
GROUP BY YEAR, MONTH
ORDER BY YEAR, MONTH;
      `);

    connection.release();
    return res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/budget-utilization", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [results] = await connection.query(`
        WITH LatestBudgets AS (
  SELECT 
    user_id,
    monthly_budget,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY last_defined_date DESC) AS rn
  FROM Budget
),
UserSpending AS (
  SELECT 
    lb.user_id,
    lb.monthly_budget,
    COALESCE(SUM(e.amount), 0) AS total_spent
  FROM LatestBudgets lb
  LEFT JOIN Expenses e 
    ON lb.user_id = e.user_id
    AND YEAR(e.date) = YEAR(CURRENT_DATE())
    AND MONTH(e.date) = MONTH(CURRENT_DATE())
  WHERE lb.rn = 1  -- Get only the latest budget
  GROUP BY lb.user_id, lb.monthly_budget
)

SELECT 
  ROUND((SUM(CASE WHEN total_spent > monthly_budget THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 2) AS percent_over_budget,
  ROUND((SUM(CASE WHEN total_spent <= monthly_budget THEN 1 ELSE 0 END) * 100.0) / COUNT(*), 2) AS percent_within_budget
FROM UserSpending;
      `);

    // Handle case where no users have budgets
    const totalUsers =
      results[0]?.percent_over_budget + results[0]?.percent_within_budget;
    const response =
      totalUsers > 0
        ? results[0]
        : {
            percent_over_budget: 0,
            percent_within_budget: 0,
          };

    connection.release();
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/expense-distribution", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [results] = await connection.query(`
        SELECT 
          ec.category_name,
          COALESCE(SUM(e.amount), 0) AS total_spent,
          ROUND((SUM(e.amount) * 100.0) / (SELECT SUM(amount) FROM Expenses), 2) AS percentage
        FROM Expense_Category ec
        LEFT JOIN Expenses e ON ec.category_id = e.category_id
        GROUP BY ec.category_name
        ORDER BY total_spent DESC
      `);

    connection.release();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/users", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [results] = await connection.query(`
        SELECT 
          CONCAT_WS(' ', first_name, last_name) AS full_name,
          email,
          DATE_FORMAT(created_at, '%Y-%m-%d') AS signup_date,
          COALESCE(DATE_FORMAT(last_login, '%Y-%m-%d %H:%i'), 'Never') AS last_login
        FROM Users
        ORDER BY created_at DESC
        LIMIT 10
      `);

    connection.release();
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
});

export default router;

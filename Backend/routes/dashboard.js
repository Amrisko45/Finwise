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

router.get("/budget-utilization", async (req, res) => {
  const user_id = process.env.USER_ID;
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  let connection;
  try {
    connection = await db.getConnection();

    // Get the latest budget for the user
    const [budget] = await connection.query(
      `SELECT monthly_budget 
       FROM Budget 
       WHERE user_id = ? 
       ORDER BY last_defined_date DESC 
       LIMIT 1;`,
      [user_id]
    );

    // If no budget exists, return an error
    if (!budget || budget.length === 0) {
      return res.status(404).json({ error: "No budget found for the user" });
    }

    const monthlyBudget = budget[0].monthly_budget;

    // Calculate total expenses for the current month
    const [expenses] = await connection.query(
      `SELECT SUM(amount) AS total_expenses 
       FROM Expenses 
       WHERE user_id = ? 
         AND date >= DATE_FORMAT(NOW(), '%Y-%m-01') 
         AND date <= LAST_DAY(NOW());`,
      [user_id]
    );

    const totalExpenses = expenses[0].total_expenses || 0;

    // Calculate utilization percentage
    const budgetUtilization =
      monthlyBudget > 0
        ? ((totalExpenses / monthlyBudget) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      budgetUtilization: parseFloat(budgetUtilization),
      totalExpenses,
      monthlyBudget,
    });
  } catch (error) {
    console.error("Error fetching budget utilization:", error);
    res.status(500).json({ error: "Failed to fetch budget utilization" });
  } finally {
    if (connection) connection.release();
  }
});

router.get("/financial-goal-progress", async (req, res) => {
  const user_id = process.env.USER_ID;
  let connection;
  try {
    connection = await db.getConnection();

    // Fetch total savings
    const [[{ savings }]] = await connection.query(
      `SELECT 
          (COALESCE((SELECT SUM(amount) FROM Income WHERE user_id = ?), 0) - 
           COALESCE((SELECT SUM(amount) FROM Expenses WHERE user_id = ?), 0)) AS savings`,
      [user_id, user_id]
    );

    // Fetch goal contributions
    const [goalContributions] = await connection.query(
      `SELECT 
          fg.goal_id, 
          fg.goal_amount, 
          fg.goal_deadline, 
          fg.description,
          (fg.goal_amount / 
              (SELECT SUM(goal_amount) 
               FROM Financial_Goal 
               WHERE budget_id IN (SELECT budget_id FROM Budget WHERE user_id = ?))) AS goal_ratio
       FROM Financial_Goal fg
       WHERE fg.budget_id IN (SELECT budget_id FROM Budget WHERE user_id = ?)`,
      [user_id, user_id]
    );

    // Compute current savings toward each goal and additional fields
    const financialGoals = goalContributions.map((goal) => {
      const goalDeadline = new Date(goal.goal_deadline);
      const currentDate = new Date();
      const timeDiff = goalDeadline - currentDate;
      const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      const remainingDaysFinal = Math.max(0, remainingDays); // Ensure non-negative days

      const currentSavings = savings * goal.goal_ratio;
      const percentageSaved = (currentSavings / goal.goal_amount) * 100;

      return {
        goal_id: goal.goal_id,
        goal_amount: goal.goal_amount,
        goal_deadline: goalDeadline.toISOString(),
        description: goal.description,
        current_savings_toward_goals: currentSavings,
        remaining_days: remainingDaysFinal,
        percentage_saved: percentageSaved,
      };
    });

    res.status(200).json({ financialGoals });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  } finally {
    if (connection) connection.release();
  }
});

router.get("/expense-distribution", async (req, res) => {
  const user_id = process.env.USER_ID;
  let connection;
  try {
    connection = await db.getConnection();
    const [expenseDistribution] = await connection.query(
      `SELECT 
          ec.category_name AS label, 
          SUM(e.amount) AS value
      FROM 
          Expenses e
      JOIN 
          Expense_Category ec ON e.category_id = ec.category_id
      WHERE 
          e.user_id = ?
      GROUP BY 
          ec.category_name
      ORDER BY 
          value DESC;`,
      [user_id]
    );

    res.json(expenseDistribution);
  } catch (error) {
    console.error("Error fetching expense distribution:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/savings-trends-overtime", async (req, res) => {
  const user_id = process.env.USER_ID;
  let connection;

  try {
    connection = await db.getConnection();
    const [trendsOverview] = await connection.query(
      `SELECT 
          DATE_FORMAT(e.date, '%Y-%m') AS month,
          (COALESCE(SUM(i.amount), 0) - COALESCE(SUM(e.amount), 0)) AS savings
      FROM 
          (SELECT DISTINCT date FROM Expenses UNION SELECT DISTINCT date FROM Income) dates
      LEFT JOIN Income i ON DATE_FORMAT(i.date, '%Y-%m') = DATE_FORMAT(dates.date, '%Y-%m') AND i.user_id = ?
      LEFT JOIN Expenses e ON DATE_FORMAT(e.date, '%Y-%m') = DATE_FORMAT(dates.date, '%Y-%m') AND e.user_id = ?
      GROUP BY 
          month
      ORDER BY 
          month ASC;`,
      [user_id, user_id]
    );

    res.json(trendsOverview);
  } catch (error) {
    console.error("Error fetching saving trends:", error);
    res.status(500).json({ error: "Internal Server Error" });
  } finally {
    if (connection) connection.release();
  }
});

export default router;

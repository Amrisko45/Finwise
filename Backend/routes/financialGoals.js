import express from "express";
import db from "../db/db.js";

const router = express.Router();

router.use(express.urlencoded({ extended: true }));

// Middleware to extract user_id (replace with your actual authentication logic)
const authenticateUser = (req, res, next) => {
  const user_id = process.env.USER_ID;
  if (!user_id) {
    return res.status(401).json({ error: "Unauthorized: User ID is missing" });
  }
  req.user_id = user_id;
  next();
};

// Add a financial goal
router.post("/add-financial-goals", authenticateUser, async (req, res) => {
  const { goal_amount, description, goal_deadline } = req.body;
  const user_id = req.user_id;

  console.log("Request Body:", req.body);

  // Validate inputs
  if (!goal_amount || !goal_deadline || !description) {
    return res.status(400).json({
      error: "Goal Amount, Goal Deadline, and Description are required",
    });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Fetch budget_id for the user
    const [budgetResults] = await connection.query(
      "SELECT budget_id FROM Budget WHERE user_id = ? LIMIT 1",
      [user_id]
    );

    if (budgetResults.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(404).json({ error: "No budget found for this user" });
    }

    const budget_id = budgetResults[0].budget_id;

    // Insert the financial goal
    const [insertFinancialGoalResults] = await connection.query(
      "INSERT INTO Financial_Goal (goal_amount, goal_deadline, budget_id, description, user_id) VALUES (?, ?, ?, ?, ?)",
      [goal_amount, goal_deadline, budget_id, description, user_id]
    );

    const goal_id = insertFinancialGoalResults.insertId;
    await connection.commit();

    res.status(201).json({
      message: "Financial Goal added successfully",
      financialGoal: {
        goal_id,
        goal_amount,
        goal_deadline,
        description,
        date: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
      },
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error adding financial goal:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) connection.release();
  }
});

// Fetch financial goal details
router.get("/financial-goal-details", authenticateUser, async (req, res) => {
  const user_id = req.user_id;

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

    // Compute current savings toward each goal
    const financialGoals = goalContributions.map((goal) => ({
      goal_id: goal.goal_id,
      goal_amount: goal.goal_amount,
      goal_deadline: new Date(goal.goal_deadline).toISOString(), // Format deadline
      description: goal.description,
      current_savings_toward_goals: savings * goal.goal_ratio,
    }));

    res.status(200).json({ financialGoals });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  } finally {
    if (connection) connection.release();
  }
});

export default router;

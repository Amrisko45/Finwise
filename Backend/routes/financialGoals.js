import express from "express";
import db from "../db/db.js";

const router = express.Router();

router.use(express.urlencoded({ extended: true }));

router.post("/add-financial-goals", async (req, res) => {
  const { goal_amount, description, goal_deadline } = req.body;
  const user_id = process.env.USER_ID;

  console.log(req.body);

  if (!goal_amount || !goal_deadline || !description) {
    return res.status(400).json({
      error: "Goal Amount, Goal Deadline, and Description are required",
    });
  }
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // ✅ Fetch budget_id for the user
    const [budgetResults] = await connection.query(
      "SELECT budget_id FROM Budget WHERE user_id = ? LIMIT 1",
      [user_id]
    );

    if (budgetResults.length === 0) {
      connection.release(); // ✅ Release connection before returning
      return res.status(404).json({ error: "No budget found for this user" });
    }

    const budget_id = budgetResults[0].budget_id;

    // ✅ Insert the financial goal (WITHOUT goal_id, it's AUTO_INCREMENT)
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
        date: new Date().toISOString().split("T")[0],
      },
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error adding financial goal:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    if (connection) connection.release(); // ✅ Always release connection
  }
});

export default router;

router.get("/financial-goal-details", async (req, res) => {
  const user_id = process.env.USER_ID;
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  try {
    const connection = await db.getConnection();

    //Fetch Data
    const [financialGoals] = await connection.query(
      `SELECT 
            fg.goal_amount, 
            fg.goal_deadline, 
            DATEDIFF(fg.goal_deadline, CURDATE()) AS remaining_time, 
            COALESCE(SUM(i.amount), 0) - COALESCE(SUM(e.amount), 0) AS current_savings
         FROM Financial_Goal fg
         JOIN Budget b ON fg.budget_id = b.budget_id
         LEFT JOIN Income i ON b.user_id = i.user_id
         LEFT JOIN Expenses e ON b.user_id = e.user_id
         WHERE b.user_id = ?
         GROUP BY fg.goal_id, fg.goal_amount, fg.goal_deadline`,
      [user_id]
    );

    connection.release();

    res.status(200).json({
      financialGoals,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(200).json({ error: "Failed to fetch data" });
  }
});

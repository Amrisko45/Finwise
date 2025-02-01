import express from "express";
import db from "../db/db.js";

const router = express.Router();

router.use(express.urlencoded({ extended: true }));

// Add Budget - Modified to always add new entry
router.post("/add-budget", async (req, res) => {
  const { monthly_budget } = req.body;
  const user_id = process.env.USER_ID;
  console.log(req.body);

  if (!monthly_budget || monthly_budget <= 0) {
    return res
      .status(400)
      .json({ error: "Monthly Budget must be greater than 0" });
  }
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Always insert a new budget entry
      const [insertBudgetResult] = await connection.query(
        "INSERT INTO Budget (monthly_budget, last_defined_date, user_id) VALUES (?, NOW(), ?)",
        [monthly_budget, user_id]
      );

      const budget_id = insertBudgetResult.insertId;

      await connection.commit();

      res.status(201).json({
        message: "Budget added successfully",
        budget: {
          budget_id,
          monthly_budget,
          date: new Date().toISOString().split("T")[0],
        },
      });
    } catch (error) {
      await connection.rollback();
      console.error("Error adding budget:", error);
      res.status(500).json({ error: "Internal Server Error" });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ error: "Failed to connect to database" });
  }
});

// Get Budget Details - Modified to return all budgets but mark the latest
router.get("/budget-details", async (req, res) => {
  const user_id = process.env.USER_ID;
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const connection = await db.getConnection();

    // First, get the latest budget entry
    const [latestBudget] = await connection.query(
      `SELECT 
        b.budget_id, 
        b.monthly_budget, 
        b.last_defined_date,
        COALESCE(SUM(e.amount), 0) AS total_spent
      FROM Budget b
      LEFT JOIN Expenses e ON b.user_id = e.user_id 
        AND DATE(e.date) <= CURDATE()
        AND DATE(e.date) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      WHERE b.user_id = ?
      GROUP BY b.budget_id, b.monthly_budget, b.last_defined_date
      ORDER BY b.last_defined_date DESC, b.budget_id DESC
      LIMIT 1`,
      [user_id]
    );

    // Then, get all budget history
    const [allBudgets] = await connection.query(
      `SELECT 
        b.budget_id, 
        b.monthly_budget, 
        b.last_defined_date,
        COALESCE(SUM(e.amount), 0) AS total_spent
      FROM Budget b
      LEFT JOIN Expenses e ON b.user_id = e.user_id 
        AND DATE(e.date) <= DATE(b.last_defined_date)
        AND DATE(e.date) >= DATE_SUB(DATE(b.last_defined_date), INTERVAL 30 DAY)
      WHERE b.user_id = ?
      GROUP BY b.budget_id, b.monthly_budget, b.last_defined_date
      ORDER BY b.last_defined_date DESC, b.budget_id DESC`,
      [user_id]
    );

    connection.release();

    res.status(200).json({
      currentBudget: latestBudget[0] || null,
      budgets: allBudgets,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

export default router;

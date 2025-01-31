import express from "express";
import db from "../db/db.js";

const router = express.Router();

router.use(express.urlencoded({ extended: true }));

// Add Budget
router.post("/add-budget", async (req, res) => {
  const { monthly_budget } = req.body;
  const user_id = process.env.USER_ID;
  console.log(req.body);

  if (!monthly_budget) {
    return res.status(400).json({ error: "Monthly Budget is required" });
  }
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const connection = await db.getConnection(); // Await the connection
    try {
      await connection.beginTransaction();

      // Insert budget into the database
      const [insertBudgetResult] = await connection.query(
        "INSERT INTO Budget (monthly_budget, last_defined_date, user_id) VALUES (?, CURDATE(), ?)",
        [monthly_budget, user_id]
      );

      const budget_id = insertBudgetResult.insertId;

      await connection.commit();

      res.status(201).json({
        message: "Budget added successfully",
        expense: {
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

export default router;

// Get Budget Details
router.get("/budget-details", async (req, res) => {
  const user_id = process.env.USER_ID;
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const connection = await db.getConnection();

    // Fetch Data
    const [budgets] = await connection.query(
      `SELECT b.budget_id, 
              b.monthly_budget, 
              b.last_defined_date, 
              COALESCE(SUM(i.amount), 0) AS total_income,
              COALESCE(SUM(e.amount), 0) AS total_expenses,
              (COALESCE(SUM(i.amount), 0) - COALESCE(SUM(e.amount), 0)) AS current_savings
          FROM Budget b
          LEFT JOIN Income i ON b.user_id = i.user_id
          LEFT JOIN Expenses e ON b.user_id = e.user_id
          WHERE b.user_id = ?
          GROUP BY b.budget_id, b.monthly_budget`,
      [user_id]
    );

    connection.release();

    res.status(200).json({
      budgets,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

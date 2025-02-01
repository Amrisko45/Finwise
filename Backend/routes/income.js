import express from "express";
import db from "../db/db.js";

const router = express.Router();

//Middleware to parse the x-www-form-urlencoded payloads
router.use(express.urlencoded({ extended: true }));

router.post("/add-income", async (req, res) => {
  const { amount, frequency, source_name } = req.body;
  const user_id = process.env.USER_ID;
  console.log(req.body);

  //Input validation
  if (!amount || !frequency || !source_name) {
    return res
      .status(400)
      .json({ error: "Amount, Frequency and Source_name are required" });
  }

  if (isNaN(amount) || amount <= 0) {
    return res
      .status(400)
      .json({ error: "Amount must be a valid positive number" });
  }
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const connection = await db.getConnection();
    try {
      //begins transaction
      await connection.beginTransaction();

      //check if income exists
      const [sourceResult] = await connection.query(
        "SELECT source_id FROM Income_Source WHERE source_name = ?",
        [source_name]
      );

      let sourceId;
      if (sourceResult.length > 0) {
        //Source Exists,get its ID
        sourceId = sourceResult[0].source_id;
      } else {
        //Insert new source and retrieve its ID
        const [insertIncomeResult] = await connection.query(
          "INSERT INTO Income_Source (source_name) VALUES (?)",
          [source_name]
        );
        sourceId = insertIncomeResult.insertId;
      }
      //Insert the income with user_id from the environment variable
      const currentDate = new Date().toISOString().split("T")[0];
      const [insertIncomeResult] = await connection.query(
        "INSERT INTO Income (amount, date, user_id, source_id, frequency) VALUES (?, ?, ?, ?, ?)",
        [amount, currentDate, user_id, sourceId, frequency]
      );

      //commit transaction
      await connection.commit();

      //Send success response
      res.status(201).json({
        message: "Income added successfully",
        income: {
          income_id: insertIncomeResult.insertId,
          amount,
          date: currentDate, // Current date in YYYY-MM-DD format
          source_name,
          frequency,
        },
      });
    } catch (error) {
      //Roll back transaction in case of error
      await connection.rollback();
      console.error("Error adding income", error);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Database connection error:", err);
    res.status(500).json({ error: "Failed to connect to the database" });
  }
});

router.get("/income-with-sources", async (req, res) => {
  const user_id = process.env.USER_ID;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  //Fetch Income Details
  try {
    const connection = await db.getConnection();

    const [incomes] = await connection.query(
      `SELECT i.income_id, i.amount, i.date, i.user_id, s.source_id, s.source_name, i.frequency
FROM Income i
JOIN Income_Source s ON i.source_id = s.source_id
WHERE i.user_id = ?`,
      [user_id]
    );

    const [sources] = await connection.query("SELECT * FROM Income_Source");

    connection.release();

    res.status(200).json({
      incomes,
      sources,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

export default router;

import express from "express";
import db from '../db/db.js';

const router = express.Router();

// Middleware to parse x-www-form-urlencoded payloads
router.use(express.urlencoded({ extended: true }));

router.post('/add-expense', async (req, res) => {
    const { amount, category_name } = req.body;
    const user_id = process.env.USER_ID; // Access user_id from environment variables
    console.log(req.body);

    // Input validation
    if (!amount || !category_name) {
      return res.status(400).json({ error: 'Amount and category_name are required' });
    }

    if (!user_id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    try {
      const connection = await db.getConnection(); // Use the connection from db.js
      try {
        // Begin transaction
        await connection.beginTransaction();

        // Check if the category exists
        const [categoryResult] = await connection.query(
          'SELECT category_id FROM Expense_Category WHERE category_name = ?',
          [category_name]
        );

        let categoryId;
        if (categoryResult.length > 0) {
          // Category exists, get its ID
          categoryId = categoryResult[0].category_id;
        } else {
          // Insert new category and retrieve its ID
          const [insertCategoryResult] = await connection.query(
            'INSERT INTO Expense_Category (category_name) VALUES (?)',
            [category_name]
          );
          categoryId = insertCategoryResult.insertId;
        }

        // Insert the expense with user_id from the environment variable
        const [insertExpenseResult] = await connection.query(
          'INSERT INTO Expenses (amount, date, user_id, category_id, time) VALUES (?, CURDATE(), ?, ?, CURTIME())',
          [amount, user_id, categoryId] // Now using user_id from the environment variable
        );

        // Commit transaction
        await connection.commit();

        // Send success response
        res.status(201).json({
          message: 'Expense added successfully',
          expense: {
            expense_id: insertExpenseResult.insertId,
            amount,
            date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
            time: new Date().toLocaleTimeString(), // Time
            category_name,
          },
        });
      } catch (error) {
        // Rollback transaction in case of error
        await connection.rollback();
        console.error('Error adding expense:', error);
        res.status(500).json({ error: 'Internal server error' });
      } finally {
        connection.release(); // Release the connection back to the pool
      }
    } catch (err) {
      console.error('Database connection error:', err);
      res.status(500).json({ error: 'Failed to connect to the database' });
    }
});

export default router;

router.get('/expenses-with-categories', async (req, res) => {
  const user_id = process.env.USER_ID; // Assuming the user ID is stored in the environment variable

  if (!user_id) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const connection = await db.getConnection();

    // Fetch expenses along with category details
    const [expenses] = await connection.query(
      `SELECT e.expense_id, e.amount, e.date, e.time, c.category_name
       FROM Expenses e
       JOIN Expense_Category c ON e.category_id = c.category_id
       WHERE e.user_id = ?`,
      [user_id]
    );

    // Fetch all categories
    const [categories] = await connection.query('SELECT * FROM Expense_Category');

    connection.release();

    // Send both expenses and categories in the response
    res.status(200).json({
      expenses,
      categories,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

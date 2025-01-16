import express from 'express';
import bcrypt from 'bcrypt';
import db from '../db/db.js';

const router = express.Router();

// Middleware to parse x-www-form-urlencoded payloads
router.use(express.urlencoded({ extended: true }));

// Signup Route
router.post('/signup', async (req, res) => {
  const { first_name, last_name, email, password, gender } = req.body;

  // Validate input fields
  if (!first_name || !last_name || !email || !password || !gender) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if the email is already registered
    const checkQuery = 'SELECT * FROM Users WHERE email = ?';
    db.query(checkQuery, [email], async (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Database error', error: err });
      }

      if (results.length > 0) {
        // User already exists
        return res.status(400).json({ message: 'User is already registered with this email' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert new user
      const insertQuery = `
        INSERT INTO Users (first_name, last_name, email, password_hash, gender) 
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(insertQuery, [first_name, last_name, email, hashedPassword, gender], (err) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ message: 'Database error', error: err });
        }
        res.status(201).json({ message: 'User registered successfully' });
      });
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login Route
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = 'SELECT * FROM Users WHERE email = ?';
  db.query(query, [email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Database error', error: err });
    }

    // Check if user exists
    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    try {
      // Compare password hash
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Update last login
      const updateQuery = 'UPDATE Users SET last_login = NOW() WHERE user_id = ?';
      db.query(updateQuery, [user.user_id]);

      // Send response with user data including created_at
      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.user_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          gender: user.gender,
          created_at: user.created_at, // Include the created_at field in the response
          last_login: user.last_login, // Optionally include the last_login field
        }
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
});

export default router;

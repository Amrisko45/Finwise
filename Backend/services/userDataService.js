import mysql from "mysql2/promise";

const con = mysql.createPool({
  host: "localhost",
  user: process.env.MYSQL_USER || "root",
  port: process.env.MYSQL_PORT || 3306,
  password: process.env.MYSQL_PASS,
  database: "finance_trackerDB",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const fetchUserData = async (userId) => {
  try {
    // Fetch basic user info
    const [userRows] = await con.query(
      `SELECT user_id, first_name, last_name, email, created_at, last_login 
       FROM Users WHERE user_id = ?`,
      [userId]
    );

    // Fetch income data
    const [incomeRows] = await con.query(
      `SELECT i.amount, i.date, i.frequency, s.source_name 
       FROM Income i 
       JOIN Income_Source s ON i.source_id = s.source_id 
       WHERE i.user_id = ? 
       ORDER BY i.date DESC`,
      [userId]
    );

    // Fetch expense data
    const [expenseRows] = await con.query(
      `SELECT e.amount, e.date, c.category_name, e.time
       FROM Expenses e 
       JOIN Expense_Category c ON e.category_id = c.category_id 
       WHERE e.user_id = ? 
       ORDER BY e.date DESC, e.time DESC`,
      [userId]
    );

    // Fetch budget data
    const [budgetRows] = await con.query(
      `SELECT monthly_budget, last_defined_date 
       FROM Budget 
       WHERE user_id = ? 
       ORDER BY last_defined_date DESC 
       LIMIT 1`,
      [userId]
    );

    // Fetch financial goals
    const [goalRows] = await con.query(
      `SELECT goal_amount as target_amount, goal_deadline as deadline, description 
       FROM Financial_Goal 
       WHERE user_id = ? 
       ORDER BY goal_deadline`,
      [userId]
    );

    // Format the data
    return {
      user: userRows[0] || null,
      income: incomeRows.map(inc => ({
        amount: Number(inc.amount),
        date: inc.date.toISOString().split('T')[0],
        frequency: inc.frequency,
        source: inc.source_name
      })),
      expenses: expenseRows.map(exp => ({
        amount: Number(exp.amount),
        date: exp.date.toISOString().split('T')[0],
        category: exp.category_name,
        time: exp.time ? new Date(`1970-01-01T${exp.time}`).toLocaleTimeString() : null
      })),
      budget: budgetRows[0] || null,
      goals: goalRows.map(goal => ({
        target_amount: Number(goal.target_amount),
        deadline: goal.deadline?.toISOString().split('T')[0] || null,
        description: goal.description
      }))
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new Error('Failed to fetch user data');
  }
}; 
import Groq from "groq-sdk";
import mysql from "mysql2/promise";
import express from "express";
import session from "express-session";
import fetch from "node-fetch";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

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

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || "supersecretkey",
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 86400000, // 24 hours
  },
  resave: false,
  saveUninitialized: false,
};

// Finance keyword checker
const isFinanceRelated = (message) => {
  const financeKeywords = [
    "money",
    "finance",
    "bank",
    "invest",
    "spend",
    "expense",
    "income",
    "budget",
    "saving",
    "debt",
    "loan",
    "credit",
    "debit",
    "account",
    "salary",
    "payment",
    "bill",
    "tax",
    "insurance",
    "mortgage",
    "rent",
    "stock",
    "mutual fund",
    "bond",
    "crypto",
    "bitcoin",
    "ethereum",
    "portfolio",
    "dividend",
    "interest",
    "rate",
    "market",
    "trading",
    "price",
    "cost",
    "fee",
    "charge",
    "subscription",
    "earning",
    "profit",
    "loss",
    "balance",
    "transaction",
    "transfer",
    "wallet",
    "rupee",
    "₹",
    "rs",
    "inr",
    "financial",
    "goals",
    "health insurance",
    "stock",
    "stocks",
    "nifty",
    "sensex",
    "nse",
    "bse",
    "market",
    "ipo",
    "dividend",
    "pe ratio",
    "market cap",
    "mutual fund",
    "etf",
    "index fund",
    "bullion",
    "gold rate",
    "silver rate",
    "crude oil",
    "commodities",
    "crypto",
    "bitcoin",
    "ethereum",
    "blockchain",
  ];
  return financeKeywords.some((keyword) =>
    message.toLowerCase().includes(keyword.toLowerCase())
  );
};

const performWebSearch = async (query) => {
  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: query, gl: "in" }),
    });

    const data = await response.json();
    return (
      data.organic
        ?.map((result) =>
          `${result.title}: ${result.snippet} (${result.link})`.slice(0, 500)
        )
        .join("\n\n") || "No results found"
    );
  } catch (error) {
    console.error("Web search failed:", error);
    return null;
  }
};

const generateWebResponse = async (query, searchResults) => {
  const messages = [
    {
      role: "system",
      content: `You are a financial research assistant. Use these search results to answer the query. Follow these rules:
      1. Provide a concise, factual response (2-3 paragraphs)
      2. Always disclose that information is from web sources
      3. Never provide investment advice
      4. Highlight key points with bullet points
      5. Include relevant numbers/statistics when available
      6. End with a disclaimer about market risks`,
    },
    {
      role: "user",
      content: `Query: ${query}\n\nSearch Results:\n${searchResults}`,
    },
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: "llama3-70b-8192",
      temperature: 0.7,
      max_tokens: 500,
    });
    return completion.choices[0]?.message?.content.trim();
  } catch (error) {
    console.error("Web response generation failed:", error);
    return "I couldn't process the web results. Please try again later.";
  }
};

// Enhanced user data fetcher
const fetchUserData = async (userId) => {
  try {
    const [user] = await con.query(
      `SELECT user_id, first_name, last_name, email, gender, created_at, last_login 
       FROM Users WHERE user_id = ?`,
      [userId]
    );

    const [income] = await con.query(
      `SELECT i.amount, i.date, i.frequency, s.source_name 
       FROM Income i 
       JOIN Income_Source s ON i.source_id = s.source_id 
       WHERE i.user_id = ? 
       ORDER BY i.date DESC`,
      [userId]
    );

    const [expenses] = await con.query(
      `SELECT e.amount, e.date, c.category_name, e.time
       FROM Expenses e 
       JOIN Expense_Category c ON e.category_id = c.category_id 
       WHERE e.user_id = ? 
       ORDER BY e.date DESC, e.time DESC`,
      [userId]
    );

    const [budget] = await con.query(
      `SELECT monthly_budget, last_defined_date 
       FROM Budget 
       WHERE user_id = ? 
       ORDER BY last_defined_date DESC 
       LIMIT 1`,
      [userId]
    );

    const [goals] = await con.query(
      `SELECT goal_amount, goal_deadline, description 
       FROM Financial_Goal 
       WHERE user_id = ? 
       ORDER BY goal_deadline`,
      [userId]
    );

    const [incomeSources] = await con.query(
      "SELECT source_name FROM Income_Source"
    );

    const [expenseCategories] = await con.query(
      "SELECT category_name FROM Expense_Category"
    );

    return {
      user: user[0],
      income: income.map((inc) => ({
        amount: Number(inc.amount),
        date: inc.date.toISOString().split("T")[0],
        frequency: inc.frequency,
        source: inc.source_name,
      })),
      expenses: expenses.map((exp) => ({
        amount: Number(exp.amount),
        date: exp.date.toISOString().split("T")[0],
        category: exp.category_name,
        // Safe time formatting with error handling
        time: exp.time
          ? new Date(`1970-01-01T${exp.time}`).toLocaleTimeString()
          : null,
      })),
      budget: budget[0] || null,
      goals: goals.map((goal) => ({
        target_amount: goal.goal_amount,
        deadline: goal.goal_deadline?.toISOString().split("T")[0] || null,
        description: goal.description,
      })),
      incomeSources: incomeSources.map((src) => src.source_name),
      expenseCategories: expenseCategories.map((cat) => cat.category_name),
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Enhanced Groq response generator
const generateFinancialResponse = async (userData, chatHistory, prompt) => {
  const userName = userData.user?.first_name || "User";
  const totalIncome = userData.income.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const totalExpenses = userData.expenses.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const savings = totalIncome - totalExpenses;
  // Helper function to calculate months difference
  const getMonthsDiff = (deadline) => {
    const now = new Date();
    const end = new Date(deadline);
    return (
      (end.getFullYear() - now.getFullYear()) * 12 +
      (end.getMonth() - now.getMonth()) +
      1
    );
  };

  // Calculate goals progress
  const goalsProgress = userData.goals.map((goal) => {
    const monthsRemaining = Math.max(getMonthsDiff(goal.deadline), 1);
    const monthlyNeeded = goal.target_amount / monthsRemaining;

    return {
      description: goal.description,
      target: goal.target_amount,
      deadline: goal.deadline,
      monthlyRequired: monthlyNeeded.toFixed(2),
      achieved: savings >= goal.target_amount ? "✅" : "⚠️",
    };
  });

  const messages = [
    {
      role: "system",
      content: `You are Artha, a financial assistant. Follow these guidelines:
1. Provide concise, relevant financial insights using user data
2. Address ${userName} professionally
3. Current Financial Status:
   - Monthly Income: ₹${totalIncome}
   - Monthly Expenses: ₹${totalExpenses}
   - Monthly Savings: ₹${savings}
   - Current Budget: ${userData.budget?.monthly_budget || "Not set"}
4. Financial Goals: ${
        goalsProgress.length > 0
          ? goalsProgress
              .map(
                (g) =>
                  `${g.achieved} ${g.description}: ₹${g.target} by ${g.deadline} (Requires ₹${g.monthlyRequired}/month)`
              )
              .join("\n   ")
          : "No active goals"
      }
5. For real-time data queries, respond EXACTLY: "WEB_SEARCH: [query]"
6. Never provide investment advice
7. Analyze goal progress and suggest specific adjustments
8. Keep responses under 4 lines with emojis
9. End with a relevant follow-up question`,
    },
    {
      role: "user",
      content: `Chat History: ${chatHistory.slice(-3).join("\n")}
      New Query: ${prompt}`,
    },
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model: "llama3-70b-8192",
      temperature: 0.5,
      max_tokens: 150,
    });
    return completion.choices[0]?.message?.content.trim();
  } catch (error) {
    console.error("Groq API error:", error);
    return "I'm having trouble processing your request. Please try again later.";
  }
};

// Enhanced route handler
const router = express.Router();
router.use(session(sessionConfig));

router.post("/financial-query", async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    if (!prompt || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Initialize session chat history first
    req.session.chatHistory = req.session.chatHistory || [];
    req.session.chatHistory.push(`User: ${prompt}`);

    // Check query relevance early
    if (!isFinanceRelated(prompt)) {
      const response =
        "I specialize in financial queries. How can I assist with money matters?";
      req.session.chatHistory.push(`Bot: ${response}`);
      return res.json({ response });
    }

    // Fetch user data before any processing
    const userData = await fetchUserData(userId);

    // Generate initial response with proper user data
    let response = await generateFinancialResponse(
      userData,
      req.session.chatHistory,
      prompt
    );

    // Handle web search if needed
    if (response.startsWith("WEB_SEARCH: ")) {
      const searchQuery = response.replace("WEB_SEARCH: ", "");
      const searchResults = await performWebSearch(searchQuery);

      response = searchResults
        ? await generateWebResponse(searchQuery, searchResults)
        : "I couldn't access current market data. Please try again later.";
    }

    // Update session with final response
    req.session.chatHistory.push(`Bot: ${response}`);
    req.session.save();

    res.json({
      response,
      financialSnapshot: {
        income: userData.income.length,
        expenses: userData.expenses.length,
        latestBudget: userData.budget,
      },
    });
  } catch (error) {
    console.error("Processing error:", error);
    res.status(500).json({
      error: "Failed to process query",
      details: process.env.NODE_ENV === "development" ? error.message : null,
    });
  }
});

export default router;

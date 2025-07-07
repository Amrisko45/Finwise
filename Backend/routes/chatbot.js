import Groq from "groq-sdk";
import mysql from "mysql2/promise";
import express from "express";
import session from "express-session";
import fetch from "node-fetch";
import { fetchUserData } from "../services/userDataService.js";

// Initialize services
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const dbPool = mysql.createPool({
  host: process.env.MYSQL_HOST || "localhost",
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

// Finance keyword checker - simplified with regex
const isFinanceRelated = (message) => {
  const financeKeywords = /\b(money|finance|bank|invest|spend|expense|income|budget|saving|debt|loan|credit|debit|account|salary|payment|bill|tax|insurance|mortgage|rent|stock|mutual fund|bond|crypto|bitcoin|ethereum|portfolio|dividend|interest|rate|market|trading|price|cost|fee|charge|subscription|earning|profit|loss|balance|transaction|transfer|wallet|rupee|₹|rs|inr|financial|goals|health insurance|nifty|sensex|nse|bse|ipo|pe ratio|market cap|etf|index fund|bullion|gold rate|silver rate|crude oil|commodities|blockchain|chit fund|chitty|kuree|committee|ponzi scheme|pyramid scheme)\b/i;
  return financeKeywords.test(message);
};

// Enhanced Web Search Function
const performMarketDataSearch = async (query) => {
  if (!process.env.SERPER_API_KEY) {
    console.error("SERPER_API_KEY is not configured");
    return `I apologize, but I'm currently unable to perform real-time market data searches.`;
  }

  try {
    const response = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": process.env.SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        q: `${query} site:moneycontrol.com OR site:valueresearchonline.com OR site:morningstar.in OR site:screener.in`, 
        gl: "in" 
      }),
    });

    if (!response.ok) {
      throw new Error(`Search API returned status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.organic || data.organic.length === 0) {
      return "I couldn't find relevant market data. Please refine your search query.";
    }

    return data.organic
      .slice(0, 3) // Limit to top 3 results for conciseness
      .map((result) => `${result.title}: ${result.snippet} (${result.link})`)
      .join("\n\n");
  } catch (error) {
    console.error("Market data search failed:", error);
    return `I apologize, but I'm having trouble accessing real-time market data. Please try again later.`;
  }
};

// Enhanced market analysis response generator
const generateMarketAnalysisResponse = async (query, searchResults) => {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an advanced financial research assistant. Analyze the search results to provide comprehensive market insights with detailed analysis of trends, performance metrics, and key financial indicators. Include educational context and highlight both opportunities and risks.`
        },
        {
          role: "user",
          content: `Query: ${query}\n\nSearch Results:\n${searchResults}`
        }
      ],
      model: "llama3-70b-8192",
      temperature: 0.7,
      max_tokens: 800,
    });

    return completion.choices[0]?.message?.content.trim() + 
      "\n\n⚠️ Note: This analysis is based on historical data. Market conditions change rapidly and past performance does not guarantee future results.";
  } catch (error) {
    console.error("Market analysis generation failed:", error);
    return `I apologize, but I'm having trouble generating market analysis. Please try again later.`;
  }
};

// Helper function to calculate years difference between dates
const yearsDifference = (date1, date2) => {
  const diffTime = Math.abs(date2 - date1);
  const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
  return Math.max(diffYears, 0.1); // Minimum 0.1 years to avoid division by zero
};

// Analyze user portfolio - streamlined
const analyzeUserPortfolio = (userData) => {
  // Calculate key financial metrics
  const totalIncome = userData.income.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = userData.expenses.reduce((sum, item) => sum + item.amount, 0);
  const monthlySavings = totalIncome - totalExpenses;
  
  // Calculate expense breakdown by category
  const expensesByCategory = userData.expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});
  
  // Sort categories by expense amount (descending)
  const sortedCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: ((amount / totalExpenses) * 100).toFixed(1)
    }));
  
  // Calculate savings rate
  const savingsRate = totalIncome > 0 ? ((monthlySavings / totalIncome) * 100).toFixed(1) : 0;
  
  // Determine investment capacity and emergency fund status
  const targetEmergencyFund = totalExpenses * 6;
  const currentEmergencyFund = userData.savings?.emergency_fund || 0;
  const emergencyFundStatus = currentEmergencyFund >= targetEmergencyFund ? 
    "Fully Funded" : 
    `Building (${((currentEmergencyFund / targetEmergencyFund) * 100).toFixed(0)}%)`;
  
  // Calculate investment capacity
  const investmentCapacity = monthlySavings > 0 ? 
    (currentEmergencyFund >= targetEmergencyFund ? monthlySavings * 0.8 : monthlySavings * 0.3) : 
    0;
  
  // Calculate risk profile
  const userAge = userData.user?.age || 35;
  const timeHorizon = userData.goals?.length > 0 
    ? Math.max(...userData.goals.map(g => g.deadline ? yearsDifference(new Date(), new Date(g.deadline)) : 5))
    : 5;
  
  const riskScore = (100 - userAge) + 
                   (userData.income.length > 1 ? 10 : 0) + 
                   (timeHorizon * 2) + 
                   (parseFloat(savingsRate) / 5);
  
  const riskProfile = riskScore > 70 ? "Aggressive" : riskScore > 40 ? "Moderate" : "Conservative";
  
  // Process goals
  const processedGoals = userData.goals.map(goal => {
    const timeRemaining = goal.deadline ? yearsDifference(new Date(), new Date(goal.deadline)) : 0;
    const monthlyRequired = timeRemaining > 0 ? goal.target_amount / (timeRemaining * 12) : 0;
    
    return {
      description: goal.description,
      target: goal.target_amount,
      timeframe: timeRemaining > 0 ? `${timeRemaining.toFixed(1)} years` : "No deadline",
      monthlyRequired,
      feasibility: monthlyRequired <= investmentCapacity ? "Achievable" : "Challenging"
    };
  });
  
  return {
    financialSummary: {
      monthlyIncome: totalIncome,
      monthlyExpenses: totalExpenses,
      monthlySavings,
      annualSavings: monthlySavings * 12,
      savingsRate: `${savingsRate}%`,
      emergencyFundStatus,
    },
    topExpenses: sortedCategories.slice(0, 5),
    investmentProfile: {
      monthlyInvestmentCapacity: investmentCapacity,
      annualInvestmentCapacity: investmentCapacity * 12,
      riskProfile,
      riskScore,
      suggestedInvestmentHorizon: timeHorizon,
    },
    goals: processedGoals
  };
};

// Suspicious transaction detector - optimized
const detectSuspiciousTransactions = (transactions) => {
  if (!transactions || transactions.length < 4) {
    return []; // Not enough data for meaningful analysis
  }

  const suspiciousPatterns = [];
  const amounts = transactions.map(t => t.amount);
  const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.reduce((sum, amount) => sum + Math.pow(amount - avgAmount, 2), 0) / amounts.length);
  const threshold = avgAmount + (3 * stdDev);
  
  // Check for unusually large transactions
  const unusualTransactions = transactions.filter(t => t.amount > threshold);
  if (unusualTransactions.length > 0) {
    suspiciousPatterns.push({
      pattern: "Unusually large transactions",
      transactions: unusualTransactions,
      recommendations: [
        "Verify the source and purpose of these transactions",
        "Ensure proper documentation is maintained",
        "Check if these align with your expected financial activities"
      ]
    });
  }
  
  // Check for rapid sequence of transactions
  const sortedByDate = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  for (let i = 0; i < sortedAByDate.length - 3; i++) {
    const daysDiff = (new Date(sortedByDate[i + 3].date) - new Date(sortedByDate[i].date)) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 2) {
      suspiciousPatterns.push({
        pattern: "Rapid sequence of transactions",
        transactions: sortedByDate.slice(i, i + 4),
        recommendations: [
          "Review these clustered transactions",
          "Check if they represent a pattern of structured transactions",
          "Ensure they are for legitimate purposes"
        ]
      });
      break;
    }
  }
  
  // Check for round figure transactions
  const roundFigureTransactions = transactions.filter(t => t.amount % 1000 === 0 && t.amount >= 10000);
  if (roundFigureTransactions.length > 3) {
    suspiciousPatterns.push({
      pattern: "Multiple large round-figure transactions",
      transactions: roundFigureTransactions,
      recommendations: [
        "Maintain proper documentation for these transactions",
        "Ensure they are properly reported in financial statements",
        "Verify the source and purpose"
      ]
    });
  }
  
  return suspiciousPatterns;
};

// Generate tailored investment recommendations based on user data
const generateInvestmentRecommendations = (userProfile) => {
  // Asset allocation based on risk profile
  const allocations = {
    "Aggressive": { equity: "65-75%", debt: "15-25%", gold: "5-10%", cash: "0-5%" },
    "Moderate": { equity: "40-60%", debt: "30-40%", gold: "5-15%", cash: "5-10%" },
    "Conservative": { equity: "20-30%", debt: "50-60%", gold: "10-15%", cash: "5-10%" }
  };
  
  // Investment approaches
  const monthlyCapacity = userProfile.investmentProfile.monthlyInvestmentCapacity;
  const approach = monthlyCapacity >= 50000 ? "Comprehensive Portfolio" :
                   monthlyCapacity >= 10000 ? "Core & Satellite" : 
                   "Simple & Systematic";
  
  // Investment type recommendations
  const recommendations = {
    equity: {
      "Aggressive": [
        "Index Funds tracking broader markets",
        "Sector-specific funds in high-growth sectors",
        "Mid and Small Cap oriented funds"
      ],
      "Moderate": [
        "Large Cap oriented funds",
        "Flexi Cap funds with dynamic allocation",
        "Balanced Advantage Funds"
      ],
      "Conservative": [
        "Large Cap Index Funds",
        "Equity Income Funds",
        "Value-oriented equity funds"
      ]
    },
    debt: {
      "Aggressive": [
        "Dynamic Bond Funds",
        "Credit Risk Funds (selective)",
        "Short Duration Funds"
      ],
      "Moderate": [
        "Corporate Bond Funds",
        "Banking & PSU Funds",
        "Short to Medium Duration Funds"
      ],
      "Conservative": [
        "Liquid Funds",
        "Ultra Short Duration Funds",
        "Government Securities Funds"
      ]
    },
    alternative: [
      "Gold Funds or Sovereign Gold Bonds",
      "International Fund of Funds",
      approach === "Comprehensive Portfolio" ? "REITs & InvITs for real estate exposure" : null
    ].filter(Boolean)
  };
  
  const riskProfile = userProfile.investmentProfile.riskProfile;
  
  return {
    assetAllocation: allocations[riskProfile],
    approach,
    investmentStrategy: `Based on your ${riskProfile.toLowerCase()} risk profile and monthly investment capacity of ₹${monthlyCapacity.toFixed(2)}, a ${approach.toLowerCase()} approach is recommended with the suggested asset allocation.`,
    recommendedInvestmentTypes: {
      equity: recommendations.equity[riskProfile],
      debt: recommendations.debt[riskProfile],
      alternative: recommendations.alternative
    },
    considerationFactors: [
      "Current market conditions",
      "Tax implications",
      "Liquidity requirements",
      "Time horizon for various financial goals",
      "Existing portfolio composition"
    ]
  };
};

// Helper function to classify query intent - simplified with more precise patterns
const classifyQueryIntent = (query) => {
  const normalizedQuery = query.toLowerCase();
  
  if (/\b(market|stock price|mutual fund|performance|returns)\b/.test(normalizedQuery)) {
    return "MARKET_DATA";
  }
  
  if (/\b(analyze|portfolio|how am i doing|financial health)\b/.test(normalizedQuery)) {
    return "PORTFOLIO_ANALYSIS";
  }
  
  if (/\b(recommend|suggest|invest|allocate)\b/.test(normalizedQuery)) {
    return "INVESTMENT_RECOMMENDATIONS";
  }
  
  if (/\b(fraud|suspicious|unusual transaction|detect)\b/.test(normalizedQuery)) {
    return "FRAUD_DETECTION";
  }
  
  return "GENERAL_FINANCE";
};

// Generate portfolio analysis response - simplified
const generatePortfolioResponse = (analysis) => {
  return `
📊 Financial Health Analysis:

Monthly Summary:
- Income: ₹${analysis.financialSummary.monthlyIncome.toFixed(2)}
- Expenses: ₹${analysis.financialSummary.monthlyExpenses.toFixed(2)}
- Savings: ₹${analysis.financialSummary.monthlySavings.toFixed(2)} (${analysis.financialSummary.savingsRate} of income)
- Emergency Fund: ${analysis.financialSummary.emergencyFundStatus}

Top Expense Categories:
${analysis.topExpenses.map(exp => `- ${exp.category}: ₹${exp.amount.toFixed(2)} (${exp.percentage}%)`).join('\n')}

Investment Profile:
- Risk Profile: ${analysis.investmentProfile.riskProfile} (Score: ${analysis.investmentProfile.riskScore.toFixed(0)}/100)
- Monthly Investment Capacity: ₹${analysis.investmentProfile.monthlyInvestmentCapacity.toFixed(2)}
- Annual Investment Potential: ₹${analysis.investmentProfile.annualInvestmentCapacity.toFixed(2)}

Financial Goals:
${analysis.goals.map(goal => `- ${goal.description}: ₹${goal.target} in ${goal.timeframe} (Requires ₹${goal.monthlyRequired.toFixed(2)}/month - ${goal.feasibility})`).join('\n')}

Would you like specific recommendations based on this analysis?
  `;
};

// Generate investment recommendations response - simplified
const generateRecommendationsResponse = (recommendations, userProfile) => {
  return `
💼 Investment Strategy Recommendations:

Based on your ${userProfile.investmentProfile.riskProfile} risk profile and monthly investment capacity of ₹${userProfile.investmentProfile.monthlyInvestmentCapacity.toFixed(2)}, here's a suggested approach:

Recommended Asset Allocation:
- Equity: ${recommendations.assetAllocation.equity}
- Debt: ${recommendations.assetAllocation.debt}
- Gold: ${recommendations.assetAllocation.gold}
- Cash: ${recommendations.assetAllocation.cash}

Approach: ${recommendations.approach}
${recommendations.investmentStrategy}

Recommended Investment Categories:

1. Equity Instruments:
${recommendations.recommendedInvestmentTypes.equity.map(item => `   - ${item}`).join('\n')}

2. Debt Instruments:
${recommendations.recommendedInvestmentTypes.debt.map(item => `   - ${item}`).join('\n')}

3. Alternative Investments:
${recommendations.recommendedInvestmentTypes.alternative.map(item => `   - ${item}`).join('\n')}

Key Consideration Factors:
${recommendations.considerationFactors.map(factor => `- ${factor}`).join('\n')}

Would you like more details on any specific investment category?
  `;
};

// Generate fraud detection response - simplified
const generateFraudDetectionResponse = (suspiciousPatterns) => {
  if (suspiciousPatterns.length === 0) {
    return `
🛡️ Transaction Security Analysis:

No suspicious transaction patterns were detected in your financial history. This is a positive sign regarding your financial security.

Regular transaction monitoring tips:
- Review bank and credit card statements monthly
- Set up alerts for unusually large transactions
- Monitor your credit report quarterly
- Be vigilant about small unauthorized charges (they often precede larger fraud)
- Secure your financial accounts with strong passwords and two-factor authentication

Would you like more security tips?
    `;
  }
  
  return `
⚠️ Transaction Security Analysis:

${suspiciousPatterns.length} potential concern(s) identified in your transaction history:

${suspiciousPatterns.map((pattern, index) => `
${index + 1}. ${pattern.pattern}:
   - ${pattern.transactions.length} transactions identified
   - Date range: ${new Date(Math.min(...pattern.transactions.map(t => new Date(t.date)))).toLocaleDateString()} to ${new Date(Math.max(...pattern.transactions.map(t => new Date(t.date)))).toLocaleDateString()}
   - Total amount: ₹${pattern.transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)}

   Recommendations:
   ${pattern.recommendations.map(rec => `   - ${rec}`).join('\n')}
`).join('\n')}
General security recommendations:
- Review all flagged transactions carefully
- Ensure proper documentation for large or unusual transactions
- Consider setting up transaction alerts for unusual activity
- Monitor your accounts regularly

Would you like more details on any specific pattern?
  `;
};

const generateFinancialResponse = async (userData, chatHistory, prompt) => {
  try {
    const systemMessage = {
      role: "system",
      content: `You are a personal finance assistant. Provide clear, concise, and insightful responses to user questions related to budgeting, saving, investing, loans, taxes, and other money matters. Use user-specific context when available, and always be friendly and helpful.`,
    };

    // Filter valid messages only
    const filteredChatHistory = (chatHistory || []).slice(-5).filter(
      (msg) => msg && typeof msg === "object" && "role" in msg && "content" in msg
    );

    const userPromptMessage = {
      role: "user",
      content: `User Data: ${JSON.stringify(userData)}\n\nPrompt: ${prompt}`,
    };

    const messages = [systemMessage, ...filteredChatHistory, userPromptMessage];

    const response = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages,
      temperature: 0.7,
      max_tokens: 700,
    });

    return response.choices[0]?.message?.content.trim() || "I'm sorry, I couldn't generate a financial response at the moment.";
  } catch (error) {
    console.error("General finance response generation failed:", error);
    return "Sorry, I'm having trouble providing financial advice right now. Please try again later.";
  }
};

// Router setup
const router = express.Router();
router.use(session(sessionConfig));

router.post("/financial-query", async (req, res) => {
  try {
    const { prompt, userId } = req.body;
    if (!prompt || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Initialize session chat history
    req.session.chatHistory = req.session.chatHistory || [];
    req.session.chatHistory.push(`User: ${prompt}`);

    // Fetch user data
    const userData = await fetchUserData(userId);
    
    // Identify query intent and generate appropriate response
    const queryIntent = classifyQueryIntent(prompt);
    let response;
    
    switch (queryIntent) {
      case "MARKET_DATA":
        const searchResults = await performMarketDataSearch(prompt);
        response = await generateMarketAnalysisResponse(prompt, searchResults);
        break;
        
      case "PORTFOLIO_ANALYSIS":
        const portfolioAnalysis = analyzeUserPortfolio(userData);
        response = generatePortfolioResponse(portfolioAnalysis);
        break;
        
      case "INVESTMENT_RECOMMENDATIONS":
        const userProfile = analyzeUserPortfolio(userData);
        const recommendations = generateInvestmentRecommendations(userProfile);
        response = generateRecommendationsResponse(recommendations, userProfile);
        break;
        
      case "FRAUD_DETECTION":
        const allTransactions = [
          ...userData.income, 
          ...userData.expenses.map(e => ({ ...e, amount: -e.amount }))
        ];
        const suspiciousPatterns = detectSuspiciousTransactions(allTransactions);
        response = generateFraudDetectionResponse(suspiciousPatterns);
        break;
        
      default:
        response = await generateFinancialResponse(userData, req.session.chatHistory, prompt);
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
        riskProfile: queryIntent === "INVESTMENT_RECOMMENDATIONS" ? 
          generateInvestmentRecommendations(analyzeUserPortfolio(userData)).approach : null
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
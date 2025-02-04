import React from "react";
import { useState, useEffect } from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
import { indigo, grey } from "@mui/material/colors";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  FaArrowUp,
  FaArrowDown,
  FaPiggyBank,
  FaWallet,
  FaBell,
  FaCommentSlash,
} from "react-icons/fa";
import "./dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  incomeData: number[];
  expenseData: number[];
  savingsData: number[];
  categoryData: number[];
}

interface FinancialGoal {
  goal_id: string;
  goal_amount: number;
  description: string;
  current_savings_toward_goals: number;
  remaining_days: number;
  percentage_saved: number;
}

export interface BudgetUtilization {
  budgetUtilization: number;
  totalExpenses: number;
  monthlyBudget: number;
}

export interface BudgetData {
  utilization: number;
  expenses: number;
  budget: number;
}

interface ExpenseDistribution {
  label: string;
  value: number;
}

interface SavingsTrend {
  month: string;
  savings: number;
}

const Dashboard: React.FC = () => {
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [totalSaving, setTotalSaving] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingsTrends, setSavingsTrends] = useState<SavingsTrend[]>([]);
  const [expenseDistribution, setExpenseDistribution] = useState<
    ExpenseDistribution[]
  >([]);
  const [budgetData, setBudgetData] = useState({
    utilization: 0,
    expenses: 0,
    budget: 0,
  });
  const [financialGoalDetails, setFinancialGoalDetails] = useState<
    FinancialGoal[]
  >([]);
  const [lineChartData, setLineChartData] = useState({
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "Expenses",
        data: [] as number[],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "Income",
        data: [] as number[],
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
    ],
  });

  const chartData: ChartData = {
    incomeData: [12000, 13500, 12500, 14000, 13000, 14500],
    expenseData: [8000, 8500, 8200, 8700, 8400, 8900],
    savingsData: [4000, 5000, 4300, 5300, 4600, 5600],
    categoryData: [3500, 2200, 1800, 1150],
  };
  useEffect(() => {
    const fetchFinancialOverview = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch financial overview (total income, expenses, savings)
        const overviewResponse = await fetch(
          "http://localhost:5001/api/get-details"
        );
        if (!overviewResponse.ok) {
          throw new Error(`HTTP error! Status: ${overviewResponse.status}`);
        }
        const { financialOverview } = await overviewResponse.json();
        console.log("Fetched financial overview:", financialOverview);

        setTotalIncome(financialOverview.total_income);
        setTotalExpense(financialOverview.total_expenses);
        setTotalSaving(financialOverview.savings);

        // Fetch monthly income and expense data
        const monthlyResponse = await fetch(
          "http://localhost:5001/api/get-monthly-data"
        );
        if (!monthlyResponse.ok) {
          throw new Error(`HTTP error! Status: ${monthlyResponse.status}`);
        }
        const { monthlyData } = await monthlyResponse.json();
        console.log("Fetched monthly data:", monthlyData);

        // Update lineChartData with fetched monthly data
        setLineChartData((prevData) => ({
          ...prevData,
          datasets: [
            {
              ...prevData.datasets[0],
              data: monthlyData.expenses,
            },
            {
              ...prevData.datasets[1],
              data: monthlyData.income,
            },
          ],
        }));

        // Fetch budget utilization data
        const budgetResponse = await fetch(
          "http://localhost:5001/api/budget-utilization"
        );
        if (!budgetResponse.ok) {
          throw new Error(`HTTP error! Status: ${budgetResponse.status}`);
        }
        const { budgetUtilization, totalExpenses, monthlyBudget } =
          await budgetResponse.json();
        console.log("Fetched budget utilization data:", budgetUtilization);

        setBudgetData({
          utilization: budgetUtilization,
          expenses: totalExpenses,
          budget: monthlyBudget,
        });

        const goalsResponse = await fetch(
          "http://localhost:5001/api/financial-goal-progress"
        );
        if (!goalsResponse.ok)
          throw new Error(`HTTP error! Status: ${goalsResponse.status}`);
        const { financialGoals } = await goalsResponse.json();

        setFinancialGoalDetails(financialGoals);

        const expenseResponse = await fetch(
          "http://localhost:5001/api/expense-distribution"
        );
        if (!expenseResponse.ok)
          throw new Error(`HTTP error! Status: ${expenseResponse.status}`);
        const expenseData = await expenseResponse.json();
        setExpenseDistribution(expenseData);

        const trendsResponse = await fetch(
          "http://localhost:5001/api/savings-trends-overtime"
        );
        if (!trendsResponse.ok)
          throw new Error(`HTTP error! Status: ${trendsResponse.status}`);
        const trendsData = await trendsResponse.json();

        // Transform month format from 'YYYY-MM' to 'MMM'
        const transformedTrends = trendsData.map((trend: any) => ({
          month: new Date(`${trend.month}-01`).toLocaleDateString("en-US", {
            month: "short",
          }),
          savings: trend.savings,
        }));

        setSavingsTrends(transformedTrends);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setError("Failed to fetch financial data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialOverview();
  }, []);

  const generateColors = (count: number) => {
    const baseColors = [
      "#4f46e5",
      "#6366f1",
      "#818cf8",
      "#a5b4fc",
      "#10b981",
      "#059669",
      "#34d399",
      "#6ee7b7",
      "#f59e0b",
      "#d97706",
      "#fbbf24",
      "#fcd34d",
    ];
    return Array.from(
      { length: count },
      (_, i) => baseColors[i % baseColors.length]
    );
  };

  // Currency formatting function
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: grey[100],
        },
      },
      title: {
        display: true,
        text: "Monthly Financial Overview",
        color: grey[100],
      },
    },
    scales: {
      x: {
        ticks: { color: grey[100] },
        grid: { color: grey[700] },
      },
      y: {
        ticks: { color: grey[100] },
        grid: { color: grey[700] },
      },
    },
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Analyze your Finances</h1>
        <div className="header-notification">
          <FaBell className="icon" />
          <span>Current Status: All systems normal</span>
        </div>
      </header>

      <div className="financial-overview-grid">
        {/* Income Card */}
        <div className="metric-card income">
          <div className="metric-icon">
            <FaArrowUp />
          </div>
          <div className="metric-content">
            <h3>Monthly Income</h3>
            <p className="metric-value">{formatCurrency(totalIncome)}</p>
            <div className="metric-trend">
              <span className="positive">+12%</span> from last month
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="metric-card expenses">
          <div className="metric-icon">
            <FaArrowDown />
          </div>
          <div className="metric-content">
            <h3>Monthly Expenses</h3>
            <p className="metric-value">{formatCurrency(totalExpense)}</p>
            <div className="metric-trend">
              <span className="negative">-8%</span> from last month
            </div>
          </div>
        </div>

        {/* Savings Card */}
        <div className="metric-card savings">
          <div className="metric-icon">
            <FaPiggyBank />
          </div>
          <div className="metric-content">
            <h3>Total Savings</h3>
            <p className="metric-value">{formatCurrency(totalSaving)}</p>
            <div className="metric-trend">
              <span className="positive">+15%</span> savings rate
            </div>
          </div>
        </div>

        {/* Budget Utilization */}
        <div className="metric-card budget">
          <div className="metric-icon">
            <FaWallet />
          </div>
          <div className="metric-content">
            <h3>Budget Utilization</h3>
            <div className="progress-container">
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(budgetData.utilization, 100)}%`, // Cap at 100%
                  backgroundColor:
                    budgetData.utilization > 100 ? "#ef4444" : "#4f46e5", // Red if over budget
                }}
              >
                <span>{budgetData.utilization.toFixed(1)}%</span>
              </div>
            </div>
            <div className="budget-details">
              <span>{formatCurrency(budgetData.expenses)}</span>
              <span>/ {formatCurrency(budgetData.budget)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="visualization-section">
        <div className="chart-card">
          <h2>Income vs Expenses Trend</h2>
          <Line data={lineChartData} options={lineChartOptions} />
        </div>

        <div className="chart-card">
          <h2>Savings Trend Over Time</h2>
          <Bar
            data={{
              labels: savingsTrends.map((trend) => trend.month),
              datasets: [
                {
                  label: "Savings",
                  data: savingsTrends.map((trend) => trend.savings),
                  backgroundColor: "rgba(16, 185, 129, 0.3)",
                  borderColor: "#10b981",
                  borderWidth: 2,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top",
                  labels: {
                    color: grey[100],
                  },
                },
              },
              scales: {
                x: {
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                  ticks: {
                    color: grey[100],
                  },
                },
                y: {
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                  ticks: {
                    color: grey[100],
                    callback: (value) => `₹${value}`,
                  },
                },
              },
            }}
          />
        </div>

        <div className="chart-card">
          <h2>Expense Distribution</h2>
          <div className="pie-chart-container">
            {expenseDistribution.length > 0 ? (
              <Pie
                data={{
                  labels: expenseDistribution.map((item) => item.label),
                  datasets: [
                    {
                      data: expenseDistribution.map((item) => item.value),
                      backgroundColor: generateColors(
                        expenseDistribution.length
                      ),
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      position: "right",
                      labels: {
                        color: grey[100],
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="no-data">No expense data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="goals-section">
        <div className="goals-card">
          <h2>Financial Goals Progress</h2>
          {financialGoalDetails.length > 0 ? (
            financialGoalDetails.map((goal, index) => (
              <div key={goal.goal_id} className="goal-item">
                <div className="goal-header">
                  <h3>{goal.description}</h3>
                  <span className="days-remaining">
                    {goal.remaining_days} days left
                  </span>
                </div>
                <div className="progress-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${Math.min(goal.percentage_saved, 100)}%`,
                    }}
                  >
                    <span>{Math.round(goal.percentage_saved)}%</span>
                  </div>
                </div>
                <div className="goal-stats">
                  <span>
                    Saved: {formatCurrency(goal.current_savings_toward_goals)}
                  </span>
                  <span>Target: {formatCurrency(goal.goal_amount)}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-goals">No financial goals found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

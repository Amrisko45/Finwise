import React from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
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

interface FinancialData {
  income: number;
  expenses: number;
  savings: number;
  budgetUtilization: number;
}

interface ChartData {
  incomeData: number[];
  expenseData: number[];
  savingsData: number[];
  categoryData: number[];
}

interface FinancialGoal {
  name: string;
  completion: number;
  daysRemaining: number;
  currentSavings: number;
  targetAmount: number;
}

const Dashboard: React.FC = () => {
  // Sample data
  const financialData: FinancialData = {
    income: 12500,
    expenses: 8450,
    savings: 4050,
    budgetUtilization: 68,
  };

  const chartData: ChartData = {
    incomeData: [12000, 13500, 12500, 14000, 13000, 14500],
    expenseData: [8000, 8500, 8200, 8700, 8400, 8900],
    savingsData: [4000, 5000, 4300, 5300, 4600, 5600],
    categoryData: [3500, 2200, 1800, 1150],
  };

  const goals: FinancialGoal[] = [
    {
      name: "New Car Fund",
      completion: 75,
      daysRemaining: 45,
      currentSavings: 30000,
      targetAmount: 40000,
    },
    {
      name: "Emergency Fund",
      completion: 60,
      daysRemaining: 90,
      currentSavings: 12000,
      targetAmount: 20000,
    },
  ];

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
            <p className="metric-value">
              ${financialData.income.toLocaleString()}
            </p>
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
            <p className="metric-value">
              ${financialData.expenses.toLocaleString()}
            </p>
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
            <p className="metric-value">
              ${financialData.savings.toLocaleString()}
            </p>
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
                style={{ width: `${financialData.budgetUtilization}%` }}
              >
                <span>{financialData.budgetUtilization}%</span>
              </div>
            </div>
            <div className="budget-details">
              <span>${financialData.expenses.toLocaleString()}</span>
              <span>/${financialData.income.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="visualization-section">
        <div className="chart-card">
          <h2>Income vs Expenses Trend</h2>
          <Line
            data={{
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
              datasets: [
                {
                  label: "Income",
                  data: chartData.incomeData,
                  borderColor: "#4f46e5",
                  backgroundColor: "rgba(79, 70, 229, 0.1)",
                  tension: 0.4,
                },
                {
                  label: "Expenses",
                  data: chartData.expenseData,
                  borderColor: "#ef4444",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  tension: 0.4,
                },
              ],
            }}
          />
        </div>

        <div className="chart-card">
          <h2>Savings Trend Over Time (Bar)</h2>
          <Bar
            data={{
              labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
              datasets: [
                {
                  label: "Savings",
                  data: chartData.savingsData,
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
                },
              },
              scales: {
                x: {
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                  ticks: {
                    color: "#fff",
                  },
                },
                y: {
                  grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                  },
                  ticks: {
                    color: "#fff",
                  },
                },
              },
            }}
          />
        </div>

        <div className="chart-card">
          <h2>Expense Distribution</h2>
          <div className="pie-chart-container">
            <Pie
              data={{
                labels: ["Housing", "Transport", "Food", "Entertainment"],
                datasets: [
                  {
                    data: chartData.categoryData,
                    backgroundColor: [
                      "#4f46e5",
                      "#6366f1",
                      "#818cf8",
                      "#a5b4fc",
                    ],
                  },
                ],
              }}
            />
          </div>
        </div>
      </div>

      <div className="goals-section">
        <div className="goals-card">
          <h2>Financial Goals Progress</h2>
          {goals.map((goal, index) => (
            <div key={index} className="goal-item">
              <div className="goal-header">
                <h3>{goal.name}</h3>
                <span className="days-remaining">
                  {goal.daysRemaining} days left
                </span>
              </div>
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${goal.completion}%` }}
                >
                  <span>{goal.completion}%</span>
                </div>
              </div>
              <div className="goal-stats">
                <span>Saved: ${goal.currentSavings.toLocaleString()}</span>
                <span>Target: ${goal.targetAmount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

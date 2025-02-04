"use client";
import { useState, ReactNode, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  UserIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";

// Keep existing interfaces
interface DataBoxProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  children?: ReactNode;
  className?: string;
}

interface ExpenseData {
  category_name: string;
  total_spent: number;
  percentage: number;
}

interface CashflowData {
  year: number;
  month: number;
  total_income: number;
  total_expenses: number;
}

interface SavingsData {
  YEAR: number;
  MONTH: number;
  average_savings: number;
  users_count: number;
}

interface User {
  full_name: string;
  email: string;
  signup_date: string;
  last_login: string;
}

const DataBox = ({ title, value, icon, children, className }: DataBoxProps) => (
  <div
    className={`p-6 rounded-xl backdrop-blur-sm border border-white/20 ${className}`}
  >
    <div className="flex justify-between items-center">
      <div>
        <p className="text-sm mb-1 text-white/80">{title}</p>
        <p className="text-3xl font-semibold text-white">{value}</p>
      </div>
      <div className="p-3 bg-white/10 rounded-lg">{icon}</div>
    </div>
    {children}
  </div>
);

const COLORS = [
  "url(#blueGradient)",
  "url(#greenGradient)",
  "url(#yellowGradient)",
  "url(#redGradient)",
  "url(#purpleGradient)",
];

export default function Dashboard() {
  const [activeDays, setActiveDays] = useState<number>(30);
  const [loading, setLoading] = useState({
    totalUsers: true,
    activeUsers: true,
    totalTransactions: true,
    topExpenseCategory: true,
    monthlyCashflow: true,
    averageSavings: true,
    budgetUtilization: true,
    expenseDistribution: true,
    users: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalTransactions: 0,
    topExpenseCategory: "",
    monthlyCashflow: [],
    averageSavings: [],
    budgetUtilization: {
      percent_within_budget: 0,
      percent_over_budget: 0,
    },
    expenseDistribution: [],
    users: [],
  });
  const [budgetData, setBudgetData] = useState({
    percent_within_budget: 0,
    percent_over_budget: 0,
  });

  // Fetch functions for each data point
  const fetchTotalUsers = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/total-users");
      const data = await response.json();
      setDashboardData((prev) => ({ ...prev, totalUsers: data.totalUsers }));
    } catch (err) {
      setError("Failed to load total users");
    } finally {
      setLoading((prev) => ({ ...prev, totalUsers: false }));
    }
  };

  const fetchActiveUsers = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/active-users?days=${activeDays}`
      );
      const data = await response.json();
      setDashboardData((prev) => ({ ...prev, activeUsers: data.activeUsers }));
    } catch (err) {
      setError("Failed to load active users");
    } finally {
      setLoading((prev) => ({ ...prev, activeUsers: false }));
    }
  };

  const fetchTotalTransactions = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/total-transactions"
      );
      const data = await response.json();
      setDashboardData((prev) => ({
        ...prev,
        totalTransactions: data.totalTransactions,
      }));
    } catch (err) {
      setError("Failed to load total transactions");
    } finally {
      setLoading((prev) => ({ ...prev, totalTransactions: false }));
    }
  };

  const fetchTopExpenseCategory = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/top-expense-category"
      );
      const data = await response.json();
      setDashboardData((prev) => ({
        ...prev,
        topExpenseCategory: data.category_name,
      }));
    } catch (err) {
      setError("Failed to load top expense category");
    } finally {
      setLoading((prev) => ({ ...prev, topExpenseCategory: false }));
    }
  };

  const fetchMonthlyCashflow = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/monthly-cashflow"
      );
      const data = await response.json();

      // Transform data to match frontend expectation
      const transformedData = data.map((item: CashflowData) => ({
        month: `${item.year}-${item.month}`,
        inflow: item.total_income,
        outflow: item.total_expenses,
      }));

      setDashboardData((prev) => ({
        ...prev,
        monthlyCashflow: transformedData,
      }));
    } catch (err) {
      setError("Failed to load monthly cashflow");
    } finally {
      setLoading((prev) => ({ ...prev, monthlyCashflow: false }));
    }
  };

  const fetchAverageSavings = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/average-savings-trend"
      );
      const data = await response.json();

      // Transform data to match frontend expectation
      const transformedData = data.map((item: SavingsData) => ({
        month: `${item.YEAR}-${item.MONTH}`,
        savings: item.average_savings,
      }));

      setDashboardData((prev) => ({
        ...prev,
        averageSavings: transformedData,
      }));
    } catch (err) {
      setError("Failed to load average savings");
    } finally {
      setLoading((prev) => ({ ...prev, averageSavings: false }));
    }
  };
  const fetchBudgetUtilization = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/budget-utilization"
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("Received budget data:", data); // Debug log
      setBudgetData(data);
    } catch (err) {
      console.error("Fetch error:", err); // Debug log
      //   setError(err.message);
    }
  };
  const fetchExpenseDistribution = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/expense-distribution"
      );
      const data = await response.json();

      // Transform data to match frontend expectation
      const transformedData = data.map((item: ExpenseData) => ({
        name: item.category_name,
        value: item.total_spent,
      }));

      setDashboardData((prev) => ({
        ...prev,
        expenseDistribution: transformedData,
      }));
    } catch (err) {
      setError("Failed to load expense distribution");
    } finally {
      setLoading((prev) => ({ ...prev, expenseDistribution: false }));
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/users");
      const data = await response.json();
      setDashboardData((prev) => ({ ...prev, users: data }));
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading((prev) => ({ ...prev, users: false }));
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchTotalUsers();
    fetchActiveUsers();
    fetchTotalTransactions();
    fetchTopExpenseCategory();
    fetchMonthlyCashflow();
    fetchAverageSavings();
    fetchBudgetUtilization();
    fetchExpenseDistribution();
    fetchUsers();
  }, []);

  // Refetch active users when days change
  useEffect(() => {
    fetchActiveUsers();
  }, [activeDays]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-blue-900 p-8">
      <h1 className="text-2xl font-bold mb-8 text-white">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DataBox
          title="Total Users"
          value={loading.totalUsers ? "..." : dashboardData.totalUsers}
          icon={<UserIcon className="w-6 h-6 text-white" />}
          className="bg-gradient-to-br from-blue-600/80 to-blue-500/80"
        />

        <DataBox
          title="Active Users"
          value={loading.activeUsers ? "..." : dashboardData.activeUsers}
          icon={<UserIcon className="w-6 h-6 text-white" />}
          className="bg-gradient-to-br from-green-600/80 to-green-500/80"
        >
          <div className="mt-4 flex gap-2">
            {[7, 30, 90].map((days) => (
              <button
                key={days}
                onClick={() => setActiveDays(days)}
                className={`px-3 py-1 rounded-full text-sm ${
                  days === activeDays
                    ? "bg-black/20 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </DataBox>

        <DataBox
          title="Total Transactions"
          value={dashboardData.totalTransactions.toLocaleString()}
          icon={<CurrencyDollarIcon className="w-6 h-6 text-white" />}
          className="bg-gradient-to-br from-purple-600/80 to-purple-500/80"
        />

        <DataBox
          title="Top Expense Category"
          value={dashboardData.topExpenseCategory}
          icon={<ChartBarIcon className="w-6 h-6 text-white" />}
          className="bg-gradient-to-br from-red-600/80 to-red-500/80"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20">
          <h3 className="font-semibold mb-4 text-white">
            Monthly Inflow vs Outflow
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.monthlyCashflow}>
                <XAxis dataKey="month" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Bar
                  dataKey="inflow"
                  fill="url(#inflowGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="outflow"
                  fill="url(#outflowGradient)"
                  radius={[4, 4, 0, 0]}
                />
                <defs>
                  <linearGradient
                    id="inflowGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                  <linearGradient
                    id="outflowGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#F97316" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20">
          <h3 className="font-semibold mb-4 text-white">
            Average Savings Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.averageSavings}>
                <XAxis dataKey="month" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="url(#savingsGradient)"
                  strokeWidth={2}
                  dot={{ fill: "#10B981" }}
                />
                <defs>
                  <linearGradient
                    id="savingsGradient"
                    x1="0"
                    y1="0"
                    x2="1"
                    y2="0"
                  >
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#3B82F6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20">
          <h3 className="font-semibold mb-4 text-white">Budget Utilization</h3>
          <div className="flex items-center justify-center h-48">
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">
                    {budgetData.percent_within_budget}%
                  </p>
                  <p className="text-sm text-white/80">Within Budget</p>
                </div>
              </div>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={[
                      {
                        name: "Under",
                        value: budgetData.percent_within_budget,
                      },
                      {
                        name: "Over",
                        value: budgetData.percent_over_budget,
                      },
                    ]}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell key="under" fill="url(#underGradient)" />
                    <Cell key="over" fill="url(#overGradient)" />
                  </Pie>
                  <defs>
                    <linearGradient
                      id="underGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient
                      id="overGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                  </defs>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20 lg:col-span-2">
          <h3 className="font-semibold mb-4 text-white">
            Expense Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.expenseDistribution}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dashboardData.expenseDistribution.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#2563EB" />
                  </linearGradient>
                  <linearGradient
                    id="greenGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient
                    id="yellowGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                  <linearGradient id="redGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#EF4444" />
                    <stop offset="100%" stopColor="#DC2626" />
                  </linearGradient>
                  <linearGradient
                    id="purpleGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#7C3AED" />
                  </linearGradient>
                </defs>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div> */}
        <div className="bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20 w-screen">
          <h3 className="font-semibold mb-4 text-white">User List</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-white/80 border-b border-white/20">
                  <th className="pb-3">Name</th>
                  <th className="pb-3">Email</th>
                  <th className="pb-3">Signup Date</th>
                  <th className="pb-3">Last Login</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.users.map((user: User, index) => (
                  <tr
                    key={index}
                    className="border-b border-white/10 last:border-b-0 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-4 text-white">{user.full_name}</td>
                    <td className="py-4 text-white/90">{user.email}</td>
                    <td className="py-4 text-white/80">{user.signup_date}</td>
                    <td className="py-4 text-white/80">{user.last_login}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

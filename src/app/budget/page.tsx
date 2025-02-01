"use client";

import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";

interface BudgetData {
  monthly_budget: number;
  total_spent: number;
  last_defined_date: string;
}

interface BudgetResponse {
  currentBudget: {
    budget_id: number;
    monthly_budget: number;
    last_defined_date: string;
    total_spent: number;
  };
  budgets: {
    budget_id: number;
    monthly_budget: number;
    last_defined_date: string;
    total_spent: number;
  }[];
}

const Budget = () => {
  const [budgetData, setBudgetData] = useState<BudgetData>({
    monthly_budget: 0,
    total_spent: 0,
    last_defined_date: "",
  });
  const [newBudget, setNewBudget] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchBudget = async () => {
    try {
      const response = await fetch("http://localhost:5001/api/budget-details");
      if (!response.ok) {
        throw new Error("Failed to fetch budget data");
      }
      const data: BudgetResponse = await response.json();
      console.log("API Response:", data);

      if (data.currentBudget) {
        setBudgetData({
          monthly_budget: Number(data.currentBudget.monthly_budget),
          total_spent: Number(data.currentBudget.total_spent),
          last_defined_date: data.currentBudget.last_defined_date,
        });
      } else {
        setBudgetData({
          monthly_budget: 0,
          total_spent: 0,
          last_defined_date: "Not Set",
        });
      }
    } catch (error) {
      setError("Failed to load budget data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, []);

  const updateBudget = async () => {
    const budgetValue = newBudget;
    if (isNaN(budgetValue) || budgetValue <= 0) {
      setError("Please enter a valid budget amount");
      return;
    }

    setIsUpdating(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5001/api/add-budget", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ monthly_budget: budgetValue }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update budget");
      }

      await fetchBudget();
      setNewBudget(0);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update budget"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900 min-h-screen">
        <NavBar />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-white">Loading budget data...</div>
        </div>
        <Footer />
      </div>
    );
  }

  const remainingBudget = budgetData.monthly_budget - budgetData.total_spent;

  return (
    <div className="bg-gray-900 min-h-screen">
      <NavBar />
      <div className="mx-auto max-w-7xl">
        <div className="bg-gray-900 py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-base font-semibold text-white">Budget</h1>
                <p className="mt-2 text-sm text-gray-300">
                  Manage your monthly budget and track your expenses.
                </p>
              </div>
            </div>

            {error && <div className="mt-4 text-red-500">{error}</div>}

            <div className="mt-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="text-white text-lg font-semibold">
                    Monthly Budget
                  </h3>
                  <p className="text-indigo-400 text-2xl font-bold">
                    ₹{budgetData.monthly_budget.toFixed(2)}
                  </p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="text-white text-lg font-semibold">
                    Total Spent
                  </h3>
                  <p className="text-red-400 text-2xl font-bold">
                    ₹{budgetData.total_spent.toFixed(2)}
                  </p>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="text-white text-lg font-semibold">
                    Remaining Budget
                  </h3>
                  <p
                    className={`text-2xl font-bold ${
                      remainingBudget >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    ₹{remainingBudget.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mt-6 text-gray-300">
                <p>
                  <strong>Last Defined Date:</strong>{" "}
                  {budgetData.last_defined_date
                    ? new Date(
                        budgetData.last_defined_date
                      ).toLocaleDateString()
                    : "Not Set"}
                </p>
              </div>

              <div className="mt-6 flex items-center">
                <input
                  type="number"
                  value={newBudget === 0 ? "" : newBudget} // Change this line
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    if (value > 0) {
                      // Only set if value is greater than 0
                      setNewBudget(value);
                    } else if (e.target.value === "") {
                      // Allow empty string
                      setNewBudget(0);
                    }
                  }}
                  className="px-3 py-2 rounded-md bg-gray-800 text-white border border-gray-600"
                  placeholder="Enter new budget"
                  min="0"
                  step="0.01"
                  disabled={isUpdating}
                />
                <button
                  onClick={updateBudget}
                  className="ml-4 bg-indigo-500 px-4 py-2 rounded-md text-white font-semibold hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isUpdating || !newBudget}
                >
                  {isUpdating ? "Updating..." : "Update Budget"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Budget;

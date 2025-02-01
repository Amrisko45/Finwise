"use client";

import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { useState, useEffect } from "react";

interface FinancialGoals {
  goal_amount: number;
  description: string;
  goal_deadline: string;
  current_savings_toward_goals: number;
}

interface FinancialGoalsResponse {
  financialGoals: FinancialGoals[];
}

export default function FinancialGoals() {
  const [financialGoals, setFinancialGoals] = useState<FinancialGoals[]>([]);
  const [newFinancialGoal, setNewFinancialGoal] = useState<FinancialGoals>({
    goal_amount: 0,
    description: "",
    goal_deadline: "",
    current_savings_toward_goals: 0,
  });
  const [showForm, setShowForm] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchFinancialGoals = async () => {
    try {
      const response = await fetch(
        "http://localhost:5001/api/financial-goal-details"
      );
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error("Failed to fetch financial goals");
      }
      const data: FinancialGoalsResponse = await response.json();
      console.log("API Response:", data);

      setFinancialGoals(data.financialGoals);
    } catch (error) {
      console.error("Error fetching financial goals:", error);
      setError("Failed to load financial goals. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialGoals();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewFinancialGoal((prev) => ({
      ...prev,
      [name]:
        name === "goal_amount" || name === "current_savings_toward_goals"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { goal_amount, goal_deadline, description } = newFinancialGoal;

    // Validate inputs
    if (isNaN(goal_amount) || goal_amount <= 0) {
      setError("Please enter a valid goal amount");
      return;
    }
    if (!goal_deadline || !description) {
      setError("Goal description and deadline are required");
      return;
    }

    setIsUpdating(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:5001/api/add-financial-goals",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            goal_amount,
            goal_deadline,
            description,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add financial goal");
      }

      // Fetch updated financial goals
      await fetchFinancialGoals();

      // Reset form
      setNewFinancialGoal({
        goal_amount: 0,
        description: "",
        goal_deadline: "",
        current_savings_toward_goals: 0,
      });

      // Hide form after submission
      setShowForm(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to add financial goal"
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
          <div className="text-white">Loading financial goals...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen">
      <NavBar />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold text-white">
              Financial Goals
            </h1>
            <p className="mt-2 text-sm text-gray-300">
              A list of all your financial goals, including the target amount,
              description, and deadline.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              {showForm ? "Hide Form" : "Add Financial Goal"}
            </button>
          </div>
        </div>

        {error && <div className="mt-4 text-red-500 text-sm">{error}</div>}

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="goal_amount"
                className="block text-sm font-medium text-white"
              >
                Goal Amount
              </label>
              <input
                type="number"
                id="goal_amount"
                name="goal_amount"
                value={newFinancialGoal.goal_amount}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white p-2"
                placeholder="Enter goal amount"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-white"
              >
                Description
              </label>
              <input
                type="text"
                id="description"
                name="description"
                value={newFinancialGoal.description}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white p-2"
                placeholder="Enter description"
              />
            </div>
            <div>
              <label
                htmlFor="goal_deadline"
                className="block text-sm font-medium text-white"
              >
                Deadline
              </label>
              <input
                type="date"
                id="goal_deadline"
                name="goal_deadline"
                value={newFinancialGoal.goal_deadline}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md bg-gray-800 border-gray-700 text-white p-2"
              />
            </div>
            <button
              type="submit"
              disabled={isUpdating}
              className="w-full rounded-md bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              {isUpdating ? "Submitting..." : "Submit"}
            </button>
          </form>
        )}

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                    >
                      Description
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Goal Amount
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Deadline
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Current Savings
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {financialGoals.map((goal, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                        {goal.description}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        ₹{goal.goal_amount}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        {new Date(goal.goal_deadline).toLocaleDateString()}{" "}
                        {/* Format deadline */}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        ₹{goal.current_savings_toward_goals.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

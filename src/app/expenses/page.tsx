"use client";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import React, { useState, useEffect } from "react";

type Expense = {
  expense_id: number;
  amount: number;
  date: string;
  time: string;
  category_name: string;
};

type Category = {
  category_id: number;
  category_name: string;
};

interface CategorySelectorProps {
  categories: Category[];
  onCategoryChange: (category: string) => void;
  selectedCategory: string; // Add this prop to control the selected value
}

export default function expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [expenseDate, setExpenseDate] = useState<string>("");
  const [expenseTime, setExpenseTime] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
    show: boolean;
  }>({
    type: "success",
    message: "",
    show: false,
  });

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000); // Clear after 3 seconds
      return () => clearTimeout(timer); // Cleanup
    }
  }, [successMessage]);

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({
      type,
      message,
      show: true,
    });

    setTimeout(() => {
      setAlert((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  useEffect(() => {
    async function fetchExpensesAndCategories() {
      try {
        const response = await fetch(
          "http://localhost:5001/api/expenses-with-categories"
        );
        const data: { expenses: Expense[]; categories: Category[] } =
          await response.json();

        // Format the dates and times with null checks
        const formattedExpenses = data.expenses.map((expense) => ({
          ...expense,
          date: expense.date
            ? new Date(expense.date).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          time: formatTime(expense.time),
        }));

        setExpenses(formattedExpenses);
        setCategories(data.categories);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchExpensesAndCategories();
  }, []);

  const formatTime = (timeString: string | null): string => {
    // Return default time if timeString is null or undefined
    if (!timeString) return "00:00:00";

    try {
      // If the timeString already includes seconds, return it
      if (timeString.split(":").length === 3) return timeString;

      // If it's in HH:mm format, add seconds
      if (timeString.split(":").length === 2) return `${timeString}:00`;

      // If it's a full date string, extract time
      if (timeString.includes("T")) {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) {
          return "00:00:00"; // Return default time if date is invalid
        }
        return date.toTimeString().split(" ")[0];
      }

      // If none of the above conditions match, return default time
      return "00:00:00";
    } catch (error) {
      console.error("Error formatting time:", error);
      return "00:00:00"; // Return default time in case of any error
    }
  };

  const CategorySelector = ({
    categories,
    onCategoryChange,
    selectedCategory,
  }: CategorySelectorProps) => {
    const [customCategory, setCustomCategory] = useState<string>("");
    const [addedCategories, setAddedCategories] =
      useState<Category[]>(categories);

    const handleAddCustomCategory = () => {
      if (
        customCategory &&
        !addedCategories.some((cat) => cat.category_name === customCategory)
      ) {
        const newCategory = {
          category_id: addedCategories.length + 1,
          category_name: customCategory,
        };
        setAddedCategories([...addedCategories, newCategory]);
        onCategoryChange(customCategory);
        setCustomCategory("");
      }
    };

    return (
      <div>
        <label htmlFor="category" className="text-white">
          Category
        </label>
        <select
          id="category"
          value={selectedCategory} // Use the selectedCategory prop
          onChange={(e) => onCategoryChange(e.target.value)}
          className="mt-1 p-2 rounded-md w-full bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="" disabled>
            Select a category
          </option>
          {addedCategories.map((cat) => (
            <option key={cat.category_id} value={cat.category_name}>
              {cat.category_name}
            </option>
          ))}
          <option value="other">Add Custom Category</option>
        </select>

        {selectedCategory === "other" && (
          <div className="mt-2">
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              placeholder="Enter custom category"
              className="mt-1 p-2 rounded-md w-full bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              onClick={handleAddCustomCategory}
              className="mt-2 p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Add Category
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSuccessMessage("Expense added successfully!");

    // Delay hiding the form
    setTimeout(() => {
      setSuccessMessage(""); // Clear success message
      setShowForm(false); // Close the form after showing the success message
    }, 3000); // Delay of 3 seconds

    if (!amount || !category || !expenseDate || !expenseTime) {
      showAlert("error", "Please fill in all fields.");
      return;
    }

    const formattedTime = formatTime(expenseTime);

    const expenseData = {
      amount: parseFloat(amount),
      category_name: category,
      date: expenseDate,
      time: formattedTime,
    };

    try {
      const response = await fetch("http://localhost:5001/api/add-expense", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(expenseData),
      });

      if (response.ok) {
        const updatedResponse = await fetch(
          "http://localhost:5001/api/expenses-with-categories"
        );
        if (!updatedResponse.ok) {
          const errorText = await updatedResponse.text();
          console.error("Error response:", updatedResponse.status, errorText);
          showAlert("error", "Failed to fetch updated expenses.");
          return;
        }
        const updatedExpenseData = await updatedResponse.json();

        const formattedExpenses = updatedExpenseData.expenses.map(
          (expense: Expense) => ({
            ...expense,
            date: expense.date
              ? new Date(expense.date).toISOString().split("T")[0]
              : new Date().toISOString().split("T")[0],
            time: formatTime(expense.time),
          })
        );

        setExpenses(formattedExpenses);
        setAmount("");
        setCategory("");
        setExpenseDate("");
        setExpenseTime("");
        setShowForm(false);
        showAlert("success", "Expense added successfully!");
      } else {
        const errorData = await response.json();
        showAlert("error", errorData.error || "Failed to add expense");
      }
    } catch (error) {
      console.error("Error submitting expense:", error);
      showAlert("error", "An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="bg-gray-900">
      <NavBar />
      <div className="mx-auto max-w-7xl">
        <div className="bg-gray-900 py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header section remains the same */}
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-base font-semibold text-white">Expenses</h1>
                <p className="mt-2 text-sm text-gray-300">
                  A list of all the expenses including the amount, category,
                  date, and time.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                  type="button"
                  onClick={() => setShowForm(!showForm)}
                  className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400"
                >
                  Add Expense
                </button>
              </div>
            </div>

            {/* Expense Form */}
            {showForm && (
              <div className="mt-4">
                {successMessage && (
                  <div className="mb-4 p-3 rounded-md bg-green-600 text-white">
                    {successMessage}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="amount" className="text-white">
                      Amount
                    </label>
                    <input
                      id="amount"
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="mt-1 p-2 rounded-md w-full bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <CategorySelector
                    categories={categories}
                    onCategoryChange={setCategory}
                    selectedCategory={category}
                  />

                  <div>
                    <label htmlFor="expenseDate" className="text-white">
                      Date
                    </label>
                    <input
                      id="expenseDate"
                      type="date"
                      value={expenseDate}
                      onChange={(e) => setExpenseDate(e.target.value)}
                      className="mt-1 p-2 rounded-md w-full bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="expenseTime" className="text-white">
                      Time
                    </label>
                    <input
                      id="expenseTime"
                      type="time"
                      value={expenseTime}
                      onChange={(e) => {
                        const newTime = e.target.value;
                        // Add null check when setting time
                        if (newTime) {
                          setExpenseTime(
                            newTime.length === 5 ? `${newTime}:00` : newTime
                          );
                        } else {
                          setExpenseTime("00:00:00");
                        }
                      }}
                      className="mt-1 p-2 rounded-md w-full bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                      step="1"
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAmount("");
                        setCategory("");
                        setExpenseDate("");
                        setExpenseTime("");
                        setShowForm(false);
                      }}
                      className="block rounded-md bg-gray-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400"
                    >
                      Submit
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Expense Table */}
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">
                          Date
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Time
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Amount
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Category
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {expenses.map((expense) => (
                        <tr key={expense.expense_id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                            {expense.date}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            {expense.time}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            ₹{expense.amount}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            {expense.category_name}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

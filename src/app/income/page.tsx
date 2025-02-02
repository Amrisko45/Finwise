"use client";
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import { useEffect, useState } from "react";

type Income = {
  income_id: number;
  amount: number;
  date: string;
  frequency: string;
  source_name: string;
};

type Source = {
  source_id: number;
  source_name: string;
};

export default function Income() {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [sources, setSources] = useState<Source[]>([]);
  const [incomeDate, setIncomeDate] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [currency, setCurrency] = useState("₹");

  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
    show: boolean;
  }>({
    type: "success",
    message: "",
    show: false,
  });

  const showAlert = (type: "success" | "error", message: string) => {
    setAlert({
      type,
      message,
      show: true,
    });

    setTimeout(() => {
      setAlert((prev) => ({
        ...prev,
        show: false,
      }));
    }, 3000);
  };

  useEffect(() => {
    const fetchIncomesAndSources = async () => {
      try {
        const response = await fetch(
          "http://localhost:5001/api/income-with-sources"
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Fetched data:", data); // Log the response

        // Format the date to YYYY-MM-DD
        const formattedIncomes = data.incomes.map((income: Income) => ({
          ...income,
          date: income.date.split("T")[0], // Extract YYYY-MM-DD from ISO format
        }));

        setIncomes(formattedIncomes);
        setSources(data.sources);
      } catch (error) {
        console.error("Error fetching data: ", error);
        showAlert("error", "Failed to fetch data. Please try again later.");
      }
    };
    fetchIncomesAndSources();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!amount || !source.trim() || !incomeDate || !frequency.trim()) {
      showAlert("error", "Please fill in all fields");
      return;
    }

    const incomeData = {
      amount: parseFloat(amount),
      source_name: source,
      date: incomeDate,
      frequency: frequency,
    };

    try {
      const response = await fetch("http://localhost:5001/api/add-income", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(incomeData),
      });

      if (response.ok) {
        const updatedResponse = await fetch(
          "http://localhost:5001/api/income-with-sources"
        );
        if (!updatedResponse.ok) {
          const errorText = await updatedResponse.text();
          console.error("Error response:", updatedResponse.status, errorText);
          showAlert("error", "Failed to fetch updated income.");
          return;
        }
        const updatedIncomeData = await updatedResponse.json();

        const formattedIncomes = updatedIncomeData.incomes.map(
          (income: Income) => ({
            ...income,
            date: income.date || new Date().toISOString().split("T")[0],
          })
        );

        setIncomes(formattedIncomes);
        setAmount("");
        setSource("");
        setIncomeDate("");
        setFrequency("");
        setShowForm(false);
        showAlert("success", "Income added successfully!");
      } else {
        const errorData = await response.json();
        showAlert("error", errorData.error || "Failed to add income");
      }
    } catch (error) {
      console.error("Error submitting income:", error);
      showAlert("error", "An unexpected error occurred. Please try again");
    }
  };

  return (
    <div className="bg-gray-900">
      <NavBar />
      <div className="mx-auto max-w-7xl">
        <div className="bg-gray-900 py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-base font-semibold text-white">Income</h1>
                <p className="mt-2 text-sm text-gray-300">
                  A list of all the users in your account including their
                  income, source, date, and frequency.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                  type="button"
                  className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                  onClick={() => setShowForm(!showForm)}
                >
                  Add Income
                </button>
              </div>
            </div>
            {/* INCOME FORM */}
            {showForm && (
              <div className="mt-4">
                {alert.show && (
                  <div
                    className={`p-4 mb-4 rounded-md ${
                      alert.type === "success" ? "bg-green-600" : "bg-red-600"
                    } text-white`}
                  >
                    {alert.message}
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
                  <div>
                    <label htmlFor="source" className="text-white">
                      Source
                    </label>
                    <input
                      id="source"
                      type="text"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="mt-1 p-2 rounded-md w-full bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="incomeDate" className="text-white">
                      Date
                    </label>
                    <input
                      id="incomeDate"
                      type="date"
                      value={incomeDate}
                      onChange={(e) => setIncomeDate(e.target.value)}
                      className="mt-1 p-2 rounded-md w-full bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="frequency" className="text-white">
                      Frequency
                    </label>
                    <input
                      id="frequency"
                      type="text"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      className="mt-1 p-2 rounded-md w-full bg-gray-700 text-white border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAmount("");
                        setSource("");
                        setIncomeDate("");
                        setFrequency("");
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
                          Amount
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Source
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Date
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Frequency
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                        >
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {incomes.map((income) => (
                        <tr key={income.income_id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                            {currency}
                            {income.amount}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            {income.source_name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            {income.date}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                            {income.frequency}
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

import { useEffect,useState } from "react";
import expenses from "./expenses";

const people = [
  { name: 'Lindsay Walton', title: 'Front-end Developer', email: 'lindsay.walton@example.com', role: 'Member' },
  // More people...
]

type Income = {
  income_id: number;
  amount: number;
  date: string;
  frequency: string;
  source_name: string;
}

type Source = {
  source_id: number;
  source_name: string;
}

export default function income() {
  const [income, setIncome] = useState<Income[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [incomeDate, setIncomeDate] = useState<string>("");
  const [frequency, setFrequency] = useState<string>("");
  const [showForm, setShowForm] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [alert, setAlert] = useState<{
      type: 'success' | 'error';
      message: string;
      show: boolean;
    }>({
      type: 'success',
      message: '',
      show: false
  });

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({
      type,
      message,
      show: true
    });

    setTimeout(() => {
      setAlert(prev => ({ 
        ...prev, 
        show: false 
      }));
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setSuccessMessage("Expense added successfully!");

    //Delay hiding the form 
    setTimeout(() => {
      setSuccessMessage("");
      setShowForm(false);
    }, 3000);

    if (!amount || !source || !incomeDate || !frequency) {
      showAlert('error', 'Please fill in all fields');
      return;
    }

    const incomeData = {
      amount: parseFloat(amount),
      source_name: source,
      date: incomeDate,
      frequency: frequency
    };

    try {
      const response = await fetch("http://localhost:5001/api/add-income", {
        method: "POST",
        headers: {
          "Content-Type" : "application/json",
        },
        body: JSON.stringify(incomeData),
      });
      
      if(response.ok) {
        const updatedResponse = await fetch("")
      }
    }
    catch (error) {

    }
  }
  return (
    <div className="bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="bg-gray-900 py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-base font-semibold text-white">Users</h1>
                <p className="mt-2 text-sm text-gray-300">
                  A list of all the users in your account including their name, title, email and role.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                  type="button"
                  className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                >
                  Add user
                </button>
              </div>
            </div>
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">
                          Name
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Title
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Email
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Role
                        </th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                          <span className="sr-only">Edit</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {people.map((person) => (
                        <tr key={person.email}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                            {person.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{person.title}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{person.email}</td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{person.role}</td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <a href="#" className="text-indigo-400 hover:text-indigo-300">
                              Edit<span className="sr-only">, {person.name}</span>
                            </a>
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
    </div>
  )
}

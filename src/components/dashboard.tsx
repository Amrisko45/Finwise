import React, { useEffect, useState } from "react";
import Head from "next/head";
import { Box, Stack, Typography, Paper, Button } from "@mui/material";
import { indigo, grey } from "@mui/material/colors";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard: React.FC = () => {
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [totalExpense, setTotalExpense] = useState<number>(0);
  const [totalSaving, setTotalSaving] = useState<number>(0);
  const [currency, setCurrency] = useState("₹");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      } catch (error) {
        console.error("Error fetching data: ", error);
        setError("Failed to fetch financial data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialOverview();
  }, []);

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

  if (loading) {
    return <Typography variant="h6">Loading...</Typography>;
  }

  if (error) {
    return (
      <Typography variant="h6" color="error">
        {error}
      </Typography>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard | Personal Financial Manager</title>
        <meta
          name="description"
          content="Dashboard for tracking financial metrics and insights."
        />
      </Head>
      <Box
        sx={{
          padding: "40px",
          backgroundColor: indigo[800],
          minHeight: "100vh",
          color: grey[100],
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: "bold", color: "white" }}
        >
          Dashboard
        </Typography>
        {/* Key Metrics Section */}
        <Stack
          direction="row"
          spacing={3}
          justifyContent="space-between"
          flexWrap="wrap"
          sx={{ mb: 3 }}
        >
          <Paper
            elevation={3}
            sx={{
              padding: "20px",
              textAlign: "center",
              flex: "1 1 calc(33.33% - 16px)",
              backgroundColor: grey[900],
              color: grey[100],
            }}
          >
            <Typography variant="h6">Total Income</Typography>
            <Typography variant="h5" color="primary">
              {formatCurrency(totalIncome)}
            </Typography>
          </Paper>
          <Paper
            elevation={3}
            sx={{
              padding: "20px",
              textAlign: "center",
              flex: "1 1 calc(33.33% - 16px)",
              backgroundColor: grey[900],
              color: grey[100],
            }}
          >
            <Typography variant="h6">Total Expenses</Typography>
            <Typography variant="h5" color="secondary">
              {formatCurrency(totalExpense)}
            </Typography>
          </Paper>
          <Paper
            elevation={3}
            sx={{
              padding: "20px",
              textAlign: "center",
              flex: "1 1 calc(33.33% - 16px)",
              backgroundColor: grey[900],
              color: grey[100],
            }}
          >
            <Typography variant="h6">Savings</Typography>
            <Typography variant="h5" color="success.main">
              {formatCurrency(totalSaving)}
            </Typography>
          </Paper>
        </Stack>

        {/* Line Chart Section */}
        <Paper
          elevation={3}
          sx={{
            padding: "20px",
            backgroundColor: grey[900],
            color: grey[100],
          }}
        >
          <Line data={lineChartData} options={lineChartOptions} />
        </Paper>

        {/* Chatbot Button */}
        <Box sx={{ textAlign: "center", mt: 3 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: grey[100],
              color: indigo[500],
              "&:hover": {
                backgroundColor: grey[300],
              },
              padding: "10px 20px",
            }}
            onClick={() => alert("Chatbot page navigation here!")}
            aria-label="Open Chatbot"
          >
            Open Chatbot
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default Dashboard;

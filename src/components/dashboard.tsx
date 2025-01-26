import React from "react";
import Head from "next/head";
import { Box, Stack, Typography, Paper, Button } from "@mui/material";
import { indigo, grey, blue } from "@mui/material/colors";
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
  // Placeholder data for the line chart
  const lineChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Expenses",
        data: [500, 700, 800, 600, 900, 750],
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
      },
      {
        label: "Income",
        data: [1000, 1100, 1200, 1300, 1250, 1400],
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: grey[100], // Adjusted for visibility
        },
      },
      title: {
        display: true,
        text: "Monthly Financial Overview",
        color: grey[100], // Adjusted for visibility
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
          backgroundColor: blue[900],
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
              $7,500
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
              $4,200
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
              $3,300
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

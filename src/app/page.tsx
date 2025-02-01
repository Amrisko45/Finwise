"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Dashboard from "@/components/dashboard";
import Footer from "@/components/Footer";

const Home = () => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track authentication status

  useEffect(() => {
    console.log("Checking authentication...");

    const isLoggedIn = localStorage.getItem("authToken"); // Check if the auth token exists
    if (isLoggedIn) {
      console.log("User is authenticated.");
      setIsAuthenticated(true); // Mark as authenticated
    } else {
      console.log("User not authenticated. Redirecting to login...");
      router.push("/login"); // Redirect to login if not authenticated
    }
  }, [router]);

  if (!isAuthenticated) {
    return <div>Loading...</div>; // Show a loading screen while redirecting
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-grow">
        <NavBar />
        <Dashboard />
      </div>
      <div className="mt-24">
        <Footer />
      </div>
    </div>
  );
};

export default Home;

'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HomePage from '../../components/HomePage';
import Footer from '../../components/Footer';

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
    <div>
      <div>
       <HomePage />
      </div>
      <Footer/>
    </div>
  );
};

export default Home;

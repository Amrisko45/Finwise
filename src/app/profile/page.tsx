"use client";

import { useState } from "react";
import { 
  UserCircleIcon, 
  CreditCardIcon, 
  KeyIcon, 
  BellIcon, 
  CogIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // Mock user data
  const userData = {
    name: "Vikrant Parulekar",
    email: "vikrant.p@example.com",
    memberSince: "January 2025",
    lastLogin: "Today at 10:30 AM",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
  };
  
  // Mock financial summary data
  const financialSummary = {
    totalSavings: "₹125,000",
    monthlyIncome: "₹85,000",
    monthlyExpenses: "₹48,000",
    activeGoals: 3,
    budgetStatus: "On track",
    savingsRate: "43.5%"
  };

  const navigationItems = [
    { name: "Overview", icon: UserCircleIcon, id: "overview" },
    { name: "Financial Summary", icon: ChartBarIcon, id: "financial" },
    { name: "Payment Methods", icon: CreditCardIcon, id: "payment" },
    { name: "Security", icon: ShieldCheckIcon, id: "security" },
    { name: "Notifications", icon: BellIcon, id: "notifications" },
    { name: "Preferences", icon: CogIcon, id: "preferences" },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      <NavBar />
      
      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-x-8">
            {/* Sidebar */}
            <aside className="lg:col-span-3">
              <div className="bg-gray-800 rounded-lg overflow-hidden shadow mb-6 p-6">
                <div className="flex items-center space-x-4">
                  <img 
                    src={userData.profileImage}
                    alt="Profile"
                    className="h-20 w-20 rounded-full border-2 border-emerald-400"
                  />
                  <div>
                    <h2 className="text-xl font-semibold text-white">{userData.name}</h2>
                    <p className="text-gray-400">{userData.email}</p>
                  </div>
                </div>
                <div className="mt-6 space-y-2 border-t border-gray-700 pt-4 text-sm text-gray-400">
                  <p>Member since: {userData.memberSince}</p>
                  <p>Last login: {userData.lastLogin}</p>
                </div>
              </div>
              
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`${
                      activeTab === item.id
                        ? "bg-gray-800 text-white border-l-4 border-emerald-400"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    } group flex items-center px-4 py-3 w-full text-left rounded-md`}
                  >
                    <item.icon
                      className={`${
                        activeTab === item.id ? "text-emerald-400" : "text-gray-400 group-hover:text-gray-300"
                      } mr-3 h-6 w-6`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Main content */}
            <div className="mt-8 lg:col-span-9 lg:mt-0">
              <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
                {activeTab === "overview" && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Account Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                          <BanknotesIcon className="h-6 w-6 text-emerald-400 mr-2" />
                          <h3 className="text-lg font-medium text-white">Financial Health</h3>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-300">Monthly Income:</span>
                            <span className="text-emerald-400 font-medium">{financialSummary.monthlyIncome}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Monthly Expenses:</span>
                            <span className="text-emerald-400 font-medium">{financialSummary.monthlyExpenses}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Savings Rate:</span>
                            <span className="text-emerald-400 font-medium">{financialSummary.savingsRate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-300">Budget Status:</span>
                            <span className="text-emerald-400 font-medium">{financialSummary.budgetStatus}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                          <UserCircleIcon className="h-6 w-6 text-emerald-400 mr-2" />
                          <h3 className="text-lg font-medium text-white">Account Actions</h3>
                        </div>
                        <div className="space-y-4">
                          <button className="flex items-center text-gray-300 hover:text-white">
                            <CogIcon className="h-5 w-5 mr-2" />
                            Edit Profile Information
                          </button>
                          <button className="flex items-center text-gray-300 hover:text-white">
                            <KeyIcon className="h-5 w-5 mr-2" />
                            Change Password
                          </button>
                          <button className="flex items-center text-gray-300 hover:text-white">
                            <BellIcon className="h-5 w-5 mr-2" />
                            Notification Preferences
                          </button>
                          <button className="flex items-center text-gray-300 hover:text-white">
                            <ArrowPathIcon className="h-5 w-5 mr-2" />
                            Sync Financial Accounts
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center mb-4">
                        <ChartBarIcon className="h-6 w-6 text-emerald-400 mr-2" />
                        <h3 className="text-lg font-medium text-white">Financial Goals Summary</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-white font-medium">Emergency Fund</p>
                            <p className="text-gray-400 text-sm">Target: ₹300,000</p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-400 font-medium">₹210,000 (70%)</p>
                            <p className="text-gray-400 text-sm">Target date: Dec 2025</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2.5">
                          <div className="bg-emerald-400 h-2.5 rounded-full" style={{ width: "70%" }}></div>
                        </div>
                        
                        <div className="flex justify-between items-center pt-2">
                          <div>
                            <p className="text-white font-medium">New Laptop</p>
                            <p className="text-gray-400 text-sm">Target: ₹120,000</p>
                          </div>
                          <div className="text-right">
                            <p className="text-emerald-400 font-medium">₹48,000 (40%)</p>
                            <p className="text-gray-400 text-sm">Target date: Aug 2025</p>
                          </div>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2.5">
                          <div className="bg-emerald-400 h-2.5 rounded-full" style={{ width: "40%" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === "financial" && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Financial Summary</h2>
                    <p className="text-gray-300">Detailed financial information and charts will appear here.</p>
                  </div>
                )}
                
                {activeTab === "payment" && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Payment Methods</h2>
                    <p className="text-gray-300">Your payment methods and transaction history will appear here.</p>
                  </div>
                )}
                
                {activeTab === "security" && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Security Settings</h2>
                    <p className="text-gray-300">Security settings and two-factor authentication options will appear here.</p>
                  </div>
                )}
                
                {activeTab === "notifications" && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Notification Preferences</h2>
                    <p className="text-gray-300">Notification settings will appear here.</p>
                  </div>
                )}
                
                {activeTab === "preferences" && (
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Account Preferences</h2>
                    <p className="text-gray-300">Account preferences and settings will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 
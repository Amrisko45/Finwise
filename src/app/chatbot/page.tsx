"use client";
import React from "react";
import { useState, useEffect } from "react";
import { FiSend } from "react-icons/fi";
import { BsRobot, BsPerson } from "react-icons/bs";
import { motion, Variants } from "framer-motion";
import NavBar from "@/components/NavBar";

type MessageRole = "user" | "assistant";

interface Message {
  role: MessageRole;
  content: string;
  metadata?: {
    financialSnapshot?: {
      income: number;
      expenses: number;
      latestBudget: {
        monthly_budget: number;
        last_defined_date: string;
      } | null;
    };
  };
}

interface ResponseData {
  response: string;
  financialSnapshot: {
    income: number;
    expenses: number;
    latestBudget: {
      monthly_budget: number;
      last_defined_date: string;
    } | null;
  };
  error?: string;
}

const FinancialChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId] = useState("1"); // Replace with actual user authentication

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm Artha, your financial assistant. How can I help you manage your finances today?",
      },
    ]);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    setIsLoading(true);
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const response = await fetch(
        "http://localhost:5001/api/financial-query",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: input.trim(),
            userId: userId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ResponseData = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          metadata: {
            financialSnapshot: data.financialSnapshot,
          },
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Error: ${errorMessage}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const messageVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black border border-gray-700">
      <NavBar />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-blue-700/30 scrollbar-track-blue-900/20">
        {messages.map((message, index) => (
          <motion.div
            key={index}
            initial="hidden"
            animate="visible"
            variants={messageVariants}
            className="flex gap-4 justify-start"
          >
            <div className="mt-2">
              <div
                className={`p-2 rounded-lg ${
                  message.role === "user" ? "bg-black" : "bg-blue-600/20"
                }`}
              >
                {message.role === "user" ? (
                  <BsPerson className="text-lg text-blue-400" />
                ) : (
                  <BsRobot className="text-lg text-indigo-400" />
                )}
              </div>
            </div>
            <div
              className={`max-w-3xl p-4 rounded-xl backdrop-blur-sm ${
                message.role === "user"
                  ? "bg-blue-700/30 text-blue-100"
                  : "bg-indigo-700/30 text-indigo-100"
              }`}
            >
              <div className="space-y-2">
                {message.content.split("\n").map((line, i) => (
                  <p key={i} className="break-words">
                    {line}
                  </p>
                ))}
                {message.metadata?.financialSnapshot && (
                  <div className="mt-4 pt-4 border-t border-indigo-500/30">
                    <p className="text-sm text-indigo-300">
                      Financial Summary:
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div>
                        Income Entries:{" "}
                        {message.metadata.financialSnapshot.income}
                      </div>
                      <div>
                        Expense Entries:{" "}
                        {message.metadata.financialSnapshot.expenses}
                      </div>
                      {message.metadata.financialSnapshot.latestBudget && (
                        <div className="col-span-2">
                          Monthly Budget:{" "}
                          {formatCurrency(
                            message.metadata.financialSnapshot.latestBudget
                              .monthly_budget
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-4 justify-start"
          >
            <div className="mt-2">
              <div className="p-2 bg-indigo-600/20 rounded-lg">
                <BsRobot className="text-lg text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="bg-indigo-700/30 text-indigo-100 p-4 rounded-xl max-w-3xl backdrop-blur-sm">
              <div className="flex gap-2 items-center">
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-indigo-300 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900/30 border-t border-blue-700/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto relative">
          <motion.div whileHover={{ scale: 1.005 }} className="relative">
            <textarea
              value={input}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setInput(e.target.value)
              }
              onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) =>
                e.key === "Enter" && !e.shiftKey && handleSend()
              }
              placeholder="Ask me about your finances..."
              className="w-full p-4 pr-12 bg-blue-800/30 rounded-xl text-blue-100 
                       focus:outline-none focus:ring-2 focus:ring-indigo-300
                       resize-none scrollbar-thin scrollbar-thumb-blue-600/30 scrollbar-track-blue-800/20
                       placeholder-blue-300 transition-all duration-200"
              rows={1}
              disabled={isLoading}
            />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              disabled={isLoading}
              className={`absolute right-2 bottom-4 p-2 rounded-lg transition-all duration-200
                ${
                  isLoading
                    ? "bg-blue-600/30 text-blue-400 cursor-not-allowed"
                    : "bg-indigo-500/80 hover:bg-indigo-400/80 text-white"
                }
                ${input.trim() ? "opacity-100" : "opacity-50"}`}
            >
              <FiSend className="text-xl" />
            </motion.button>
          </motion.div>
          <p className="text-center text-xs text-blue-300 mt-3">
            Artha provides financial insights based on your data. Always verify
            important financial decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FinancialChatbot;

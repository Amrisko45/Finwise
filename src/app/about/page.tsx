"use client";

import { useState } from "react";
import {
  CalculatorIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/20/solid";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const stats = [
  { label: "Platform launched", value: "2025" },
  { label: "Active users", value: "10k+" },
  { label: "Transactions processed", value: "₹100Cr+" },
  { label: "Time saved for users", value: "500k hrs" },
];

const values = [
  {
    name: "Financial Empowerment",
    description:
      "We believe in making financial management accessible to everyone through AI-powered insights.",
    icon: CurrencyDollarIcon,
  },
  {
    name: "Data Security",
    description:
      "Your financial data security is our top priority, protected by state-of-the-art encryption.",
    icon: ShieldCheckIcon,
  },
  {
    name: "Smart Analytics",
    description:
      "Leveraging AI to provide intelligent financial insights and personalized recommendations.",
    icon: ChartBarIcon,
  },
  {
    name: "User-Centric Design",
    description:
      "Built with user experience in mind, making financial management intuitive and efficient.",
    icon: UserGroupIcon,
  },
  {
    name: "Innovation First",
    description:
      "Continuously evolving our AI capabilities to provide cutting-edge financial solutions.",
    icon: SparklesIcon,
  },
  {
    name: "Precision & Accuracy",
    description:
      "Ensuring precise calculations and reliable financial tracking for peace of mind.",
    icon: CalculatorIcon,
  },
];

const team = [
  {
    name: "Aryan Sinha",
    role: "Full Stack Developer",
    imageUrl: "/Photo1.jpeg",
    location: "RVCE, Bangalore",
  },
  {
    name: "Kushagra Aatre",
    role: "AI Development Lead",
    imageUrl: "/Photo2.jpeg",
    location: "RVCE, Bangalore",
  },
  {
    name: "Ayush Chouhan",
    role: "AI Development Lead",
    imageUrl: "/Photo3.jpeg",
    location: "RVCE, Bangalore",
  },
];

const benefits = [
  "AI-powered financial insights",
  "24/7 chatbot assistance",
  "Automated expense tracking",
  "Custom financial reports",
  "Real-time transaction monitoring",
  "Secure data encryption",
];

export default function About() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="bg-gray-900">
      <NavBar />
      <main className="relative isolate">
        {/* Background */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-4 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl"
        >
          <div
            style={{
              clipPath:
                "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
            }}
            className="aspect-[1108/632] w-[69.25rem] flex-none bg-gradient-to-r from-[#00ff88] to-[#4f46e5] opacity-25"
          />
        </div>

        {/* Header section */}
        <div className="px-6 pt-14 lg:px-8">
          <div className="mx-auto max-w-2xl pt-24 text-center sm:pt-40">
            <h1 className="text-5xl font-semibold tracking-tight text-white sm:text-7xl">
              FinanceAI Hub
            </h1>
            <p className="mt-8 text-pretty text-lg font-medium text-gray-400 sm:text-xl/8">
              Revolutionizing personal finance management with AI-powered
              insights and intelligent tracking. Your smart financial companion
              for better money decisions.
            </p>
          </div>
        </div>

        {/* Content section */}
        <div className="mx-auto mt-20 max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
            <div className="grid max-w-xl grid-cols-1 gap-8 text-base/7 text-gray-300 lg:max-w-none lg:grid-cols-2">
              <div>
                <p>
                  FinanceAI Hub emerged from the innovative minds of three RVCE
                  AIML students who recognized the need for intelligent
                  financial management solutions. Our platform combines
                  cutting-edge AI technology with intuitive design to transform
                  how individuals track and manage their finances.
                </p>
                <p className="mt-8">
                  Our interactive dashboard and AI chatbot provide real-time
                  insights, automated expense tracking, and personalized
                  financial recommendations, making professional-grade financial
                  management accessible to everyone.
                </p>
              </div>
              <div>
                <p>
                  We've built FinanceAI Hub with security at its core, ensuring
                  your financial data is protected with enterprise-grade
                  encryption. Our AI-powered chatbot assistant is available 24/7
                  to answer questions and provide guidance on your financial
                  journey.
                </p>
                <p className="mt-8">
                  By leveraging machine learning algorithms, we provide
                  predictive insights into spending patterns, helping users make
                  informed decisions about their financial future. Our platform
                  continues to evolve, learning from user interactions to
                  deliver increasingly valuable insights.
                </p>
              </div>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:mt-20 sm:grid-cols-2 sm:gap-y-16 lg:mt-28 lg:grid-cols-4">
              {stats.map((stat, statIdx) => (
                <div
                  key={statIdx}
                  className="flex flex-col-reverse gap-y-3 border-l border-white/20 pl-6"
                >
                  <dt className="text-base/7 text-gray-300">{stat.label}</dt>
                  <dd className="text-3xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Image section */}
        <div className="mt-32 sm:mt-40 xl:mx-auto xl:max-w-7xl xl:px-8">
          <img
            alt="FinanceAI Hub Dashboard"
            src="/Dashboard.jpg"
            className="aspect-[9/4] w-full object-cover xl:rounded-3xl"
          />
        </div>

        {/* Values section */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-pretty text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Our values
            </h2>
            <p className="mt-6 text-lg/8 text-gray-300">
              At FinanceAI Hub, we're driven by our commitment to revolutionize
              personal finance management through innovative AI solutions and
              unwavering security standards.
            </p>
          </div>
          <dl className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 text-base/7 text-gray-300 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-16">
            {values.map((value) => (
              <div key={value.name} className="relative pl-9">
                <dt className="inline font-semibold text-white">
                  <value.icon
                    aria-hidden="true"
                    className="absolute left-1 top-1 size-5 text-emerald-500"
                  />
                  {value.name}
                </dt>{" "}
                <dd className="inline">{value.description}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Team section */}
        <div className="mx-auto mt-32 max-w-7xl px-6 sm:mt-40 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-pretty text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Our team
            </h2>
            <p className="mt-6 text-lg/8 text-gray-300">
              Meet the innovative minds behind FinanceAI Hub - RVCE AIML
              students passionate about combining artificial intelligence with
              financial technology.
            </p>
          </div>
          <ul
            role="list"
            className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
          >
            {team.map((person) => (
              <li key={person.name}>
                <img
                  alt=""
                  src={person.imageUrl}
                  className="aspect-[14/13] w-full rounded-2xl object-cover"
                />
                <h3 className="mt-6 text-lg/8 font-semibold tracking-tight text-white">
                  {person.name}
                </h3>
                <p className="text-base/7 text-gray-300">{person.role}</p>
                <p className="text-sm/6 text-gray-500">{person.location}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA section */}
        <div className="relative isolate -z-10 mt-32 sm:mt-40">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="mx-auto flex max-w-2xl flex-col gap-16 bg-white/5 px-6 py-16 ring-1 ring-white/10 sm:rounded-3xl sm:p-8 lg:mx-0 lg:max-w-none lg:flex-row lg:items-center lg:py-20 xl:gap-x-20 xl:px-20">
              <img
                alt="FinanceAI Hub Interface"
                src="/logo-color.png"
                className="h-96 w-full flex-none rounded-2xl object-cover shadow-xl lg:aspect-square lg:h-auto lg:max-w-sm"
              />
              <div className="w-full flex-auto">
                <h2 className="text-pretty text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Try FinanceAI Hub
                </h2>
                <p className="mt-6 text-pretty text-lg/8 text-gray-300">
                  Experience the future of personal finance management with our
                  AI-powered platform. Join thousands of users who are already
                  benefiting from intelligent financial insights.
                </p>
                <ul
                  role="list"
                  className="mt-10 grid grid-cols-1 gap-x-8 gap-y-3 text-base/7 text-white sm:grid-cols-2"
                >
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex gap-x-3">
                      <CheckCircleIcon
                        aria-hidden="true"
                        className="h-7 w-5 flex-none text-emerald-400"
                      />
                      {benefit}
                    </li>
                  ))}
                </ul>
                <div className="mt-10 flex">
                  <a
                    href="/"
                    className="text-sm/6 font-semibold text-emerald-400"
                  >
                    Start managing your finances smarter{" "}
                    <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-x-0 -top-16 -z-10 flex transform-gpu justify-center overflow-hidden blur-3xl"
          >
            <div
              style={{
                clipPath:
                  "polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)",
              }}
              className="aspect-[1318/752] w-[82.375rem] flex-none bg-gradient-to-r from-[#00ff88] to-[#4f46e5] opacity-25"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

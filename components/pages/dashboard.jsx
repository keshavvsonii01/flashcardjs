"use client";

import React, { useEffect } from "react";
import { Brain } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { getUserFromLocalStorage } from "@/utils/getUserFromLocalStorage"; // Adjust the import path as needed

function Dashboard() {
  const router = useRouter();
  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
      });
      router.push("/login");
    } catch (e) {
      console.error("Logout error:", e);
      // Optionally handle error, e.g., show a notification
    }
  };

  const [topic, setTopic] = useState("");
  const [numCards, setNumCards] = useState(5);
  const [difficulty, setDifficulty] = useState("beginner");
  const [user, setUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🔍 Submitted values:", { topic, numCards, difficulty });

    try {
      // Step 1: Generate flashcards using Gemini AI
      const genRes = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic, numCards, difficulty }),
      });

      if (!genRes.ok) {
        const errorData = await genRes.json();
        console.error("❌ Error generating flashcards:", errorData.error);
        return; // stop execution
      }

      const genData = await genRes.json();
      const generatedCards = genData.cards;

      console.log("✅ Flashcards generated:", generatedCards);

      // Step 2: Save flashcards to MongoDB
      const saveRes = await fetch("/api/save-flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic,
          difficulty,
          numCards,
          cards: generatedCards,
        }),
      });

      if (!saveRes.ok) {
        const saveError = await saveRes.json();
        console.error("❌ Failed to save flashcards:", saveError.error);
        return; // stop execution
      }

      console.log("💾 Flashcards saved successfully!");

      // Step 3: Navigate to viewer page
      const encoded = encodeURIComponent(JSON.stringify(generatedCards));
      window.location.href = `/flashcards/view?data=${encoded}&new=true`;
    } catch (err) {
      console.error("🔥 Unexpected error:", err);
    }
  };

  useEffect(() => {
    const user = getUserFromLocalStorage();

    setUser(user);

    if (!user) {
      router.push("/login");
    }
  }, []);

  return (
    <>
      <div className="text-shadow-2xs">
        <div className="h-svh">
          <div className="max-w-2xl mx-auto h-full">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-3 mt-3 bg-blue-50 rounded-full">
                  <Brain className="h-8 w-8 text-black " />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-100 dark:text-white mb-2">
                Create AI Flashcards
              </h1>
              <p className="text-gray-200 dark:text-gray-400">
                Generate personalized flashcards on any topic using AI.
              </p>
            </div>
            <div className="p-6 text-white">
              {user ? (
                <h2 className="text-2xl font-bold mb-4">
                  Welcome, {user.name}
                </h2>
              ) : (
                <h2 className="text-2xl font-bold mb-4">Welcome</h2>
              )}

              {/* rest of your dashboard content */}
            </div>
            <div
              className="bg-[#0e0f12] dark:bg-gray-800 rounded-lg  border drop-shadow-2xl drop-shadow-fuchsia-900 shadow-xl shadow-fuchsia-900 border-gray-200 dark:border-gray-700 p-9"
              style={{
                boxShadow: "0 0 20px 5px rgba(199, 21, 133, 0.7)",
              }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* {error && (
                  <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-md">
                    {error}
                  </div>
                )} */}

                <div>
                  <label
                    htmlFor="topic"
                    className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2"
                  >
                    Topic or Subject
                  </label>
                  <input
                    type="text"
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2 text-white  border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-gray-300 focus:border-white dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., Spanish vocabulary, Biology cells, JavaScript concepts"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-400 dark:text-gray-400">
                    Be specific for better results (e.g., "French irregular
                    verbs" instead of just "French")
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="numCards"
                    className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2"
                  >
                    Number of Cards
                  </label>
                  <select
                    id="numCards"
                    value={numCards}
                    onChange={(e) =>
                      setNumCards(Number.parseInt(e.target.value))
                    }
                    className="w-full px-3 py-2 text-black border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-gray-200 focus:border-gray-200 bg-gray-100 dark:text-white"
                  >
                    <option value={5}>5 cards</option>
                    <option value={10}>10 cards</option>
                    <option value={15}>15 cards</option>
                    <option value={20}>20 cards</option>
                    <option value={25}>25 cards</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="difficulty"
                    className="block text-sm font-medium text-gray-300 dark:text-gray-300 mb-2"
                  >
                    Difficulty Level
                  </label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 text-black border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-gray-200 focus:border-gray-200 bg-gray-100 dark:text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="medium">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <button
                  type="submit"
                  //   disabled={isGenerating || !topic.trim()}
                  className="w-full flex items-center justify-center space-x-2 bg-gray-950 text-white border  py-3 px-4 rounded-md hover:bg-white hover:text-black hover:border-neutral-950 hover:border-2 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-shadow-2xs"
                >
                  {/* {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generating Flashcards...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      <span>Generate Flashcards</span>
                    </>
                  )} */}
                  Generate
                </button>
              </form>

              <div className="mt-8 -mb-4 p-4 bg-slate-50 dark:bg-blue-900/20 rounded-md">
                <h3 className="text-sm font-medium text-gray-950 dark:text-blue-200 mb-2">
                  💡 Tips for better flashcards:
                </h3>
                <ul className="text-sm text-gray-950 space-y-1">
                  <li>
                    • Be specific with your topic (e.g., "World War 2 battles"
                    vs "History")
                  </li>
                  <li>
                    • Choose the right difficulty level for your current
                    knowledge
                  </li>
                  <li>• Start with fewer cards and add more as needed</li>
                </ul>
              </div>
            </div>
            <div>
              <button className="text-white" onClick={logout}>
                LogOut
              </button>
              <Link href="/flashcards/view" className="text-blue-600 underline">
                View Your Flashcards
              </Link>
              <a
                href="/flashcards/practice"
                className="inline-block mt-4 text-blue-500 underline hover:text-blue-700"
              >
                ➤ Start Practice Mode
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;

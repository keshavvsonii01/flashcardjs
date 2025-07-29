"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getUserFromLocalStorage } from "@/utils/getUserFromLocalStorage";
export default function FlashcardView() {
  const [flashcardsByDate, setFlashcardsByDate] = useState({});
  const [expandedDates, setExpandedDates] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isNewSession, setIsNewSession] = useState(false);
  const [newSessionCards, setNewSessionCards] = useState([]);
  const [user, setUser] = useState(null);

  const searchParams = useSearchParams();

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const res = await fetch("/api/user-flashcards");
        const data = await res.json();

        if (!res.ok) {
          console.error("Error fetching flashcards:", data.error);
          return;
        }

        const newOnly = searchParams.get("new");
        const encodedData = searchParams.get("data");

        // Show only newly generated cards passed via URL
        if (newOnly === "true" && encodedData) {
          try {
            const decoded = JSON.parse(decodeURIComponent(encodedData));
            if (Array.isArray(decoded)) {
              setNewSessionCards(decoded);
              setIsNewSession(true);
            } else {
              console.error("Decoded data is not an array.");
            }
          } catch (err) {
            console.error("Error decoding flashcards from URL:", err);
          }
        } else {
          // Show all flashcards by default
          setFlashcardsByDate(data);
        }
      } catch (err) {
        console.error("Failed to fetch flashcards", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [searchParams]);

  const toggleExpand = (date) => {
    setExpandedDates((prev) => {
      const newSet = new Set(prev);
      newSet.has(date) ? newSet.delete(date) : newSet.add(date);
      return newSet;
    });
  };

  useEffect(() => {
    const user = getUserFromLocalStorage();

    setUser(user);

    if (!user) {
      router.push("/login");
    }
  });

  return (
    <div className="p-6 text-white">
      {user && <p className="text-gray-600 text-4xl mb-2">Viewing as: {user.name}</p>}
      <h1 className="text-2xl font-bold mb-4">Your Saved Flashcards</h1>

      {isNewSession && (
        <button
          onClick={() => (window.location.href = "/flashcards/view")}
          className="mb-6 text-blue-500 underline hover:text-blue-700"
        >
          See all saved flashcards →
        </button>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : isNewSession ? (
        // Show only new session cards
        <div className="space-y-4">
          {newSessionCards.map((entry, index) => (
            <div
              key={index}
              className="border rounded-xl shadow p-4 bg-white hover:shadow-lg transition"
            >
              <h2 className="font-semibold text-black">
                Q{index + 1}: {entry.question}
              </h2>
              <p className="mt-2 text-gray-700">Answer: {entry.answer}</p>
            </div>
          ))}
        </div>
      ) : Object.keys(flashcardsByDate).length === 0 ? (
        <p>No flashcards found.</p>
      ) : (
        Object.entries(flashcardsByDate).map(([date, cards]) => (
          <div key={date} className="mb-6">
            <button
              onClick={() => toggleExpand(date)}
              className="text-lg font-semibold underline hover:text-blue-400"
            >
              {date} ({cards.reduce((acc, card) => acc + card.cards.length, 0)}{" "}
              flashcards)
            </button>

            {expandedDates.has(date) && (
              <div className="mt-4 space-y-3">
                {cards.map((card, index) => (
                  <div key={index} className="space-y-4">
                    {card.cards.map((entry, i) => (
                      <div
                        key={i}
                        className="border rounded-xl shadow p-4 bg-white hover:shadow-lg transition"
                      >
                        <h2 className="font-semibold text-black">
                          Q{index + 1}.{i + 1}: {entry.question}
                        </h2>
                        <p className="mt-2 text-gray-700">
                          Answer: {entry.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

export default function FlashcardView() {
  const [flashcardsByDate, setFlashcardsByDate] = useState({});
  const [expandedDates, setExpandedDates] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const res = await fetch("/api/user-flashcards"); // Make sure this route exists and returns grouped flashcards
        const data = await res.json();
        if (res.ok) {
          setFlashcardsByDate(data);
        } else {
          console.error("Error fetching flashcards:", data.error);
        }
      } catch (err) {
        console.error("Failed to fetch flashcards", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, []);

  const toggleExpand = (date) => {
    setExpandedDates((prev) => {
      const newSet = new Set(prev);
      newSet.has(date) ? newSet.delete(date) : newSet.add(date);
      return newSet;
    });
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Your Saved Flashcards</h1>
      {loading ? (
        <p>Loading...</p>
      ) : Object.keys(flashcardsByDate).length === 0 ? (
        <p>No flashcards found.</p>
      ) : (
        Object.entries(flashcardsByDate).map(([date, cards]) => (
          <div key={date} className="mb-6">
            <button
              onClick={() => toggleExpand(date)}
              className="text-lg font-semibold underline hover:text-blue-400"
            >
              {date} (
              {cards.reduce((acc, card) => acc + card.cards.length, 0)} flashcards)
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
                        <p className="mt-2 text-gray-700">Answer: {entry.answer}</p>
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

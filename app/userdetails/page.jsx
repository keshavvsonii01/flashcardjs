"use client";
import { useEffect, useState } from "react";

export default function FlashcardHistoryPage() {
  const [data, setData] = useState({});
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const fetchFlashcards = async () => {
      const res = await fetch("/api/user-flashcards");
      const json = await res.json();
      setData(json);
    };
    fetchFlashcards();
  }, []);

  const toggleExpand = (date) => {
    setExpanded((prev) => ({ ...prev, [date]: !prev[date] }));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Your Flashcards</h1>
      {Object.keys(data).map((date) => (
        <div key={date} className="mb-4 border rounded p-3">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => toggleExpand(date)}
          >
            <h2 className="text-lg font-semibold">{date}</h2>
            <span>{expanded[date] ? "▲" : "▼"}</span>
          </div>
          {expanded[date] && (
            <ul className="mt-2 space-y-2">
              {data[date].map((item, index) => (
                <li key={index} className="bg-gray-100 p-2 rounded">
                  <p><strong>Topic:</strong> {item.topic}</p>
                  <p><strong>Difficulty:</strong> {item.difficulty}</p>
                  <p><strong>Cards:</strong> {item.cards.length}</p>
                  {/* Optional: Add view button */}
                  <button
                    className="mt-1 text-blue-600 underline"
                    onClick={() =>
                      window.location.href = `/flashcards/view?data=${encodeURIComponent(JSON.stringify(item.cards))}`
                    }
                  >
                    View Flashcards
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

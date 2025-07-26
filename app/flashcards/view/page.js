"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function FlashcardView() {
  const searchParams = useSearchParams();
  const [cards, setCards] = useState([]);

  useEffect(() => {
    const raw = searchParams.get("data");
    if (raw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        setCards(parsed);
      } catch (err) {
        console.error("Invalid data format", err);
      }
    }
  }, [searchParams]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Generated Flashcards</h1>
      {cards.length === 0 ? (
        <p>No flashcards found.</p>
      ) : (
        <div className="space-y-4">
          {cards.map((card, index) => (
            <div
              key={index}
              className="border rounded-xl shadow p-4 bg-white hover:shadow-lg transition"
            >
              <h2 className="font-semibold">Q{index + 1}: {card.question}</h2>
              <p className="mt-2 text-gray-700">Answer: {card.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

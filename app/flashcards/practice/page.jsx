"use client";

import { useEffect, useState } from "react";

export default function PracticeModePage() {
  const [flashcards, setFlashcards] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [revisedCardsByTopic, setRevisedCardsByTopic] = useState(() => {
    return JSON.parse(localStorage.getItem("revisedCardsByTopic")) || {};
  });

  const fetchFlashcards = async () => {
    try {
      const res = await fetch("/api/user-flashcards");
      const data = await res.json();
      const allFlashcards = Object.values(data).flat();
      setFlashcards(allFlashcards);
      const uniqueTopics = [...new Set(allFlashcards.map((f) => f.topic))];
      setTopics(uniqueTopics);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "revisedCardsByTopic",
      JSON.stringify(revisedCardsByTopic)
    );
  }, [revisedCardsByTopic]);

  const currentRevised = revisedCardsByTopic[selectedTopic] || [];

  const matchedTopic = flashcards.find(
    (item) => item.topic?.toLowerCase() === selectedTopic.toLowerCase()
  );

  const filteredCards = matchedTopic ? matchedTopic.cards : [];

  const toggleRevised = async (cardId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("No token found");
      return;
    }

    let updatedRevised;
    if (currentRevised.includes(cardId)) {
      updatedRevised = currentRevised.filter((id) => id !== cardId);
    } else {
      updatedRevised = [...currentRevised, cardId];
    }

    setRevisedCardsByTopic((prev) => ({
      ...prev,
      [selectedTopic]: updatedRevised,
    }));

    try {
      const res = await fetch("/api/revision/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cardId }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("Revision save failed:", error);
      } else {
        console.log("Revision saved!");
      }
    } catch (err) {
      console.error("Revision save error:", err);
    }
  };

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Revision Mode</h1>

      {loading ? (
        <p>Loading topics...</p>
      ) : (
        <>
          <div className="mb-4">
            <label htmlFor="topic" className="block mb-2 font-semibold">
              Select a topic:
            </label>
            <select
              id="topic"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="border px-3 py-2 rounded-md"
            >
              <option className="text-black" value="">
                -- Choose a topic --
              </option>
              {topics.map((topic, index) => (
                <option className="text-black" key={index} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {selectedTopic === "" ? (
            <p>Please select a topic to start revision.</p>
          ) : filteredCards.length === 0 ? (
            <p>No flashcards available for this topic.</p>
          ) : (
            <div className="space-y-4">
              {filteredCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white border rounded-xl p-4 shadow-md relative"
                >
                  <p className="font-semibold text-black text-lg">
                    Q: {card.question}
                  </p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600 underline">
                      Show Answer
                    </summary>
                    <p className="mt-1 text-gray-800">{card.answer}</p>
                  </details>

                  <div className="absolute top-2 right-2">
                    <input
                      type="checkbox"
                      checked={currentRevised.includes(card._id)}
                      onChange={() => toggleRevised(card._id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedTopic && filteredCards.length > 0 && (
        <div className="mt-6 mb-4">
          <p className="text-sm text-gray-700 mt-2">
            Revised {currentRevised.length} of {filteredCards.length} cards
          </p>

          <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{
                width: `${
                  (currentRevised.length / filteredCards.length) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

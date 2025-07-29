"use client";
import { useEffect, useState } from "react";

export default function PracticeModePage() {
  const [flashcards, setFlashcards] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFlashcards = async () => {
    try {
      const res = await fetch("/api/user-flashcards"); // must be GET
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();

      // ✅ Flatten the grouped flashcards
      const allFlashcards = Object.values(data).flat();
      console.log("Flattened flashcards:", allFlashcards);

      setFlashcards(allFlashcards);

      // ✅ Extract unique topics
      const uniqueTopics = [...new Set(allFlashcards.map(f => f.topic))];
      console.log("Topics extracted:", uniqueTopics);

      setTopics(uniqueTopics);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const filteredCards = selectedTopic
    ? flashcards.filter((card) => card.topic === selectedTopic)
    : [];

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-4">Practice Mode</h1>

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
              <option value="">-- Choose a topic --</option>
              {topics.map((topic, index) => (
                <option key={index} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {selectedTopic === "" ? (
            <p>Please select a topic to start practicing.</p>
          ) : filteredCards.length === 0 ? (
            <p>No flashcards available for this topic.</p>
          ) : (
            <div className="space-y-4">
              {filteredCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-white border rounded-xl p-4 shadow-md"
                >
                  <p className="font-semibold text-lg">Q: {card.question}</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600 underline">
                      Show Answer
                    </summary>
                    <p className="mt-1 text-gray-800">{card.answer}</p>
                  </details>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";

export default function PracticeModePage() {
  const [flashcards, setFlashcards] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [revisedCards, setRevisedCards] = useState(
    () => JSON.parse(localStorage.getItem("revisedCards")) || []
  );

  const fetchFlashcards = async () => {
    try {
      const res = await fetch("/api/user-flashcards");
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      const data = await res.json();

      // ✅ Flatten the grouped flashcards
      const allFlashcards = Object.values(data).flat(); // each value is an array
      console.log("Flattened flashcards:", allFlashcards);

      setFlashcards(allFlashcards);

      // ✅ Extract unique topics
      const uniqueTopics = [...new Set(allFlashcards.map((f) => f.topic))];
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

  const matchedTopic = flashcards.find(
    (item) => item.topic?.toLowerCase() === selectedTopic.toLowerCase()
  );

  const filteredCards = matchedTopic ? matchedTopic.cards : [];

  console.log(
    "All flashcard topics:",
    flashcards.map((f) => f.topic)
  );

  console.log("Selected topic:", selectedTopic);
  console.log("Filtered Cards:", filteredCards);

  useEffect(() => {
    localStorage.setItem("revisedCards", JSON.stringify(revisedCards));
  }, [revisedCards]);

  const toggleRevised = (cardId) => {
    setRevisedCards((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

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
            <p>Please select a topic to start practicing.</p>
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

                  {/* Mark as Revised */}
                  <div className="absolute top-2 right-2">
                    <input
                      type="checkbox"
                      checked={revisedCards.includes(card._id)}
                      onChange={() => toggleRevised(card._id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      <div className="mb-4">
        <p className="text-sm text-gray-700">
          Revised {revisedCards.length} of {filteredCards.length} cards
        </p>
        <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
          <div
            className="bg-green-500 h-2 rounded-full"
            style={{
              width: `${(revisedCards.length / filteredCards.length) * 100}%`,
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}

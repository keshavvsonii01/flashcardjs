"use client";

import { useEffect, useState } from "react";

export default function PracticeModePage() {
  const [flashcards, setFlashcards] = useState([]); // array of groups { topic, cards: [...] }
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [loading, setLoading] = useState(true);
  const [revisedCardsByTopic, setRevisedCardsByTopic] = useState({}); // { [topic]: [cardId, ...] }
  const [savingCardId, setSavingCardId] = useState(null); // for optional UI feedback

  // Fetch all flashcard groups (grouped by date on the server)
  const fetchFlashcards = async () => {
    try {
      const res = await fetch("/api/user-flashcards");
      const data = await res.json();
      // `data` is an object keyed by date -> array of flashcard groups
      const allGroups = Object.values(data).flat(); // flatten arrays of groups
      setFlashcards(allGroups);

      const uniqueTopics = [
        ...new Set(allGroups.map((g) => g.topic).filter(Boolean)),
      ];
      setTopics(uniqueTopics);
    } catch (err) {
      console.error("Error fetching flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch revision progress from the backend
  const fetchRevisionProgress = async () => {
    try {
      const res = await fetch("/api/revision/get");
      if (!res.ok) throw new Error("Failed to fetch revision progress");

      const data = await res.json();
      const revisedCardIds = data.revisedCardIds || []; // Fixed: use revisedCardIds from API response

      // Group revised cards by topic
      const grouped = {};
      revisedCardIds.forEach((cardId) => {
        // Find which flashcard group contains this card
        flashcards.forEach((group) => {
          if (group.cards) {
            group.cards.forEach((card) => {
              if (card._id.toString() === cardId) {
                if (!grouped[group.topic]) grouped[group.topic] = [];
                grouped[group.topic].push(cardId);
              }
            });
          }
        });
      });
      
      setRevisedCardsByTopic(grouped);
    } catch (err) {
      console.error("Error fetching revision progress:", err);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  // Fetch revision progress after flashcards are loaded
  useEffect(() => {
    if (flashcards.length > 0) {
      fetchRevisionProgress();
    }
  }, [flashcards]);

  // When selected topic changes, we already have all revision data loaded
  useEffect(() => {
    if (selectedTopic && flashcards.length > 0) {
      // Revision progress is already loaded globally, no need to fetch again
    }
  }, [selectedTopic]);

  // Helper: get array of individual card objects for the selected topic
  // Each `group` in flashcards has { topic, cards: [...] }
  const filteredCards = (() => {
    if (!selectedTopic) return [];
    // collect all `cards` from groups that match the selected topic
    const groups = flashcards.filter(
      (g) => g.topic && g.topic.toLowerCase() === selectedTopic.toLowerCase()
    );
    // flatten into individual card objects; keep card._id as string
    const cards = groups.flatMap((g) =>
      (g.cards || []).map((c) => {
        // Ensure _id is string (it should be from server)
        return { ...c, _id: String(c._id) };
      })
    );
    return cards;
  })();

  const currentRevised = revisedCardsByTopic[selectedTopic] || [];

  // Toggle revised: optimistic update + call backend to toggle (your save route toggles add/remove)
  const toggleRevised = async (cardId) => {
    if (!selectedTopic) return;
    
    // optimistic update
    const prevForTopic = revisedCardsByTopic[selectedTopic] || [];
    const isCurrently = prevForTopic.includes(cardId);
    const optimistic = isCurrently
      ? prevForTopic.filter((id) => id !== cardId)
      : [...prevForTopic, cardId];

    setRevisedCardsByTopic((prev) => ({
      ...prev,
      [selectedTopic]: optimistic,
    }));

    // call backend
    setSavingCardId(cardId);
    try {
      const res = await fetch("/api/revision/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId, topic: selectedTopic }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Status ${res.status}`);
      }

      const result = await res.json();
      console.log(`Revision ${result.action} for card ${cardId}`);
      
      // success — server toggles; we already updated optimistically
    } catch (err) {
      console.error("Revision save failed:", err);
      // revert optimistic update on failure
      setRevisedCardsByTopic((prev) => ({
        ...prev,
        [selectedTopic]: prevForTopic,
      }));
      alert("Failed to save revision progress. Please try again.");
    } finally {
      setSavingCardId(null);
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
              className="border px-3 py-2 rounded-md text-white bg-gray-800"
            >
              <option value="">-- Choose a topic --</option>
              {topics.map((topic) => (
                <option className="text-white bg-gray-800" key={topic} value={topic}>
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
              {filteredCards.map((card, idx) => (
                <div
                  key={card._id || idx}
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
                      checked={currentRevised.includes(card._id.toString())}
                      onChange={() => toggleRevised(card._id.toString())}
                      disabled={savingCardId === String(card._id)}
                      className="w-4 h-4"
                    />
                    {savingCardId === String(card._id) && (
                      <span className="ml-2 text-xs text-gray-500">Saving...</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {selectedTopic && filteredCards.length > 0 && (
        <div className="mt-6 mb-4">
          <p className="text-sm text-gray-300 mt-2">
            Revised {currentRevised.length} of {filteredCards.length} cards
          </p>

          <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  (currentRevised.length / filteredCards.length) * 100
                }%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
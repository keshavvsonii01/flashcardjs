"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getUserFromLocalStorage } from "@/utils/getUserFromLocalStorage";
import jsPDF from 'jspdf';

// PDF Export functionality
const generatePDF = async (content, filename) => {
  try {
    console.log('Generating PDF with content:', content);
    const pdf = new jsPDF();
    
    let yPosition = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const marginLeft = 20;
    const marginRight = 20;
    const pageWidth = pdf.internal.pageSize.width - marginLeft - marginRight;

    // Title
    pdf.setFontSize(18);
    pdf.setFont(undefined, 'bold');
    pdf.text(content.title, marginLeft, yPosition);
    yPosition += 15;

    // Date and Topic info
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Date: ${content.date}`, marginLeft, yPosition);
    yPosition += 8;
    
    if (content.topic) {
      pdf.text(`Topic: ${content.topic}`, marginLeft, yPosition);
      yPosition += 8;
    }

    pdf.text(`Total Cards: ${content.totalCards}`, marginLeft, yPosition);
    yPosition += 15;

    // Process each topic
    content.topics.forEach((topicData, topicIndex) => {
      if (content.topics.length > 1) {
        // Multiple topics - show topic header
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'bold');
        pdf.text(`Topic: ${topicData.topic}`, marginLeft, yPosition);
        yPosition += 10;
      }

      // Process cards
      topicData.cards.forEach((card, cardIndex) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        // Card number
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'bold');
        pdf.text(`Card ${cardIndex + 1}:`, marginLeft, yPosition);
        yPosition += 8;

        // Question
        pdf.setFont(undefined, 'bold');
        pdf.text('Q: ', marginLeft, yPosition);
        pdf.setFont(undefined, 'normal');
        
        const questionLines = pdf.splitTextToSize(card.question, pageWidth - 15);
        pdf.text(questionLines, marginLeft + 15, yPosition);
        yPosition += questionLines.length * 6 + 5;

        // Answer
        pdf.setFont(undefined, 'bold');
        pdf.text('A: ', marginLeft, yPosition);
        pdf.setFont(undefined, 'normal');
        
        const answerLines = pdf.splitTextToSize(card.answer, pageWidth - 15);
        pdf.text(answerLines, marginLeft + 15, yPosition);
        yPosition += answerLines.length * 6 + 10;

        // Add a separator line
        if (cardIndex < topicData.cards.length - 1) {
          pdf.setDrawColor(200, 200, 200);
          pdf.line(marginLeft, yPosition, pageWidth + marginLeft, yPosition);
          yPosition += 10;
        }
      });

      // Space between topics
      if (topicIndex < content.topics.length - 1) {
        yPosition += 15;
      }
    });

    // Save the PDF
    pdf.save(filename);
    console.log('PDF saved successfully:', filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

const PDFExportButton = ({ 
  exportType, 
  date, 
  topic = null, 
  flashcardData, 
  topicCards = null,
  className = "" 
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let content;
      let filename;

      if (exportType === 'date') {
        // Export entire date - transform your data structure
        const dateData = flashcardData[date] || [];
        
        // Group by topics like your existing logic
        const topicMap = {};
        dateData.forEach((entry) => {
          const topicName = entry.topic || "Untitled";
          if (!topicMap[topicName]) topicMap[topicName] = [];
          topicMap[topicName].push(...entry.cards);
        });

        const totalCards = Object.values(topicMap).reduce((sum, cards) => sum + cards.length, 0);

        content = {
          title: `Flashcards - ${date}`,
          date: date,
          topic: null,
          totalCards: totalCards,
          topics: Object.entries(topicMap).map(([topicName, cards]) => ({
            topic: topicName,
            cards: cards
          }))
        };
        
        filename = `flashcards_${date.replace(/[\/\s]/g, '-')}.pdf`;
      } else {
        // Export specific topic
        content = {
          title: `Flashcards - ${topic}`,
          date: date,
          topic: topic,
          totalCards: topicCards.length,
          topics: [{
            topic: topic,
            cards: topicCards
          }]
        };
        
        filename = `flashcards_${topic.replace(/[\/\s]/g, '-')}_${date.replace(/[\/\s]/g, '-')}.pdf`;
      }

      const success = await generatePDF(content, filename);
      
      if (success) {
        alert('PDF exported successfully!');
      } else {
        alert('Failed to export PDF. Please try again.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('An error occurred while exporting. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md transition-colors ml-2 ${
        isExporting
          ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      } ${className}`}
    >
      {isExporting ? (
        <>
          <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Exporting...
        </>
      ) : (
        <>
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PDF
        </>
      )}
    </button>
  );
};

export default function FlashcardView() {
  const [flashcardsByDate, setFlashcardsByDate] = useState({});
  const [expandedDates, setExpandedDates] = useState(new Set());
  const [expandedTopics, setExpandedTopics] = useState({});
  const [loading, setLoading] = useState(true);
  const [isNewSession, setIsNewSession] = useState(false);
  const [newSessionCards, setNewSessionCards] = useState([]);
  const [user, setUser] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch user
  useEffect(() => {
    const user = getUserFromLocalStorage();
    setUser(user);
    if (!user) {
      router.push("/login");
    }
  }, []);

  // Fetch flashcards
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

        if (newOnly === "true" && encodedData) {
          try {
            const decoded = JSON.parse(decodeURIComponent(encodedData));
            if (Array.isArray(decoded)) {
              setNewSessionCards(decoded);
              setIsNewSession(true);
              setFlashcardsByDate({}); // Clear old data
            } else {
              console.error("Decoded data is not an array.");
            }
          } catch (err) {
            console.error("Error decoding flashcards from URL:", err);
          }
        } else {
          setNewSessionCards([]);
          setIsNewSession(false);
          setFlashcardsByDate(data);
        }
      } catch (err) {
        console.error("Failed to fetch flashcards", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [searchParams.toString()]);

  const toggleExpand = (date) => {
    setExpandedDates((prev) => {
      const newSet = new Set(prev);
      newSet.has(date) ? newSet.delete(date) : newSet.add(date);
      return newSet;
    });
  };

  const toggleTopic = (date, topic) => {
    setExpandedTopics((prev) => {
      const copy = { ...prev };
      if (!copy[date]) copy[date] = new Set();
      if (copy[date].has(topic)) {
        copy[date].delete(topic);
      } else {
        copy[date].add(topic);
      }
      return { ...copy };
    });
  };

  // Export new session cards as PDF
  const handleExportNewSession = async () => {
    if (newSessionCards.length === 0) return;

    const content = {
      title: `New Session Flashcards`,
      date: new Date().toLocaleDateString(),
      topic: null,
      totalCards: newSessionCards.length,
      topics: [{
        topic: "New Session",
        cards: newSessionCards
      }]
    };

    const filename = `new_session_flashcards_${new Date().toISOString().split('T')[0]}.pdf`;
    
    try {
      const success = await generatePDF(content, filename);
      if (success) {
        alert('PDF exported successfully!');
      } else {
        alert('Failed to export PDF. Please try again.');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('An error occurred while exporting. Please try again.');
    }
  };

  return (
    <div className="p-6 text-white">
      {user && (
        <p className="text-gray-600 text-4xl mb-2">Viewing as: {user.name}</p>
      )}
      <h1 className="text-2xl font-bold mb-4">Your Saved Flashcards</h1>

      <a
        href="/flashcards/practice"
        className="inline-block mt-4 text-blue-500 underline hover:text-blue-700"
      >
        ➤ Start Practice Mode
      </a>

      {isNewSession && (
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => router.push("/flashcards/view")}
            className="text-blue-500 underline hover:text-blue-700"
          >
            See all saved flashcards →
          </button>
          <button
            onClick={handleExportNewSession}
            className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-md transition-colors bg-green-600 text-white hover:bg-green-700"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export New Cards as PDF
          </button>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : isNewSession ? (
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
        Object.entries(flashcardsByDate).map(([date, cardEntries]) => {
          // Group cards by topic
          const topicMap = {};
          cardEntries.forEach((entry) => {
            const topic = entry.topic || "Untitled";
            if (!topicMap[topic]) topicMap[topic] = [];
            topicMap[topic].push(...entry.cards);
          });

          return (
            <div key={date} className="mb-6">
              <div className="flex items-center">
                <button
                  onClick={() => toggleExpand(date)}
                  className="text-lg font-semibold underline hover:text-blue-400"
                >
                  {date} (
                  {cardEntries.reduce(
                    (acc, entry) => acc + (entry.cards?.length || 0),
                    0
                  )}{" "}
                  flashcards)
                </button>
                
                {/* Export entire date button */}
                <PDFExportButton
                  exportType="date"
                  date={date}
                  flashcardData={flashcardsByDate}
                />
              </div>

              {expandedDates.has(date) && (
                <div className="mt-4 space-y-3">
                  {Object.entries(topicMap).map(([topic, entries], index) => (
                    <div key={topic} className="mb-4">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleTopic(date, topic)}
                          className="ml-2 text-md font-medium underline hover:text-green-400"
                        >
                          {topic} ({entries.length})
                        </button>
                        
                        {/* Export topic button */}
                        <PDFExportButton
                          exportType="topic"
                          date={date}
                          topic={topic}
                          topicCards={entries}
                          flashcardData={flashcardsByDate}
                        />
                      </div>

                      {expandedTopics[date]?.has(topic) && (
                        <div className="mt-2 space-y-3">
                          {entries.map((entry, i) => (
                            <div
                              key={i}
                              className="border rounded-xl shadow p-4 bg-white hover:shadow-lg transition"
                            >
                              <h2 className="font-semibold text-black">
                                Q{i + 1}: {entry.question}
                              </h2>
                              <p className="mt-2 text-gray-700">
                                Answer: {entry.answer}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
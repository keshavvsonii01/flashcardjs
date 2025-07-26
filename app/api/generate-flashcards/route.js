import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(req) {
  const { topic, numCards, difficulty } = await req.json();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite	" });

    const prompt = `
        Generate ${numCards} flashcards on the topic "${topic}" at a ${difficulty} level. Each flashcard should have a question and an answer. Make sure the questions are clear and concise, and the answers are accurate and informative.
         Format the output as a JSON array of objects like:
        [{ "question": "...", "answer": "..." }]`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const cleanText = response
      .replace(/^```json/, "") // remove starting ```json
      .replace(/^```/, "") // just in case it's ``` without json
      .replace(/```$/, "") // remove ending ```
      .trim();

    const parsed = JSON.parse(cleanText);

    return new Response(JSON.stringify({ cards: parsed }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    console.error("Error generating flashcards:", e);
    return new Response(
      JSON.stringify({ error: "Failed to generate flashcards" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}

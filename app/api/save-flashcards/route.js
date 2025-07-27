import connectDB from "@/lib/db";
import FlashCardDetails from "@/models/FlashCardSchema";
import {getJWTPayload} from "@/utils/auth"
import UserDetails from "@/models/Logindetails";

export async function POST(req) {
    await connectDB();

    const token = req.headers.get("cookie")?.split("token=")[1]?.split(";")[0];

    if(!token) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    try{
        const payload = await getJWTPayload(token);
        const user = await UserDetails.findOne({ email: payload.email });

        if(!user) {
            return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
        }

        const { topic, difficulty, numCards, cards } = await req.json();

        const newFlashcard = new FlashCardDetails({
            userId: user._id,
            topic,
            difficulty,
            numCards,
            cards
        });

        await newFlashcard.save();

        return new Response(JSON.stringify({ message: "Flashcard saved successfully" }), { status: 201 });
    }
    catch(e) {
        console.error("Error saving flashcard:", e);
        return new Response(JSON.stringify({ error: "Internal Server Error", details: e.message }), { status: 500 });
    }
}
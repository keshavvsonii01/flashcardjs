import connectDB from "@/lib/db";
import UserDetails from "@/models/Logindetails";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try{
        await connectDB();
        const { email, password } = await req.json();

        
        const user = await UserDetails.findOne({ email });
        if(!user) return Response.json({ error: "User not found" }, { Status: 401});

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return Response.json({ error: "Invalid credentials" }, { Status: 401 });

        return Response.json({ message: "Login successful" },{user : {email: user.email}} ,{ Status: 200 });
    }
    catch(e) {
        console.error("Login error:", e);
        return Response.json({ error: "Internal server error" }, { Status: 500 });
    }
}
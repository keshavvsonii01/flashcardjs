import connectDB from "@/lib/db";
import UserDetails from "@/models/Logindetails";
import bcrypt from "bcryptjs";


export async function POST(req) {
    try{
        const {name, email, password} = await req.json();
        await connectDB();

        const existingUser = await UserDetails.findOne({ email });
        if(existingUser) {
            return Response.json({ error : 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await UserDetails.create({
            name,
            email,
            password: hashedPassword
        })

        return Response.json({ message: 'User registered successfully', user: { email: newUser.email } }, { status: 201 });
    }
    catch (e) {
        console.error("Registration error:", e);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
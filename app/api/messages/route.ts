import { NextRequest, NextResponse } from "next/server";
import clientPromise from "../../../lib/mongodb"; // Ensure correct path

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("chatDB"); // Use correct DB name
    const messages = await db.collection("messages").find().sort({ timestamp: -1 }).toArray();

    return NextResponse.json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { senderId, receiverId, content } = await req.json();

    // 🛑 Validate input
    if (!senderId || !receiverId || !content?.trim()) {
      return NextResponse.json({ error: "Invalid input: senderId, receiverId, and content are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("chatDB");

    const newMessage = {
      senderId,
      receiverId,
      content,
      timestamp: new Date(),
    };

    const result = await db.collection("messages").insertOne(newMessage);

    return NextResponse.json({ _id: result.insertedId, ...newMessage }, { status: 201 });
  } catch (error) {
    console.error("❌ Error inserting message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}

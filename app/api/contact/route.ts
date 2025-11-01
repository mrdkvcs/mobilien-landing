import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data || !data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json({ success: false, error: "VALIDATION" }, { status: 400 });
    }

    const response = await fetch("https://api.mobilien.app/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Agent API error");
    }

    const result = await response.json();
    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error("/api/contact error", error);
    return NextResponse.json({ success: false, error: "FAILED" }, { status: 500 });
  }
}



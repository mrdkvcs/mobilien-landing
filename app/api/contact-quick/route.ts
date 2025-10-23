import { NextResponse } from "next/server";
import { sendQuickContactEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const ua = req.headers.get("user-agent") || undefined;
    const ip = req.headers.get("x-forwarded-for") || undefined;
    const body = await req.json().catch(() => ({}));

    await sendQuickContactEmail({
      source: "landing/kontakt-button",
      userAgent: ua,
      ip,
      extras: body && typeof body === "object" ? body : {},
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("contact-quick error", error);
    return NextResponse.json({ success: false, error: "MAIL_FAILED" }, { status: 500 });
  }
}



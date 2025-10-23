import { NextResponse } from "next/server";
import { sendContactFormEmail, ContactFormData } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const data = (await req.json()) as Partial<ContactFormData>;

    if (!data || !data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json({ success: false, error: "VALIDATION" }, { status: 400 });
    }

    await sendContactFormEmail({
      company: data.company || "",
      name: String(data.name),
      email: String(data.email),
      phone: data.phone ? String(data.phone) : "",
      subject: String(data.subject),
      message: String(data.message),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("/api/contact error", error);
    return NextResponse.json({ success: false, error: "MAIL_FAILED" }, { status: 500 });
  }
}



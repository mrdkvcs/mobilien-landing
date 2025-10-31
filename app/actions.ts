"use server";
import { z } from "zod";

// Define schema for form validation
const newsletterSchema = z.object({
  email: z.string().email({ message: "Érvényes email címet adjon meg" }),
});

export type SubscriptionStatus = {
  success: boolean;
  message: string;
};

export async function subscribeToNewsletter(
  formData: FormData,
): Promise<SubscriptionStatus> {
  try {
    // Extract and validate form data
    const email = formData.get("email") as string;
    // Validate the data
    const validatedData = newsletterSchema.parse({ email });

    // Call Mobilien API to store newsletter signup
    const resp = await fetch("https://api.mobilien.app/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: validatedData.email, source: "landing" }),
      // Ensure server-side fetch, no caching
      cache: "no-store",
    });

    let payload: any = null;
    try {
      payload = await resp.json();
    } catch (_) {
      // ignore JSON parse errors
    }

    if (!resp.ok) {
      const msg = payload?.error || payload?.message || "Nem sikerült a feliratkozás";
      return { success: false, message: msg };
    }

    return {
      success: true,
      message: "Sikeres feliratkozás! Köszönjük érdeklődését.",
    };
  } catch (error) {
    console.error("Subscription error:", error);

    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Érvényes email címet adjon meg",
      };
    }

    return {
      success: false,
      message:
        "Hiba történt a feliratkozás során. Kérjük, próbálja újra később.",
    };
  }
}

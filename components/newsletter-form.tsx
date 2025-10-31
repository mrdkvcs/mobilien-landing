"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { toast, ToastContainer } from "react-toastify";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!privacyAccepted) {
      toast.error(
        `Kérjük, fogadja el az adatvédelmi szabályzatot a folytatáshoz.`,
        {
          position: "top-center",
          autoClose: 5000,
        },
      );
      return;
    }
    try {
      const emailVal = email.trim().toLowerCase();
      const resp = await fetch("https://api.mobilien.app/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailVal, source: "landing" }),
      });
      const data = await resp.json().catch(() => ({} as any));
      if (!resp.ok) {
        toast.error(
          data?.error || data?.message || "Hiba történt a feliratkozás során. Kérjük, próbálja újra később.",
          { position: "top-center", autoClose: 5000 },
        );
        setPrivacyAccepted(false);
        return;
      }
      toast.success("Sikeres feliratkozás! Köszönjük érdeklődését.", {
        position: "top-center",
        autoClose: 3000,
      });
      setEmail("");
      setPrivacyAccepted(false);
    } catch (error) {
      toast.error(
        "Nem sikerült kapcsolódni a szerverhez. Kérjük, próbálja újra később.",
        {
          position: "top-center",
          autoClose: 5000,
        },
      );
      setPrivacyAccepted(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="email"
              name="email"
              placeholder="Add meg az email címed"
              className="bg-[#FFFBFC] border-0 h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button
            type="submit"
            className="bg-black hover:bg-black/90 h-12"
          >
            <Mail className="mr-2 h-4 w-4" />
            Feliratkozás
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="privacy"
            checked={privacyAccepted}
            onCheckedChange={(checked) =>
              setPrivacyAccepted(checked as boolean)
            }
            className="data-[state=checked]:bg-[#007AAD]"
          />
          <Label
            htmlFor="privacy"
            className="text-sm text-[#D9E2E9] cursor-pointer"
          >
            Elolvastam és elfogadom az{" "}
            <Link
              href="/privacy-policy"
              className="text-[#007AAD] hover:underline"
            >
              Adatvédelmi szabályzatot
            </Link>
          </Label>
        </div>
      </form>
      <ToastContainer />
    </>
  );
}

"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import { subscribeToNewsletter } from "@/app/actions";
import { toast, ToastContainer } from "react-toastify";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  async function handleSubmit(formData: FormData) {
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
      const result = await subscribeToNewsletter(formData);

      if (result.success) {
        toast.success(`${result.message}`, {
          position: "top-center",
          autoClose: 3000,
        });
        setEmail(""); // Clear the form on success
        setPrivacyAccepted(false);
      } else {
        toast.error(`${result.message}`, {
          position: "top-center",
          autoClose: 5000,
        });
        setPrivacyAccepted(false);
      }
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
      <form
        action={handleSubmit}
        className="flex flex-col gap-4 max-w-md mx-auto"
      >
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

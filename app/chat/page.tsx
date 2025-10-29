"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // scroll to bottom on new messages
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const sendMessage = useCallback(async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setErrorText(null);
    setMessages(prev => [...prev, { role: "user", content: trimmed }]);
    setInputValue("");

    console.log('[frontend] sending message:', trimmed);

    try {
      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      console.log('[frontend] response status:', res.status);

      if (!res.ok) {
        const text = await res.text();
        console.error('[frontend] error response:', text);
        throw new Error(text || `Hálózati hiba: ${res.status}`);
      }

      const data: { reply?: string } = await res.json();
      console.log('[frontend] received data:', data);
      const reply = data?.reply?.trim() || "";
      setMessages(prev => [...prev, { role: "assistant", content: reply || "(nincs válasz)" }]);
    } catch (err: any) {
      console.error('[frontend] exception:', err);
      setErrorText(err?.message || "Ismeretlen hiba történt");
    } finally {
      setIsSending(false);
    }
  }, [inputValue, isSending]);

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#FFFBFC] text-[#0C1D32]">
      <div className="mx-auto w-[min(960px,92%)] py-8">
        <h1 className="text-2xl font-semibold">Chat (OpenRouter GPT API)</h1>
        <p className="text-sm text-[#0C1D32]/70 mt-1">
          Írj egy üzenetet, a rendszer továbbítja az Agent szerver felé: http://localhost:3000/api/chat
        </p>

        <div className="mt-6 grid gap-4">
          <div
            ref={listRef}
            className="h-[56vh] overflow-y-auto rounded-xl border border-[#D9E2E9] bg-white p-4"
          >
            {messages.length === 0 ? (
              <div className="text-sm text-[#0C1D32]/60">Kezdd a beszélgetést egy üzenettel…</div>
            ) : (
              <ul className="space-y-4">
                {messages.map((m, idx) => (
                  <li key={idx} className="flex">
                    <div
                      className={
                        m.role === "user"
                          ? "ml-auto max-w-[80%] rounded-2xl bg-[#0C1D32] text-white px-4 py-2 shadow"
                          : "mr-auto max-w-[80%] rounded-2xl bg-[#F4F6F8] text-[#0C1D32] px-4 py-2 shadow"
                      }
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {errorText && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {errorText}
            </div>
          )}

          <div className="flex items-end gap-3">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Írd ide az üzeneted… (Enter = küldés, Shift+Enter = új sor)"
              className="min-h-[44px] max-h-[200px] flex-1 resize-y rounded-xl border border-[#D9E2E9] bg-white p-3 outline-none focus:ring-4 focus:ring-[#0066FF]/25"
            />
            <button
              onClick={sendMessage}
              disabled={isSending || !inputValue.trim()}
              className="h-[44px] shrink-0 rounded-xl px-5 font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(135deg,#0066FF,#00C2FF)" }}
            >
              {isSending ? "Küldés…" : "Küldés"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}



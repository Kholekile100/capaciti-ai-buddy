import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ArrowUp,
  CalendarClock,
  CheckSquare,
  FileText,
  Loader2,
  Mail,
  Sparkles,
  Square,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ChatMessage = { role: "user" | "assistant"; content: string };

export const workModes = [
  {
    id: "summarise",
    label: "Summarise",
    icon: FileText,
    focus: "condensing long notes, threads or documents into an executive summary",
    prompt:
      "Summarise this meeting into decisions, risks and next steps:\n\nPaste your notes or transcript here.",
  },
  {
    id: "email",
    label: "Draft email",
    icon: Mail,
    focus: "drafting clear, professional workplace emails and messages",
    prompt:
      "Draft a polite email to a client explaining that the delivery date moves one week later, and propose a new check-in.",
  },
  {
    id: "tasks",
    label: "Action items",
    icon: CheckSquare,
    focus: "extracting action items with owners, due dates and priority",
    prompt:
      "Turn these notes into action items with owners and due dates:\n\nPaste your notes here.",
  },
  {
    id: "plan",
    label: "Plan my week",
    icon: CalendarClock,
    focus: "prioritising work and building realistic daily or weekly plans",
    prompt:
      "Help me plan a focused week. I have 3 deadlines, 6 meetings and a report to finish. Suggest a day-by-day plan.",
  },
] as const;

export function Assistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modeId, setModeId] = useState<string>(workModes[0].id);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeMode = workModes.find((m) => m.id === modeId) ?? workModes[0];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming) return;

    const next: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setInput("");
    setError(null);
    setStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next, mode: activeMode.focus }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const message = (await response.text()) || "The assistant could not respond.";
        setMessages(next);
        setError(message);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages([...next, { role: "assistant", content: acc }]);
      }

      if (!acc.trim()) {
        setMessages(next);
        setError("The assistant returned an empty response. Please try again.");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages(next);
        setError("Network problem reaching the assistant. Please try again.");
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <div className="panel flex h-[640px] flex-col overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-4">
        <span className="mr-1 inline-flex items-center gap-2 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
          Workspace tools
        </span>
        {workModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => {
              setModeId(mode.id);
              setInput(mode.prompt);
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm transition-colors",
              mode.id === modeId
                ? "border-primary/40 bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <mode.icon className="size-4" aria-hidden="true" />
            {mode.label}
          </button>
        ))}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-5 py-6">
        {messages.length === 0 && (
          <div className="mx-auto max-w-md pt-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-brand glow-ring">
              <Sparkles className="size-6 text-primary-foreground" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">Ask Worksmart anything about your work</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Pick a tool above, or describe the task in your own words. Worksmart replies with
              structured, ready-to-use output.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
          >
            {message.role === "assistant" && (
              <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-brand">
                <Sparkles className="size-4 text-primary-foreground" aria-hidden="true" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                message.role === "user"
                  ? "bg-primary/15 text-foreground"
                  : "bg-surface-raised text-foreground/95",
              )}
            >
              {message.role === "assistant" && !message.content && streaming ? (
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Thinking…
                </span>
              ) : (
                <div className="space-y-3 [&_h1]:text-base [&_h2]:text-base [&_h3]:text-sm [&_li]:ml-4 [&_li]:list-disc [&_ol_li]:list-decimal [&_strong]:text-primary">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {error && (
          <p className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-foreground">
            {error}
          </p>
        )}
      </div>

      <form
        className="border-t border-border p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
      >
        <div className="flex items-end gap-3 rounded-2xl border border-border bg-surface p-3">
          <Textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void send(input);
              }
            }}
            placeholder={`Ask about ${activeMode.label.toLowerCase()}… (Shift + Enter for a new line)`}
            rows={2}
            className="min-h-[56px] resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
          />
          {streaming ? (
            <Button type="button" variant="secondary" size="icon" onClick={() => abortRef.current?.abort()} aria-label="Stop generating">
              <Square className="size-4" />
            </Button>
          ) : (
            <Button type="submit" size="icon" disabled={!input.trim()} aria-label="Send message">
              <ArrowUp className="size-4" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
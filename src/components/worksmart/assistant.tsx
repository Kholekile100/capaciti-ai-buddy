import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  ArrowUp,
  CalendarClock,
  Check,
  CheckSquare,
  Copy,
  FileText,
  Loader2,
  Mail,
  Pencil,
  RefreshCw,
  Save,
  Sparkles,
  Square,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { saveOutput } from "@/lib/saved-outputs";
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

type AssistantProps = {
  /** Restrict the assistant to a single workspace tool (used by the tool pages). */
  lockedModeId?: (typeof workModes)[number]["id"];
  /** Label used when saving an output to My Tasks. */
  saveLabel?: string;
  className?: string;
};

export function Assistant({ lockedModeId, saveLabel, className }: AssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modeId, setModeId] = useState<string>(lockedModeId ?? workModes[0].id);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [savedIndex, setSavedIndex] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeMode = workModes.find((m) => m.id === modeId) ?? workModes[0];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  async function run(history: ChatMessage[]) {
    setMessages([...history, { role: "assistant", content: "" }]);
    setError(null);
    setStreaming(true);
    setEditingIndex(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, mode: activeMode.focus }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const message = (await response.text()) || "The assistant could not respond.";
        setMessages(history);
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
        setMessages([...history, { role: "assistant", content: acc }]);
      }

      if (!acc.trim()) {
        setMessages(history);
        setError("The assistant returned an empty response. Please try again.");
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages(history);
        setError("Network problem reaching the assistant. Please try again.");
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming) return;
    setInput("");
    await run([...messages, { role: "user", content }]);
  }

  async function regenerate(index: number) {
    if (streaming) return;
    await run(messages.slice(0, index));
  }

  function commitEdit(index: number) {
    setMessages((current) =>
      current.map((message, i) => (i === index ? { ...message, content: draft } : message)),
    );
    setEditingIndex(null);
  }

  async function copy(index: number, content: string) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1600);
    } catch {
      setError("Copying to the clipboard was blocked by your browser.");
    }
  }

  function save(index: number, content: string) {
    saveOutput(saveLabel ?? activeMode.label, content);
    setSavedIndex(index);
    setTimeout(() => setSavedIndex(null), 1600);
  }

  return (
    <div className={cn("panel flex h-[640px] flex-col overflow-hidden", className)}>
      {!lockedModeId && (
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
      )}

      {lockedModeId && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
          <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest text-primary uppercase">
            <activeMode.icon className="size-3.5" aria-hidden="true" />
            {activeMode.label}
          </span>
          <button
            type="button"
            onClick={() => setInput(activeMode.prompt)}
            className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Use example prompt
          </button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-5">
        {messages.length === 0 && (
          <div className="mx-auto max-w-md pt-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-gradient-brand glow-ring">
              <Sparkles className="size-6 text-primary-foreground" aria-hidden="true" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">Ask Worksmart anything about your work</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Describe the task in your own words. Every result stays fully editable before you copy
              or save it.
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const isAssistant = message.role === "assistant";
          const isEditing = editingIndex === index;
          const isLast = index === messages.length - 1;
          const isPending = isAssistant && !message.content && streaming;

          return (
            <div
              key={index}
              className={cn("flex gap-3", isAssistant ? "justify-start" : "justify-end")}
            >
              {isAssistant && (
                <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl bg-gradient-brand">
                  <Sparkles className="size-4 text-primary-foreground" aria-hidden="true" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  isAssistant ? "bg-surface-raised text-foreground/95" : "bg-primary/15 text-foreground",
                )}
              >
                {isPending ? (
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Thinking…
                  </span>
                ) : isEditing ? (
                  <div className="space-y-3">
                    <Textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      rows={14}
                      aria-label="Edit AI output"
                      className="min-h-[220px] w-full resize-y bg-surface text-sm sm:w-[34rem]"
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => commitEdit(index)}>
                        <Check className="size-3.5" /> Save changes
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setEditingIndex(null)}>
                        <X className="size-3.5" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 [&_h1]:text-base [&_h2]:text-base [&_h3]:text-sm [&_li]:ml-4 [&_li]:list-disc [&_ol_li]:list-decimal [&_strong]:text-primary">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                )}

                {isAssistant && !isEditing && !isPending && message.content && (
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setDraft(message.content);
                        setEditingIndex(index);
                      }}
                    >
                      <Pencil className="size-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => save(index, message.content)}>
                      {savedIndex === index ? (
                        <>
                          <Check className="size-3.5" /> Saved
                        </>
                      ) : (
                        <>
                          <Save className="size-3.5" /> Save
                        </>
                      )}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => void copy(index, message.content)}>
                      {copiedIndex === index ? (
                        <>
                          <Check className="size-3.5" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" /> Copy
                        </>
                      )}
                    </Button>
                    {isLast && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={streaming}
                        onClick={() => void regenerate(index)}
                      >
                        <RefreshCw className="size-3.5" /> Regenerate
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

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
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => abortRef.current?.abort()}
              aria-label="Stop generating"
            >
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

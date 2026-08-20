import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Pencil, Trash2, X } from "lucide-react";

import { AppShell, PageHeader } from "@/components/worksmart/app-shell";
import { ResponsibleAiNotice } from "@/components/worksmart/responsible-ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  removeOutput,
  saveOutput,
  toggleOutputDone,
  useSavedOutputs,
  type SavedOutput,
} from "@/lib/saved-outputs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "My Tasks — CAPACITI Worksmart AI" },
      {
        name: "description",
        content:
          "Everything you saved from Worksmart — summaries, email drafts, action items and weekly plans — editable in one place.",
      },
      { property: "og:title", content: "My Tasks — CAPACITI Worksmart AI" },
      {
        property: "og:description",
        content: "Your saved Worksmart summaries, drafts, action items and plans.",
      },
    ],
  }),
  component: TasksPage,
});

function SavedCard({ item }: { item: SavedOutput }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(item.content);
  const [copied, setCopied] = useState(false);

  return (
    <article className="panel p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={cn("text-base font-semibold", item.done && "line-through opacity-60")}>
            {item.title}
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Saved {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => toggleOutputDone(item.id)}>
            <Check className="size-3.5" /> {item.done ? "Reopen" : "Done"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              setDraft(item.content);
              setEditing((value) => !value);
            }}
          >
            {editing ? <X className="size-3.5" /> : <Pencil className="size-3.5" />}
            {editing ? "Cancel" : "Edit"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(item.content);
              setCopied(true);
              setTimeout(() => setCopied(false), 1600);
            }}
          >
            <Copy className="size-3.5" /> {copied ? "Copied" : "Copy"}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            aria-label={`Delete ${item.title}`}
            onClick={() => removeOutput(item.id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            rows={12}
            aria-label={`Edit ${item.title}`}
            className="min-h-[200px] bg-surface text-sm"
          />
          <Button
            size="sm"
            onClick={() => {
              removeOutput(item.id);
              saveOutput(item.title, draft);
              setEditing(false);
            }}
          >
            <Check className="size-3.5" /> Save
          </Button>
        </div>
      ) : (
        <pre className="mt-4 max-h-72 overflow-auto rounded-xl bg-surface-raised p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
          {item.content}
        </pre>
      )}
    </article>
  );
}

function TasksPage() {
  const items = useSavedOutputs();

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6 px-5 py-10 sm:px-8">
        <PageHeader
          badge="My tasks"
          title="Your saved work"
          description="Summaries, email drafts, action items and weekly plans you saved from Worksmart. Everything stays editable."
        />
        <ResponsibleAiNotice />
        {items.length === 0 ? (
          <p className="panel px-5 py-10 text-center text-sm text-muted-foreground">
            Nothing saved yet. Generate something in the email generator, summarizer or task planner,
            then press Save.
          </p>
        ) : (
          <div className="grid gap-5">
            {items.map((item) => (
              <SavedCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

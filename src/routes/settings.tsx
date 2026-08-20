import { createFileRoute } from "@tanstack/react-router";

import { AppShell, PageHeader } from "@/components/worksmart/app-shell";
import { ResponsibleAiNotice } from "@/components/worksmart/responsible-ai";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — CAPACITI Worksmart AI" },
      {
        name: "description",
        content:
          "Workspace preferences and responsible AI guidance for CAPACITI Worksmart AI, your workplace productivity assistant.",
      },
      { property: "og:title", content: "Settings — CAPACITI Worksmart AI" },
      {
        property: "og:description",
        content: "Workspace preferences and responsible AI guidance for Worksmart AI.",
      },
    ],
  }),
  component: SettingsPage,
});

const details = [
  { label: "Assistant", value: "CAPACITI Worksmart AI" },
  { label: "Output style", value: "Structured markdown with headings and bullets" },
  { label: "Editing", value: "Every AI output is editable before copying or saving" },
  { label: "Saved outputs", value: "Stored on this device under My Tasks" },
];

function SettingsPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6 px-5 py-10 sm:px-8">
        <PageHeader
          badge="Settings"
          title="Workspace settings"
          description="How Worksmart behaves across the email generator, meeting summarizer and task planner."
        />
        <ResponsibleAiNotice />
        <section className="panel divide-y divide-border">
          {details.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-sm text-muted-foreground">{item.value}</span>
            </div>
          ))}
        </section>
      </div>
    </AppShell>
  );
}

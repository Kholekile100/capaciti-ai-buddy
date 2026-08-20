import { createFileRoute } from "@tanstack/react-router";

import { AppShell, PageHeader } from "@/components/worksmart/app-shell";
import { Assistant } from "@/components/worksmart/assistant";
import { ResponsibleAiNotice } from "@/components/worksmart/responsible-ai";

export const Route = createFileRoute("/summarizer")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — CAPACITI Worksmart AI" },
      {
        name: "description",
        content:
          "Turn transcripts and messy meeting notes into decisions, risks and next steps you can edit and share.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — CAPACITI Worksmart AI" },
      {
        property: "og:description",
        content: "Summarise meetings into decisions, risks and next steps in seconds.",
      },
    ],
  }),
  component: SummarizerPage,
});

function SummarizerPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6 px-5 py-10 sm:px-8">
        <PageHeader
          badge="Meeting summarizer"
          title="From transcript to takeaways"
          description="Paste notes or a transcript and get a clean executive summary with decisions, risks and next steps — editable before you circulate it."
        />
        <ResponsibleAiNotice />
        <Assistant lockedModeId="summarise" saveLabel="Meeting summary" />
      </div>
    </AppShell>
  );
}

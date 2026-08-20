import { createFileRoute } from "@tanstack/react-router";

import { AppShell, PageHeader } from "@/components/worksmart/app-shell";
import { Assistant } from "@/components/worksmart/assistant";
import { ResponsibleAiNotice } from "@/components/worksmart/responsible-ai";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — CAPACITI Worksmart AI" },
      {
        name: "description",
        content:
          "Draft professional workplace emails in seconds, then edit, copy or save the result before you send it.",
      },
      { property: "og:title", content: "Smart Email Generator — CAPACITI Worksmart AI" },
      {
        property: "og:description",
        content: "Generate and edit professional workplace emails with CAPACITI Worksmart AI.",
      },
    ],
  }),
  component: EmailPage,
});

function EmailPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6 px-5 py-10 sm:px-8">
        <PageHeader
          badge="Smart email generator"
          title="Draft the email, keep the voice"
          description="Describe the situation and tone. Worksmart writes the draft — you stay in control with full editing before copying or saving."
        />
        <ResponsibleAiNotice />
        <Assistant lockedModeId="email" saveLabel="Email draft" />
      </div>
    </AppShell>
  );
}

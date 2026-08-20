import { createFileRoute } from "@tanstack/react-router";

import { AppShell, PageHeader } from "@/components/worksmart/app-shell";
import { Assistant } from "@/components/worksmart/assistant";
import { ResponsibleAiNotice } from "@/components/worksmart/responsible-ai";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — CAPACITI Worksmart AI" },
      {
        name: "description",
        content:
          "Build realistic weekly plans and action items with owners and due dates, fully editable before you save them.",
      },
      { property: "og:title", content: "AI Task Planner — CAPACITI Worksmart AI" },
      {
        property: "og:description",
        content: "Plan your week and extract action items with CAPACITI Worksmart AI.",
      },
    ],
  }),
  component: PlannerPage,
});

function PlannerPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-5xl space-y-6 px-5 py-10 sm:px-8">
        <PageHeader
          badge="AI task planner"
          title="Action items and weekly plans"
          description="Extract owned action items or build a day-by-day plan around your deadlines and meetings. Edit anything, then save it to My Tasks."
        />
        <ResponsibleAiNotice />
        <div className="grid gap-6">
          <Assistant lockedModeId="tasks" saveLabel="Action items" />
          <Assistant lockedModeId="plan" saveLabel="Weekly plan" />
        </div>
      </div>
    </AppShell>
  );
}

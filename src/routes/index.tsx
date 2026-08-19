import { createFileRoute } from "@tanstack/react-router";
import { Clock, Gauge, ShieldCheck, Sparkles, Workflow } from "lucide-react";

import heroGlow from "@/assets/hero-glow.jpg";
import { Assistant } from "@/components/worksmart/assistant";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CAPACITI Worksmart AI — Workplace Productivity Assistant" },
      {
        name: "description",
        content:
          "Summarise meetings, draft emails, extract action items and plan your week with CAPACITI Worksmart AI, your AI workplace productivity assistant.",
      },
      { property: "og:title", content: "CAPACITI Worksmart AI" },
      {
        property: "og:description",
        content: "Turn messy notes into summaries, emails, action items and plans in seconds.",
      },
    ],
  }),
  component: Index,
});

const capabilities = [
  {
    icon: Clock,
    title: "Hours back each week",
    body: "Meeting recaps, status updates and follow-up emails written the moment the call ends.",
  },
  {
    icon: Workflow,
    title: "Notes to next steps",
    body: "Every conversation becomes owned action items with due dates and clear priority.",
  },
  {
    icon: Gauge,
    title: "Focused planning",
    body: "Realistic day and week plans built around your deadlines, meetings and deep-work blocks.",
  },
  {
    icon: ShieldCheck,
    title: "Grounded output",
    body: "Worksmart works from what you give it and flags assumptions instead of inventing detail.",
  },
];

function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <img
        src={heroGlow}
        alt=""
        aria-hidden="true"
        width={1600}
        height={1000}
        className="pointer-events-none absolute -top-40 left-1/2 w-[140%] max-w-none -translate-x-1/2 opacity-45"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,transparent,var(--background)_70%)]" />

      <div className="relative mx-auto max-w-6xl px-6 pt-10 pb-24">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-gradient-brand glow-ring">
              <Sparkles className="size-5 text-primary-foreground" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              CAPACITI <span className="text-gradient-brand">Worksmart AI</span>
            </span>
          </div>
          <span className="hidden rounded-full border border-border px-3 py-1.5 text-xs tracking-widest text-muted-foreground uppercase sm:inline-flex">
            Productivity assistant
          </span>
        </header>

        <section className="mx-auto mt-20 max-w-3xl text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium tracking-widest text-primary uppercase">
            Work smarter, not longer
          </p>
          <h1 className="mt-6 text-4xl leading-[1.05] font-bold sm:text-6xl">
            The AI teammate that clears
            <br />
            <span className="text-gradient-brand">your workday backlog</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
            Drop in your notes, threads or half-formed ideas. Worksmart returns summaries, emails,
            action items and plans your team can act on immediately.
          </p>
        </section>

        <section className="mt-14" aria-label="Worksmart assistant">
          <Assistant />
        </section>

        <section className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {capabilities.map((item) => (
            <article key={item.title} className="panel p-6">
              <item.icon className="size-5 text-primary" aria-hidden="true" />
              <h2 className="mt-4 text-base font-semibold">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </section>

        <footer className="mt-20 border-t border-border pt-8 text-sm text-muted-foreground">
          CAPACITI Worksmart AI — built for teams who would rather do the work than write about it.
        </footer>
      </div>
    </main>
  );
}

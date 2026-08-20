import { ShieldAlert } from "lucide-react";

import { cn } from "@/lib/utils";

export const RESPONSIBLE_AI_TEXT =
  "AI-generated content may contain errors or assumptions. Always review AI outputs before using them for important workplace decisions, communication, or task planning.";

export function ResponsibleAiNotice({ className }: { className?: string }) {
  return (
    <aside
      className={cn(
        "flex items-start gap-3 rounded-xl border border-signal/30 bg-signal/10 px-4 py-3",
        className,
      )}
      aria-label="Responsible AI notice"
    >
      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-signal" aria-hidden="true" />
      <p className="text-xs leading-relaxed text-foreground/80 sm:text-sm">
        <span className="font-semibold text-foreground">Responsible AI:</span> {RESPONSIBLE_AI_TEXT}
      </p>
    </aside>
  );
}

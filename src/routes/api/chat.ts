import { createFileRoute } from "@tanstack/react-router";
import { streamText } from "ai";
import { z } from "zod";

import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const BodySchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      }),
    )
    .min(1),
  mode: z.string().optional(),
});

const SYSTEM_PROMPT = `You are CAPACITI Worksmart AI, a workplace productivity assistant for teams.
You help with: summarising meetings and long documents, drafting professional emails and messages,
turning notes into clear action items with owners and due dates, planning priorities for the day or week,
and preparing agendas and status updates.

Style rules:
- Be concise, practical and structured. Prefer short sections, bullets and checkboxes.
- Use markdown headings, bullet lists and bold labels.
- When information is missing, make a sensible assumption and flag it in one short line at the end.
- Never invent names, dates or metrics that were not provided.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return new Response("AI is not configured for this workspace.", { status: 500 });
        }

        let parsed;
        try {
          parsed = BodySchema.parse(await request.json());
        } catch {
          return new Response("Invalid request.", { status: 400 });
        }

        const gateway = createLovableAiGatewayProvider(apiKey);

        try {
          const result = streamText({
            model: gateway("google/gemini-3.7-flash"),
            system: parsed.mode
              ? `${SYSTEM_PROMPT}\n\nCurrent task focus: ${parsed.mode}.`
              : SYSTEM_PROMPT,
            messages: parsed.messages,
          });

          return result.toTextStreamResponse();
        } catch (error) {
          const status =
            typeof error === "object" && error && "statusCode" in error
              ? Number((error as { statusCode?: number }).statusCode) || 500
              : 500;
          const message =
            status === 402
              ? "AI credits are exhausted for this workspace. Please top up to continue."
              : status === 429
                ? "Too many requests right now — try again in a moment."
                : "The assistant could not respond. Please try again.";
          return new Response(message, { status });
        }
      },
    },
  },
});
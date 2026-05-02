import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const payloadSchema = z.object({
  email: z.string().trim().email().max(255),
  story: z.string().min(1).max(50000),
  prompt: z.string().max(2000),
  denomination: z.string().max(100),
  length: z.string().max(20),
  subscribe: z.boolean().optional().default(false),
});

export const sendStoryEmail = createServerFn({ method: "POST" })
  .inputValidator((input) => payloadSchema.parse(input))
  .handler(async ({ data }) => {
    // Stub: log the payload. Wire to a real email service later.
    console.log("[sendStoryEmail] Queued story email", {
      email: data.email,
      denomination: data.denomination,
      length: data.length,
      subscribe: data.subscribe,
      promptPreview: data.prompt.slice(0, 80),
      storyChars: data.story.length,
    });
    // Simulate latency
    await new Promise((r) => setTimeout(r, 600));
    return { success: true as const };
  });

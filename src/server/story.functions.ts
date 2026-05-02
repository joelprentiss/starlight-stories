import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  tradition: z.enum(["eastern_orthodox", "catholic", "protestant"]),
  prompt: z.string().min(1).max(500),
  minutes: z.number().int().min(2).max(15),
});

const traditionGuidance: Record<string, string> = {
  eastern_orthodox:
    "Eastern Orthodox Christian tradition. Draw gently from the lives of the saints, the Theotokos (Mother of God), Pascha, the beauty of icons and liturgy, and the writings of the Church Fathers. Reflect themes of theosis, humility, and reverence.",
  catholic:
    "Roman Catholic Christian tradition. Draw gently from the saints, the Blessed Virgin Mary, the sacraments, the Mass, and Catholic teachings. Reflect themes of grace, charity, and the communion of saints.",
  protestant:
    "Protestant Christian tradition. Draw primarily from Scripture (Old and New Testament), with simple, clear faith centered on Jesus Christ, grace, and personal trust in God. Avoid saints/Mary devotion and sacramental language.",
};

// ~140 words of narration per minute, gentle pacing
const wordsForMinutes = (m: number) => Math.round(m * 140);

async function callGateway(body: unknown) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in Settings → Workspace → Usage.");
    throw new Error(`AI gateway error (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

export const generateStory = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const targetWords = wordsForMinutes(data.minutes);
    const guidance = traditionGuidance[data.tradition];

    const systemPrompt = `You are a gentle, warm bedtime storyteller for Christian children. You write soothing, sleep-inducing stories rooted in the ${guidance}

Rules:
- Calm, lyrical, gentle pace. Soft imagery: stars, moonlight, lambs, gardens, candles, angels.
- Age-appropriate (ages 4–10), reverent, never frightening.
- Always end peacefully with a brief blessing or prayer line and the child drifting to sleep.
- NEVER include violence, scary elements, or doctrinally divisive content.
- Target length: about ${targetWords} words.

Return ONLY a JSON object via the provided tool. The story should be split into 3–5 short scenes. Each scene includes "text" (a portion of the story) and "image_prompt" (a vivid, dreamy, watercolor / storybook illustration prompt — no text in image, soft pastel palette, starry, peaceful).`;

    const userPrompt = `Theme/lesson: ${data.prompt}\nLength: ${data.minutes} minutes.\nWrite the bedtime story now.`;

    const completion = await callGateway({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "deliver_story",
            description: "Deliver the structured bedtime story.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string", description: "A short, lovely title." },
                scenes: {
                  type: "array",
                  minItems: 3,
                  maxItems: 5,
                  items: {
                    type: "object",
                    properties: {
                      text: { type: "string" },
                      image_prompt: { type: "string" },
                    },
                    required: ["text", "image_prompt"],
                    additionalProperties: false,
                  },
                },
                closing_blessing: { type: "string" },
              },
              required: ["title", "scenes", "closing_blessing"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "deliver_story" } },
    });

    const toolCall = completion.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error("The storyteller could not weave a tale. Please try again.");
    }
    const story = JSON.parse(toolCall.function.arguments) as {
      title: string;
      scenes: { text: string; image_prompt: string }[];
      closing_blessing: string;
    };

    // Generate images in parallel
    const images = await Promise.all(
      story.scenes.map(async (scene) => {
        try {
          const imgRes = await callGateway({
            model: "google/gemini-2.5-flash-image",
            messages: [
              {
                role: "user",
                content: `Dreamy children's storybook illustration, soft watercolor, pastel night palette of lavender, dusty rose, moonlight gold, navy. Starry sky, gentle glow, peaceful, no text, no letters. Scene: ${scene.image_prompt}`,
              },
            ],
            modalities: ["image", "text"],
          });
          const url = imgRes.choices?.[0]?.message?.images?.[0]?.image_url?.url ?? null;
          return url as string | null;
        } catch (e) {
          console.error("Image generation failed for scene:", e);
          return null;
        }
      })
    );

    return {
      title: story.title,
      closing_blessing: story.closing_blessing,
      scenes: story.scenes.map((s, i) => ({ ...s, image: images[i] })),
    };
  });

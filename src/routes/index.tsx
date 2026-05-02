import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Moon } from "lucide-react";
import { StoryForm, type Tradition } from "@/components/StoryForm";
import { StoryView, type Story } from "@/components/StoryView";
import { generateStory } from "@/server/story.functions";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Starlit Stories — Christian Bedtime Stories for Children" },
      {
        name: "description",
        content:
          "Generate gentle, dreamy Christian bedtime stories with beautiful illustrations. Choose your faith tradition, theme, and length.",
      },
    ],
  }),
});

function Index() {
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<Story | null>(null);

  const handleSubmit = async (input: {
    tradition: Tradition;
    prompt: string;
    minutes: number;
  }) => {
    setLoading(true);
    try {
      const result = await generateStory({ data: input });
      setStory(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went quiet in the stars. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Star fields */}
      <div className="stars absolute inset-0" />
      <div
        className="stars absolute inset-0 opacity-60"
        style={{ backgroundSize: "900px 900px", animationDelay: "2s" }}
      />

      {/* Soft glow orbs */}
      <div
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-40 blur-3xl float"
        style={{ background: "radial-gradient(circle, oklch(0.72 0.14 330 / 0.6), transparent 70%)" }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full opacity-40 blur-3xl float"
        style={{ background: "radial-gradient(circle, oklch(0.82 0.12 85 / 0.45), transparent 70%)", animationDelay: "3s" }}
      />

      <main className="relative z-10 mx-auto max-w-4xl px-6 py-10 md:py-16">
        <header className="flex items-center justify-center gap-3 mb-12">
          <Moon className="h-7 w-7 text-primary float" />
          <span className="font-display text-2xl tracking-wide text-foreground/90">Starlit Stories</span>
        </header>

        {!story && (
          <div className="space-y-10">
            <div className="text-center space-y-5">
              <h1 className="text-5xl md:text-7xl font-display leading-[1.05] text-gradient-dream">
                Bedtime, blessed by starlight
              </h1>
              <p className="text-lg md:text-xl text-foreground/75 max-w-2xl mx-auto leading-relaxed">
                Gentle Christian bedtime stories, woven just for tonight — with dreamy illustrations to carry little ones into sleep.
              </p>
            </div>
            <StoryForm loading={loading} onSubmit={handleSubmit} />
          </div>
        )}

        {story && <StoryView story={story} onReset={() => setStory(null)} />}
      </main>

      <Toaster position="top-center" />
    </div>
  );
}

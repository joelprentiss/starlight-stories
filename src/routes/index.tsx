import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Moon } from "lucide-react";
import { StoryForm, type Tradition } from "@/components/StoryForm";
import { StoryView, type Story } from "@/components/StoryView";
import { EmailStoryModal } from "@/components/EmailStoryModal";
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

const MODAL_STORAGE_KEY = "starlit_email_modal_seen";

function Index() {
  const [loading, setLoading] = useState(false);
  const [story, setStory] = useState<Story | null>(null);
  const [lastInput, setLastInput] = useState<{
    tradition: Tradition;
    prompt: string;
    minutes: number;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const storyRef = useRef<HTMLDivElement>(null);
  const triggeredRef = useRef(false);

  const handleSubmit = async (input: {
    tradition: Tradition;
    prompt: string;
    minutes: number;
  }) => {
    setLoading(true);
    try {
      const result = await generateStory({ data: input });
      setStory(result);
      setLastInput(input);
      triggeredRef.current = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went quiet in the stars. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Scroll detection: trigger modal at ~90% of story container
  useEffect(() => {
    if (!story) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(MODAL_STORAGE_KEY)) return;

    let timeoutId: number | null = null;

    const onScroll = () => {
      if (triggeredRef.current) return;
      const el = storyRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const totalHeight = el.offsetHeight;
      const viewportH = window.innerHeight;
      // Distance scrolled past the top of the story element
      const scrolled = Math.max(0, viewportH - rect.top);
      const progress = scrolled / Math.max(totalHeight, 1);
      if (progress >= 0.9) {
        triggeredRef.current = true;
        window.removeEventListener("scroll", onScroll);
        timeoutId = window.setTimeout(() => {
          if (!sessionStorage.getItem(MODAL_STORAGE_KEY)) {
            setModalOpen(true);
          }
        }, 1500);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [story]);

  const handleModalClose = () => {
    setModalOpen(false);
    try {
      sessionStorage.setItem(MODAL_STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  const handleSubmitted = () => {
    try {
      // Persist across sessions once submitted
      localStorage.setItem(MODAL_STORAGE_KEY, "1");
      sessionStorage.setItem(MODAL_STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  // Compose plain-text story for email payload
  const storyText = story
    ? [
        story.title,
        "",
        ...story.scenes.map((s) => s.text),
        "",
        story.closing_blessing,
      ].join("\n\n")
    : "";

  const traditionLabel = (t: Tradition) =>
    t === "eastern_orthodox" ? "Eastern Orthodox" : t === "catholic" ? "Catholic" : "Protestant";

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

        {story && (
          <div ref={storyRef}>
            <StoryView story={story} onReset={() => setStory(null)} />
          </div>
        )}
      </main>

      {story && lastInput && (
        <EmailStoryModal
          open={modalOpen}
          onClose={handleModalClose}
          onSubmitted={handleSubmitted}
          payload={{
            story: storyText,
            prompt: lastInput.prompt,
            denomination: traditionLabel(lastInput.tradition),
            length: `${lastInput.minutes} minutes`,
          }}
        />
      )}

      <Toaster position="top-center" />
    </div>
  );
}

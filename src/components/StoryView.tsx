import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";

export type Scene = { text: string; image_prompt: string; image: string | null };
export type Story = { title: string; scenes: Scene[]; closing_blessing: string };

export function StoryView({ story, onReset }: { story: Story; onReset: () => void }) {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onReset}
          className="text-foreground/80 hover:text-foreground hover:bg-input/40 rounded-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> New story
        </Button>
        <div className="flex items-center gap-2 text-primary/80">
          <Star className="h-4 w-4 fill-current" />
          <Star className="h-3 w-3 fill-current" />
          <Star className="h-4 w-4 fill-current" />
        </div>
      </div>

      <header className="text-center space-y-4">
        <h1 className="text-5xl md:text-6xl font-display text-gradient-dream">{story.title}</h1>
        <div className="mx-auto h-px w-32 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      </header>

      <div className="space-y-16">
        {story.scenes.map((scene, i) => (
          <article key={i} className="glass rounded-3xl overflow-hidden">
            <div className="aspect-[16/9] bg-input/40 relative overflow-hidden">
              {scene.image ? (
                <img
                  src={scene.image}
                  alt={scene.image_prompt}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <Star className="h-10 w-10 animate-pulse" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent pointer-events-none" />
            </div>
            <div className="p-8 md:p-12">
              <p className="text-xl md:text-2xl leading-relaxed text-foreground/90 font-body whitespace-pre-line">
                {scene.text}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="glass rounded-3xl p-10 md:p-14 text-center space-y-4">
        <div className="text-sm uppercase tracking-[0.3em] text-primary/80 font-body">Goodnight blessing</div>
        <p className="text-2xl md:text-3xl font-display text-gradient-dream leading-relaxed italic">
          {story.closing_blessing}
        </p>
      </div>

      <div className="text-center pb-12">
        <Button
          onClick={onReset}
          size="lg"
          className="h-14 px-10 text-lg rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-display glow"
        >
          Tell another story
        </Button>
      </div>
    </div>
  );
}

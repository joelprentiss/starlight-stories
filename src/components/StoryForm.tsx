import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, Moon } from "lucide-react";

export type Tradition = "eastern_orthodox" | "catholic" | "protestant";

type Props = {
  loading: boolean;
  onSubmit: (input: { tradition: Tradition; prompt: string; minutes: number }) => void;
};

const traditions: { value: Tradition; label: string; hint: string }[] = [
  { value: "eastern_orthodox", label: "Eastern Orthodox", hint: "Saints, icons, Theotokos" },
  { value: "catholic", label: "Catholic", hint: "Saints, Mary, sacraments" },
  { value: "protestant", label: "Protestant", hint: "Scripture-centered" },
];

const lengths = [2, 3, 5, 7, 10, 15];

export function StoryForm({ loading, onSubmit }: Props) {
  const [tradition, setTradition] = useState<Tradition | "">("");
  const [prompt, setPrompt] = useState("");
  const [minutes, setMinutes] = useState<number>(5);

  const canSubmit = tradition && prompt.trim().length > 0 && !loading;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) return;
        onSubmit({ tradition: tradition as Tradition, prompt: prompt.trim(), minutes });
      }}
      className="glass rounded-3xl p-8 md:p-12 space-y-8"
    >
      <div className="space-y-3">
        <Label className="text-lg font-display text-foreground/90">Choose a faith tradition</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {traditions.map((t) => {
            const active = tradition === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTradition(t.value)}
                className={`text-left rounded-2xl px-5 py-4 border transition-all duration-300 ${
                  active
                    ? "border-primary/70 bg-primary/15 glow"
                    : "border-border bg-input/40 hover:border-primary/40 hover:bg-input/60"
                }`}
              >
                <div className="font-display text-xl text-foreground">{t.label}</div>
                <div className="text-sm text-muted-foreground mt-1">{t.hint}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="prompt" className="text-lg font-display text-foreground/90">
          What lesson or theme tonight?
        </Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. trusting God in the dark, kindness to a sibling, the peace of forgiveness…"
          className="min-h-32 text-lg bg-input/40 border-border rounded-2xl resize-none focus-visible:ring-primary/60"
          maxLength={500}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-6 items-end">
        <div className="space-y-3">
          <Label className="text-lg font-display text-foreground/90">Story length</Label>
          <Select value={String(minutes)} onValueChange={(v) => setMinutes(Number(v))}>
            <SelectTrigger className="h-14 text-lg bg-input/40 border-border rounded-2xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {lengths.map((m) => (
                <SelectItem key={m} value={String(m)} className="text-lg">
                  {m} {m === 1 ? "minute" : "minutes"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="submit"
          disabled={!canSubmit}
          size="lg"
          className="h-14 px-10 text-lg rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 glow font-display"
        >
          {loading ? (
            <>
              <Moon className="mr-2 h-5 w-5 animate-pulse" />
              Weaving your story…
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-5 w-5" />
              Tell me a story
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

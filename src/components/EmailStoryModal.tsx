import { useEffect, useRef, useState } from "react";
import { Mail, X, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { sendStoryEmail } from "@/server/email.functions";

type Props = {
  open: boolean;
  onClose: () => void;
  payload: {
    story: string;
    prompt: string;
    denomination: string;
    length: string;
  };
  onSubmitted: () => void;
};

export function EmailStoryModal({ open, onClose, payload, onSubmitted }: Props) {
  const [email, setEmail] = useState("");
  const [subscribe, setSubscribe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && !success) {
      // Autofocus on open
      const t = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(t);
    }
  }, [open, success]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    const trimmed = email.trim();
    if (!validateEmail(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await sendStoryEmail({
        data: {
          email: trimmed,
          story: payload.story,
          prompt: payload.prompt,
          denomination: payload.denomination,
          length: payload.length,
          subscribe,
        },
      });
      setSuccess(true);
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6 animate-in fade-in duration-500"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" />

      {/* Modal */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md glass rounded-3xl p-6 sm:p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 h-9 w-9 grid place-content-center rounded-full text-foreground/60 hover:text-foreground hover:bg-input/40 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {success ? (
          <div className="text-center py-6 space-y-4 animate-in fade-in duration-500">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/15 grid place-content-center glow">
              <Check className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-display text-gradient-dream">Check your inbox ✉️</h2>
            <p className="text-base text-foreground/75 leading-relaxed">
              Your story is on its way.
            </p>
            <Button
              onClick={onClose}
              className="mt-4 h-12 px-8 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 font-display"
            >
              Goodnight
            </Button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-11 w-11 rounded-2xl bg-primary/15 grid place-content-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 id="email-modal-title" className="text-xl sm:text-2xl font-display text-foreground leading-tight">
                  Send this story to your email
                </h2>
              </div>
            </div>

            <p className="text-base text-foreground/80 leading-relaxed mb-2">
              Save it for tomorrow night or read it again anytime.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              We can also send you a new bedtime story each night.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  ref={inputRef}
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                  className="h-14 text-base bg-input/40 border-border rounded-2xl px-4 focus-visible:ring-primary/60"
                  disabled={loading}
                />
                {error && (
                  <p className="text-sm text-destructive px-1">{error}</p>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none rounded-2xl px-3 py-2 -mx-1 hover:bg-input/30 transition-colors">
                <Checkbox
                  checked={subscribe}
                  onCheckedChange={(v) => setSubscribe(v === true)}
                  disabled={loading}
                  className="mt-0.5"
                />
                <span className="text-sm text-foreground/80 leading-relaxed">
                  Send me a new bedtime story each night
                </span>
              </label>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-base rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 font-display glow"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sending…
                  </>
                ) : (
                  "Send My Story"
                )}
              </Button>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="block mx-auto text-sm text-muted-foreground hover:text-foreground/80 transition-colors py-1"
              >
                Maybe later
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

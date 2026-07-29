import { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";

interface Props {
  onSubmit: (summary: string, flatNumber?: string) => Promise<void> | void;
}

export function IssueDeskScreen({ onSubmit }: Props) {
  const [description, setDescription] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim()) return;
    setIsSubmitting(true);
    try {
      await onSubmit(description.trim(), flatNumber.trim() || undefined);
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setDescription("");
    setFlatNumber("");
    setSubmitted(false);
  }

  if (submitted) {
    return (
      <div className="max-w-6xl mx-auto px-6 lg:px-10 py-20 lg:py-32 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-green-50 border border-green-200 mb-6">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
          </div>
          <h1
            className="text-foreground mb-4 leading-tight"
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)" }}
          >
            Issue received.
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed mb-8 max-w-sm">
            The committee has been notified and will review your report shortly. You'll hear back within 24 hours.
          </p>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 text-sm text-accent hover:text-accent/80 transition-colors font-medium"
          >
            Report another issue
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="hidden lg:block">
          <div className="bg-card border border-border rounded-lg p-6 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">What happens next?</p>
            <ol className="mt-4 flex flex-col gap-4">
              {[
                "Your issue is logged and assigned a reference number.",
                "The committee reviews and categorises it.",
                "A response or resolution is communicated within 24–48 hours.",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary text-foreground text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 lg:px-10 py-14 lg:py-20 grid lg:grid-cols-[1fr_1.1fr] gap-16 items-start">

      {/* Left: copy */}
      <div className="lg:pt-2">
        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4 font-medium">
          Issue Desk
        </p>
        <h1
          className="text-foreground leading-tight mb-5"
          style={{ fontFamily: "'DM Serif Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)" }}
        >
          Report an Issue
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed max-w-sm mb-10">
          Use this form to let the building committee know about any maintenance, safety, or communal area concerns.
        </p>

        <div className="border-t border-border pt-8 flex flex-col gap-5">
          {[
            { label: "Response time", value: "Within 24 hours" },
            { label: "Coverage", value: "All common areas & shared systems" },
            { label: "Escalation", value: "High-urgency issues flagged immediately" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
              <p className="text-sm text-foreground font-medium">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form */}
      <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Describe the issue
            </label>
            <textarea
              id="description"
              rows={6}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. lift not working again, 3rd time this month"
              className="w-full rounded-md border border-border bg-input-background px-4 py-3 text-sm text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="flat" className="text-sm font-medium text-foreground">
              Flat number
              <span className="text-muted-foreground font-normal ml-1.5">(optional)</span>
            </label>
            <input
              id="flat"
              type="text"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value)}
              placeholder="e.g. 4B"
              className="w-full rounded-md border border-border bg-input-background px-4 py-3 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition"
            />
          </div>

          <button
            type="submit"
            disabled={!description.trim()}
            className="mt-1 w-full rounded-md bg-primary text-primary-foreground py-3 text-sm font-medium hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-40 inline-flex items-center justify-center gap-2"
          >
            Submit issue
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Your report is shared only with the building committee.
          </p>
        </form>
      </div>

    </div>
  );
}

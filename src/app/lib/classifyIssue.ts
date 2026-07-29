import type { Category, Urgency } from "../types";

const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  Lift: ["lift", "elevator", "elevators"],
  Plumbing: ["leak", "leakage", "water", "pipe", "drain", "tap", "plumbing", "seepage"],
  Electrical: ["light", "lights", "flicker", "electric", "electrical", "wiring", "power", "mcb", "short circuit"],
  Security: ["guard", "security", "gate", "cctv", "camera", "watchman", "intruder", "trespass"],
  Other: [],
};

const HIGH_URGENCY_KEYWORDS = [
  "safety", "danger", "dangerous", "risk", "urgent", "emergency",
  "stuck", "fire", "injury", "injured", "fall", "fell", "electrocut",
  "not closing", "not closing properly", "sparking", "smoke", "gas leak",
];

const LOW_URGENCY_KEYWORDS = [
  "flicker", "flickering", "minor", "cosmetic", "small", "slight", "occasionally",
];

export function classifyIssue(text: string): { category: Category; urgency: Urgency } {
  const lower = text.toLowerCase();

  let category: Category = "Other";
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS) as [Category, string[]][]) {
    if (keywords.some((kw) => lower.includes(kw))) {
      category = cat;
      break;
    }
  }

  let urgency: Urgency = "Medium";
  if (HIGH_URGENCY_KEYWORDS.some((kw) => lower.includes(kw))) {
    urgency = "High";
  } else if (LOW_URGENCY_KEYWORDS.some((kw) => lower.includes(kw))) {
    urgency = "Low";
  }

  return { category, urgency };
}

export function findLikelyDuplicate<T extends { summary: string; category: Category; status: string }>(
  newSummary: string,
  newCategory: Category,
  existingIssues: T[]
): T | undefined {
  const newWords = new Set(
    newSummary.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  );

  return existingIssues.find((issue) => {
    if (issue.status === "Resolved" || issue.category !== newCategory) return false;
    const existingWords = new Set(
      issue.summary.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
    );
    const overlap = [...newWords].filter((w) => existingWords.has(w)).length;
    return overlap >= 2;
  });
}

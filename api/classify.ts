export const config = { runtime: "edge" };

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "Missing API key on server" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const body = await request.json();
  const summary = body.summary;
  const existingIssues = body.existingIssues || [];

  const existingList = existingIssues
    .map(function (i: any) {
      return "id " + i.id + " [" + i.category + "]: \"" + i.summary + "\"";
    })
    .join("\n");

  const prompt =
    "You are triaging maintenance complaints for a residential society, submitted casually the way people post in a WhatsApp group.\n\n" +
    "New submission: \"" + summary + "\"\n\n" +
    "Existing OPEN issues (id, category, summary):\n" +
    (existingList || "(none)") + "\n\n" +
    "Do the following:\n" +
    "1. category: one of \"Lift\", \"Plumbing\", \"Electrical\", \"Security\", \"Other\"\n" +
    "2. cleanSummary: a clean one-line restatement of the new submission\n" +
    "3. urgency: \"High\" (genuine safety/blocking risk, even if the tone is casual or sarcastic), \"Medium\" (functional problem, not urgent), or \"Low\" (cosmetic/minor)\n" +
    "4. isSpam: true if this is not a genuine maintenance/safety/communal-area complaint (e.g. unrelated chatter, selling items), otherwise false\n" +
    "5. duplicateOfId: if this submission describes the SAME underlying problem as one of the existing open issues above (even if worded completely differently, e.g. \"lift stopped\" vs \"elevator stuck\"), return that issue's id as a number. Otherwise return null. Be careful not to merge genuinely different problems in the same category (e.g. a stuck lift vs a noisy lift are different issues).\n\n" +
    "Respond with ONLY valid JSON, no markdown formatting, no code fences, nothing else:\n" +
    "{\"category\": \"\", \"cleanSummary\": \"\", \"urgency\": \"\", \"isSpam\": false, \"duplicateOfId\": null}";

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await anthropicRes.json();
    const rawText = data && data.content && data.content[0] && data.content[0].text ? data.content[0].text : "{}";

    const fence = String.fromCharCode(96, 96, 96);
    let cleaned = rawText.trim();
    if (cleaned.indexOf(fence) === 0) {
      const firstNewline = cleaned.indexOf("\n");
      cleaned = firstNewline !== -1 ? cleaned.slice(firstNewline + 1) : cleaned.slice(fence.length);
    }
    const lastFenceIndex = cleaned.lastIndexOf(fence);
    if (lastFenceIndex !== -1) {
      cleaned = cleaned.slice(0, lastFenceIndex);
    }
    cleaned = cleaned.trim();

    const parsed = JSON.parse(cleaned);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Classification failed", details: String(err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

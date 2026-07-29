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

  const { summary, existingIssues } = await request.json();

  const existingList = (existingIssues || [])
    .map((i: any) => id ${i.id} [${i.category}]: "${i.summary}")
    .join("\n");

  const prompt = `You are triaging maintenance complaints for a residential society, submitted casually the way people post in a WhatsApp group.

New submission: "${summary}"

Existing OPEN issues (id, category, summary):
${existingList || "(none)"}

Do the following:
1. category: one of "Lift", "Plumbing", "Electrical", "Security", "Other"
2. cleanSummary: a clean one-line restatement of the new submission
3. urgency: "High" (genuine safety/blocking risk, even if the tone is casual or sarcastic), "Medium" (functional problem, not urgent), or "Low" (cosmetic/minor)
4. isSpam: true if this is not a genuine maintenance/safety/communal-area complaint (e.g. unrelated chatter, selling items), otherwise false
5. duplicateOfId: if this submission describes the SAME underlying problem as one of the existing open issues above (even if worded completely differently, e.g. "lift stopped" vs "elevator stuck"), return that issue's id as a number. Otherwise return null. Be careful not to merge genuinely different problems in the same category (e.g. a stuck lift vs a noisy lift are different issues).

Respond with ONLY valid JSON, no markdown formatting, no code fences, nothing else:
{"category": "", "cleanSummary": "", "urgency": "", "isSpam": false, "duplicateOfId": null}`;

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await anthropicRes.json();
    const rawText = data?.content?.[0]?.text ?? "{}";
    const cleaned = rawText.replace(/json|/g, "").trim();
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

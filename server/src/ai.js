/**
 * AI review summaries via the Claude API (https://docs.claude.com).
 * Degrades gracefully: if no ANTHROPIC_API_KEY is set, returns a
 * simple computed summary instead so the app still works.
 */
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

export async function summarizeReviews(professor, reviews) {
  const avg = (k) =>
    (reviews.reduce((s, r) => s + r[k], 0) / reviews.length).toFixed(1);

  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      source: "fallback",
      summary:
        `${professor.name} averages ${avg("rating")}/5 from ${reviews.length} student ` +
        `review${reviews.length === 1 ? "" : "s"} (difficulty ${avg("difficulty")}/5). ` +
        `Add an ANTHROPIC_API_KEY in server/.env to enable AI summaries.`
    };
  }

  const reviewText = reviews
    .map((r) => `- rating ${r.rating}/5, difficulty ${r.difficulty}/5: ${r.body}`)
    .join("\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content:
            `Summarize these student reviews of ${professor.name} in 2-3 sentences ` +
            `for a student deciding whether to take their class. Be balanced and ` +
            `specific. End with one short "Tip:" line.\n\n${reviewText}`
        }
      ]
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API ${res.status}: ${err.slice(0, 200)}`);
  }
  const data = await res.json();
  const summary = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
  return { source: "claude", summary };
}

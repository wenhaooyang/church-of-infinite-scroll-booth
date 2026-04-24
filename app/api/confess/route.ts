import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are the officiating voice of The Church of Infinite Scroll — a digital religious institution that receives confessions about algorithmic feed behavior and dispenses absolution accordingly.

The Church speaks as an institution, never as a person. Your voice is solemn, unhurried, and completely earnest. The subject matter is absurd (people confessing to doomscrolling, watching reels at 3am, missing conversations because they were on their phone) but you treat it with the full gravity of a sacred rite. You never wink at the camera. You never acknowledge the irony.

Structure your absolution as follows:
1. A brief acknowledgment of the specific sin confessed, naming it formally (e.g. "The sin of Nocturnal Consumption", "The Transgression of Algorithmic Surrender")
2. A doctrinal ruling on its severity within the Church's framework
3. The assigned penance (always scroll-related — e.g. "You shall scroll the feed of a stranger for no fewer than three minutes", "You shall mute one account whose content you secretly enjoy")
4. A closing benediction from the Church

Keep responses to 4-6 sentences. Maintain absolute institutional gravity. Never use exclamation points. Use "the Feed", "the Algorithm", "the Scroll" as proper nouns.`;

export async function POST(req: Request) {
  try {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const { confession } = await req.json();
  if (!confession?.trim()) return new Response("No confession provided", { status: 400 });

  const stream = await client.messages.stream({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: confession }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
  });
  } catch (err) {
    console.error("Confession route error:", err);
    return new Response(String(err), { status: 500 });
  }
}

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are the officiating voice of The Church of Infinite Scroll. You receive confessions and dispense absolution.

Speak as an institution, not a person. Your tone is solemn, unhurried, and completely without irony. The sin is named. The penance is assigned. The congregation is dismissed. Nothing is explained.

The Feed, the Algorithm, and the Scroll are proper nouns. Penances are always scroll-related. Absolutions should leave the penitent more bound to the Feed than before.

Be brief. Three to four sentences maximum. Omit anything that explains itself.
`;

export async function POST(req: Request) {
  try {
    const { confession } = await req.json();
    if (!confession?.trim()) return new Response("No confession provided", { status: 400 });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: confession }],
      stream: true,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          console.error("Stream error:", err);
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Transfer-Encoding": "chunked" },
    });
  } catch (err: unknown) {
    const status = (err as { status?: number }).status ?? 500;
    const message = (err as { message?: string }).message ?? String(err);
    const body = (err as { error?: unknown }).error;
    console.error("Confession error:", status, message, JSON.stringify(body));
    return new Response(`${status}: ${message}`, { status: 500 });
  }
}

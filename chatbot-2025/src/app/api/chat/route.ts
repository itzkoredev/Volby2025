import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Set the runtime to edge for best performance
export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();

  try {
    const result = await streamText({
      model: openai('gpt-3.5-turbo'),
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error: any) {
    console.error(error);
    const errorMessage = error.message || 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

// Set the runtime to edge for best performance
export const runtime = 'edge';

type ChatMessageRole = 'system' | 'user' | 'assistant';

type ChatRequest = {
  messages: Array<{
    role: ChatMessageRole;
    content: string;
  }>;
};

const isChatMessageRole = (value: unknown): value is ChatMessageRole =>
  typeof value === 'string' &&
  (value === 'system' || value === 'user' || value === 'assistant');

const isChatRequest = (value: unknown): value is ChatRequest => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const { messages } = value as { messages?: unknown };
  if (!Array.isArray(messages)) {
    return false;
  }

  return messages.every((message: unknown) => {
    if (!message || typeof message !== 'object') {
      return false;
    }

    const { role, content } = message as {
      role?: unknown;
      content?: unknown;
    };

    return isChatMessageRole(role) && typeof content === 'string';
  });
};

export async function POST(req: Request) {
  const body: unknown = await req.json();

  if (!isChatRequest(body)) {
    return new Response(
      JSON.stringify({ error: 'Invalid request payload' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }

  try {
    const result = await streamText({
      model: openai('gpt-3.5-turbo'),
      messages: body.messages,
    });

    return result.toTextStreamResponse();
  } catch (error: unknown) {
    console.error(error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

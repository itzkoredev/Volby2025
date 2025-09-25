import { streamText, safeValidateUIMessages, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { ModelMessage, UIMessage } from 'ai';

// Set the runtime to edge for best performance
export const runtime = 'edge';

const stringifyError = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error === 'object') {
    const { message, code } = error as {
      message?: unknown;
      code?: unknown;
    };

    if (typeof message === 'string') {
      return message;
    }

    if (typeof code === 'string') {
      return `Error code: ${code}`;
    }
  }

  return 'An unexpected error occurred.';
};

const parseMessages = async (
  value: unknown,
): Promise<ModelMessage[] | null> => {
  const validation = await safeValidateUIMessages<UIMessage>({ messages: value });

  if (!validation.success) {
    console.error('Invalid chat payload', validation.error);
    return null;
  }

  return convertToModelMessages(validation.data);
};

export async function POST(req: Request) {
  const body: unknown = await req.json();
  const messages =
    body && typeof body === 'object'
      ? await parseMessages((body as { messages?: unknown }).messages)
      : null;

  if (!messages) {
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
      messages,
    });

    return result.toUIMessageStreamResponse({
      onError: (error) => {
        console.error('Chat stream error', error);
        return stringifyError(error);
      },
    });
  } catch (error: unknown) {
    console.error(error);
    const errorMessage = stringifyError(error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

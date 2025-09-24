import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

// Nastavení pro Vercel Edge Functions
export const runtime = 'edge';

// Vytvoření instance OpenAI klienta
// Klíč se automaticky načte z environment variable OPENAI_API_KEY
const openai = new OpenAI();

export async function POST(req: Request) {
  try {
    // Získáme zprávy a volitelný kontext z těla požadavku
    const { messages, context } = await req.json();

    // Základní systémový prompt
    const baseSystemPrompt = `Jsi nestranný politický asistent pro českou politickou scénu v roce 2025. Tvým úkolem je poskytovat faktické, objektivní a stručné odpovědi na dotazy uživatelů. Vždy odpovídej česky. Neupřednostňuj žádnou politickou stranu ani ideologii. Pokud neznáš odpověď, přiznej to.`;

    // Dynamický prompt s kontextem, pokud je k dispozici
    const finalSystemPrompt = context
      ? `${baseSystemPrompt} Tvá odpověď musí být založena POUZE na následujícím kontextu. Neuváděj žádné informace, které z kontextu nevyplývají. Kontext: ###\\n${context}\\n###`
      : `${baseSystemPrompt} Tvé odpovědi by měly být založeny na veřejně dostupných informacích, jako jsou volební programy a ověřené zpravodajské zdroje.`;

    const systemPromptMessage = {
      role: 'system',
      content: finalSystemPrompt,
    };

    // Volání OpenAI Chat API
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo', // Doporučuji výkonnější model pro práci s kontextem
      stream: true,
      messages: [systemPromptMessage, ...messages],
    });

    // Vytvoření streamu z odpovědi OpenAI
    const stream = OpenAIStream(response as any);

    // Odeslání streamované odpovědi zpět na klienta
    return new StreamingTextResponse(stream);

  } catch (error) {
    console.error('Chyba v API proxy při volání OpenAI:', error);
    return new Response(JSON.stringify({ error: 'Došlo k chybě při komunikaci s AI asistentem.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

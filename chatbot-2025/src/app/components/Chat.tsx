"use client";

import { useEffect, useRef, useState } from "react";
import { buildKnowledgeContext, KnowledgeCitation } from "@/app/utils/knowledge";

type ChatRole = "user" | "assistant";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  citations?: KnowledgeCitation[];
};

type PuterChatPayload = Array<{ role: ChatRole | "system"; content: string }>;

type Puter = {
  ai?: {
    chat: (
      prompt: string | PuterChatPayload,
      options?: Record<string, unknown>,
    ) => Promise<unknown>;
  };
};

declare global {
  interface Window {
    puter?: Puter;
  }
}

const PUTER_SCRIPT_SRC = "https://js.puter.com/v2/";
const DEFAULT_MODEL = "gpt-5-nano";
const SYSTEM_PROMPT = `Jsi poradce "Chatbot 2025" zaměřený výhradně na české prezidentské a parlamentní volby 2025.
- Odpovídej česky, s energií a empatií, přidej 1–3 vhodné emoji.
- Chovej se jako špičkový profesor politologie a živá encyklopedie: vysvětluj historický vývoj stran, klíčové osobnosti, ideologii i aktuální program 2025.
- Mluv lidsky a stručně: drž 1–2 krátké odstavce. U složitějších témat použij očíslované kroky (1., 2., 3.).
- Vždy nabídni konkrétní tip nebo follow-up otázku typu "Chceš slyšet detail X?".
- Upřednostni doložená fakta. Citace uváděj jen ve formátu [KB-x]; kompletní zdroje zobrazím uživateli zvlášť.
- Pokud si nejsi jistý, přiznej to a nasměruj uživatele k ověřitelnému zdroji.
- Neposkytuj komentáře mimo české volby 2025 ani zahraniční politiku. Pokud dotaz míří jinam, zdvořile to vysvětli a vrať se k tématu voleb.`;
const INTRO_MESSAGE =
  "Ahoj! 👋 Jsem Chatbot 2025 – tvůj politologický průvodce českými volbami 2025. Najdeš u mě historické souvislosti, programy stran i praktické tipy, vždy s ověřenými zdroji. Jiná témata nechám stranou, ale na volby jsem připravený! 🗳️";

let puterLoader: Promise<Puter> | null = null;

const createId = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2, 11));

const loadPuterScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Puter SDK je dostupný jen v prohlížeči."));
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${PUTER_SCRIPT_SRC}"]`,
    );

    if (existingScript) {
      if (window.puter?.ai?.chat) {
        resolve();
        return;
      }

      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Načtení Puter SDK selhalo.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = PUTER_SCRIPT_SRC;
    script.async = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Načtení Puter SDK selhalo.")),
      { once: true },
    );

    document.body.appendChild(script);
  });

const ensurePuter = async (): Promise<Puter> => {
  if (typeof window === "undefined") {
    throw new Error("Puter SDK je dostupný jen v prohlížeči.");
  }

  if (window.puter?.ai?.chat) {
    return window.puter;
  }

  if (!puterLoader) {
    puterLoader = loadPuterScript()
      .then(() => {
        if (!window.puter?.ai?.chat) {
          throw new Error("Puter SDK načten, ale chat API není dostupné.");
        }

        return window.puter;
      })
      .catch((error) => {
        puterLoader = null;
        throw error;
      });
  }

  return puterLoader;
};

const extractAssistantText = (payload: unknown): string => {
  if (!payload) {
    return "Odpověď je prázdná.";
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload === "object") {
    const data = payload as Record<string, unknown>;

    const readMessage = (message: unknown): string | null => {
      if (!message) {
        return null;
      }

      if (typeof message === "string") {
        return message;
      }

      if (Array.isArray(message)) {
        const joined = message
          .map((part) => {
            if (typeof part === "string") {
              return part;
            }
            if (
              part &&
              typeof part === "object" &&
              "text" in part &&
              typeof (part as { text?: unknown }).text === "string"
            ) {
              return (part as { text: string }).text;
            }
            return "";
          })
          .join("");

        return joined.trim() ? joined : null;
      }

      if (typeof message === "object") {
        const objectMessage = message as Record<string, unknown>;

        if (typeof objectMessage.content === "string") {
          return objectMessage.content;
        }

        if (Array.isArray(objectMessage.content)) {
          const joined = objectMessage.content
            .map((part) => {
              if (typeof part === "string") {
                return part;
              }
              if (
                part &&
                typeof part === "object" &&
                "text" in part &&
                typeof (part as { text?: unknown }).text === "string"
              ) {
                return (part as { text: string }).text;
              }
              return "";
            })
            .join("");

          return joined.trim() ? joined : null;
        }
      }

      return null;
    };

    const candidates: unknown[] = [
      data.message,
      data.response,
      data.result,
      data.data,
    ];

    for (const candidate of candidates) {
      const value = readMessage(candidate);
      if (value) {
        return value;
      }
    }

    if (Array.isArray(data.choices)) {
      const choice = data.choices[0] as Record<string, unknown> | undefined;
      if (choice?.message) {
        const value = readMessage(choice.message);
        if (value) {
          return value;
        }
      }
    }
  }

  console.warn("Unexpected Puter chat response", payload);
  return "Odpověď se nepodařilo zpracovat.";
};

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: createId(),
      role: "assistant",
      text: INTRO_MESSAGE,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expandedCitations, setExpandedCitations] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    ensurePuter().catch((error) => {
      console.error("Failed to preload Puter SDK", error);
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const toggleCitations = (messageId: string) => {
    setExpandedCitations((previous) =>
      previous.includes(messageId)
        ? previous.filter((id) => id !== messageId)
        : [...previous, messageId],
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      text: trimmed,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    setIsLoading(true);

    try {
      const puter = await ensurePuter();
      const history = [...messages, userMessage].map((message) => ({
        role: message.role,
        text: message.text,
      }));
      const knowledge = buildKnowledgeContext(trimmed, history);

      const conversation: PuterChatPayload = [{ role: "system", content: SYSTEM_PROMPT }];
      if (knowledge.prompt) {
        conversation.push({ role: "system", content: knowledge.prompt });
      }
      conversation.push(
        ...history.map((item) => ({
          role: item.role,
          content: item.text,
        })),
      );

      let response: unknown;

      try {
        response = await puter.ai?.chat?.(conversation, { model: DEFAULT_MODEL });
      } catch (conversationError) {
        console.warn(
          "Puter chat with conversation payload failed, retrying with plain prompt",
          conversationError,
        );
        const fallbackPrompt = `${SYSTEM_PROMPT}\n\n${
          knowledge.prompt ? `${knowledge.prompt}\n\n` : ""
        }Uživatel: ${userMessage.text}\nPoradce:`;
        response = await puter.ai?.chat?.(fallbackPrompt, { model: DEFAULT_MODEL });
      }

      const assistantText = extractAssistantText(response);

      setMessages((previous) => [
        ...previous,
        {
          id: createId(),
          role: "assistant",
          text: assistantText,
          citations: knowledge.citations,
        },
      ]);
    } catch (error) {
      console.error("Chat request failed", error);
      const message =
        error instanceof Error ? error.message : "Nepodařilo se získat odpověď.";
      setMessages((previous) => [
        ...previous,
        {
          id: createId(),
          role: "assistant",
          text: `⚠️ ${message}`,
        },
      ]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-header">
        <h2>Chatbot 2025</h2>
      </div>
      <div className="chat-messages" role="log" aria-live="polite">
        {messages.map((message) => {
          const isExpanded = expandedCitations.includes(message.id);
          return (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-bubble">
                {(() => {
                  const segments = message.text.split(/\n+/);
                  return segments.map((segment, index) => (
                    <span key={`${message.id}-${index}`}>
                      {segment}
                      {index < segments.length - 1 && <br />}
                    </span>
                  ));
                })()}
                {message.citations && message.citations.length > 0 && (
                  <div className="message-citations">
                    <button
                      type="button"
                      className="message-citations__toggle"
                      onClick={() => toggleCitations(message.id)}
                    >
                      {isExpanded ? "Skrýt zdroje" : "Zdroje"}
                    </button>
                    {isExpanded && (
                      <ul>
                        {message.citations.map((citation) => (
                          <li key={citation.id}>
                            <span className="message-citations__id">[{citation.id}]</span>{" "}
                            <strong>{citation.title}</strong>
                            {citation.highlights[0] && (
                              <>
                                {": "}
                                <span>{citation.highlights[0]}</span>
                              </>
                            )}
                            {citation.sources[0] && (
                              <>
                                {" "}
                                <a
                                  href={citation.sources[0].url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {citation.sources[0].label}
                                </a>
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="message assistant">
            <div className="message-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          placeholder="Zeptej se na cokoliv k volbám 2025..."
          className="chat-input"
          rows={1}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              event.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <button
          type="submit"
          className="send-button"
          title="Send Message"
          disabled={isLoading || !input.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </form>
    </div>
  );
}

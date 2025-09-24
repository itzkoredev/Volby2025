'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Bot, User, ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Document } from 'flexsearch';

interface Message {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  sources?: Passage[]; // Nové pole pro zdroje
}

interface Passage {
  id: string;
  content: string;
  metadata: {
    type: 'party' | 'thesis' | 'position';
    partyName?: string;
    issueId?: string;
  };
}

// Nová komponenta pro zobrazení zdroje
function SourceBadge({ passage }: { passage: Passage }) {
  return (
    <div className="mt-2 p-2 border rounded-md bg-gray-50 text-xs text-gray-600">
      <p className="font-semibold flex items-center"><BookOpen className="h-3 w-3 mr-1.5" /> Zdroj:</p>
      <p className="mt-1 italic">"{passage.content}"</p>
      <p className="mt-1 text-gray-500">
        {passage.metadata.type === 'party' && `(Profil strany: ${passage.metadata.partyName})`}
        {passage.metadata.type === 'position' && `(Postoj strany: ${passage.metadata.partyName})`}
      </p>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Stavy pro vyhledávací index - použijeme obecnější typ
  const [index, setIndex] = useState<any | null>(null);
  const [passages, setPassages] = useState<Passage[]>([]);

  useEffect(() => {
    // Načtení vyhledávacího indexu
    async function loadSearchIndex() {
      try {
        const response = await fetch('/data/search-index.json');
        const data = await response.json();
        
        const docIndex = new Document({
          tokenize: 'full',
          document: {
            id: 'id',
            index: ['content'],
            store: ['metadata'],
          },
        });

        // Importujeme data do indexu
        for (const key in data.index) {
          // @ts-ignore
          docIndex.import(key, data.index[key]);
        }
        
        setIndex(docIndex);
        setPassages(data.passages);
        console.log('Vyhledávací index úspěšně načten.');
      } catch (error) {
        console.error('Nepodařilo se načíst vyhledávací index:', error);
      }
    }
    loadSearchIndex();
  }, []);

  useEffect(() => {
    // Automatické scrollování na poslední zprávu
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    let foundSources: Passage[] = [];
    let context = '';
    if (index && passages.length > 0) {
      const searchResults = await index.searchAsync(input, { limit: 3, enrich: true }); // Snížíme limit na 3 pro přehlednost
      
      if (searchResults.length > 0 && searchResults[0].result.length > 0) {
        const foundPassages = searchResults[0].result.map((res: any) => {
          return passages.find(p => p.id === res.id);
        }).filter(Boolean) as Passage[];

        foundSources = foundPassages;
        context = foundPassages.map(p => p?.content).join('\\n\\n---\\n\\n');
        console.log('Nalezený kontext:', context);
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      role: 'user',
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Přidáme kontext do těla požadavku
        body: JSON.stringify({ messages: [...messages, userMessage], context }),
      });

      if (!response.body) {
        throw new Error('ReadableStream not available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantResponse = '';
      const assistantMessageId = (Date.now() + 1).toString();

      // Přidáme prázdnou zprávu asistenta
      setMessages(prev => [...prev, { id: assistantMessageId, text: '', role: 'assistant' }]);

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\\n\\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const json = JSON.parse(line.substring(6));
              assistantResponse += json.part;
              setMessages(prev =>
                prev.map(msg =>
                  msg.id === assistantMessageId
                    ? { ...msg, text: assistantResponse }
                    : msg
                )
              );
            } catch (error) {
              // Ignorovat chyby při parsování, může se stát u nekompletních zpráv
            }
          }
        }
      }

      // Po dokončení streamu přidáme k zprávě zdroje
      setMessages(prev =>
        prev.map(msg =>
          msg.id === assistantMessageId
            ? { ...msg, sources: foundSources }
            : msg
        )
      );

    } catch (error) {
      console.error('Chyba při komunikaci s API:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Omlouvám se, došlo k chybě. Zkuste to prosím znovu.",
        role: 'assistant',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold text-gray-800 flex items-center">
              <Bot className="h-6 w-6 mr-2 text-blue-600" />
              Politický Asistent
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4">
        <Card className="flex-1 flex flex-col max-w-3xl w-full mx-auto shadow-lg">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`flex items-start gap-3 ${
                      message.role === 'user' ? 'justify-end' : ''
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8 border">
                        <AvatarFallback className="bg-blue-500 text-white"><Bot size={18} /></AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      {/* Zobrazení zdrojů */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          {message.sources.map(source => (
                            <SourceBadge key={source.id} passage={source} />
                          ))}
                        </div>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8 border">
                        <AvatarFallback><User size={18} /></AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-start gap-3"
                  >
                    <Avatar className="w-8 h-8 border">
                      <AvatarFallback className="bg-blue-500 text-white"><Bot size={18} /></AvatarFallback>
                    </Avatar>
                    <div className="px-4 py-3 rounded-2xl bg-gray-100 rounded-bl-none">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="h-2 w-2 bg-blue-500 rounded-full animate-bounce"></span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Zeptejte se na cokoliv z české politiky..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading || !input.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

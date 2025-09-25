import { knowledgeEntries, KnowledgeEntry } from "@/data/knowledge-base";

export type KnowledgeCitation = {
  id: string;
  title: string;
  summary: string;
  highlights: string[];
  sources: {
    label: string;
    url: string;
    accessed: string;
  }[];
};

type RankedEntry = KnowledgeEntry & { score: number };

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\p{Diacritic}]/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const tokenize = (text: string) => normalize(text).split(/\s+/).filter(Boolean);

const calculateScore = (queryTokens: string[], entry: KnowledgeEntry) => {
  const fields = [entry.title, entry.summary, entry.content, entry.tags.join(" ")];
  const entryTokens = tokenize(fields.join(" "));
  const tokenSet = new Set(entryTokens);
  let score = 0;
  for (const token of queryTokens) {
    if (tokenSet.has(token)) {
      score += 3;
    }
  }
  for (const highlight of entry.highlights) {
    const highlightTokens = tokenize(highlight);
    for (const token of queryTokens) {
      if (highlightTokens.includes(token)) {
        score += 2;
      }
    }
  }
  return score;
};

export const buildKnowledgeContext = (
  query: string,
  conversation: { role: string; text: string }[],
) => {
  const recentQuestion = [query, ...conversation.slice(-3).map((msg) => msg.text)].join(" ");
  const queryTokens = tokenize(recentQuestion);
  if (queryTokens.length === 0) {
    return { prompt: "", citations: [] as KnowledgeCitation[] };
  }

  const ranked: RankedEntry[] = knowledgeEntries
    .map((entry) => ({ ...entry, score: calculateScore(queryTokens, entry) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  if (ranked.length === 0) {
    return { prompt: "", citations: [] as KnowledgeCitation[] };
  }

  const promptSections = ranked.map((entry, index) => {
    const sectionHighlights = entry.highlights
      .slice(0, 2)
      .map((item) => `• ${item}`)
      .join("\n");
    const primarySource = entry.sources[0];
    const sourceLine = primarySource
      ? `Zdroj: ${primarySource.label} (${primarySource.url}, navštíveno ${primarySource.accessed})`
      : "";
    return `[#${index + 1} ${entry.id}] ${entry.title}\nShrnutí: ${entry.summary}\nKlíčové body:\n${sectionHighlights}\n${sourceLine}`.trim();
  });

  const prompt = `Důvěryhodná fakta z interní databáze:\n${promptSections.join("\n\n")}`;

  const citations: KnowledgeCitation[] = ranked.map((entry) => ({
    id: entry.id,
    title: entry.title,
    summary: entry.summary,
    highlights: entry.highlights,
    sources: entry.sources,
  }));

  return { prompt, citations };
};

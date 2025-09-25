export type KnowledgeSource = {
  label: string;
  url: string;
  accessed: string;
  note?: string;
};

export type KnowledgeHighlight = {
  bullet: string;
  emphasis?: 'impact' | 'risk' | 'history';
};

export type KnowledgeEntry = {
  id: string;
  kind: 'party' | 'topic' | 'process';
  title: string;
  summary: string;
  tags: string[];
  highlights: KnowledgeHighlight[];
  content: string;
  sources: KnowledgeSource[];
};

export type KnowledgeBase = KnowledgeEntry[];
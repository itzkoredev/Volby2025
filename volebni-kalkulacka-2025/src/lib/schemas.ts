import { z } from 'zod';

// Schéma pro politickou stranu
export const PartySchema = z.object({
  id: z.string().min(1, 'ID strany je povinné'),
  slug: z.string().min(1, 'Slug je povinný'),
  name: z.string().min(1, 'Název strany je povinný'),
  shortName: z.string().min(1, 'Zkratka strany je povinná'),
  website: z.string().url('Neplatná URL webové stránky').optional(),
  logo: z.string().url('Neplatná URL loga').optional(),
  description: z.string().optional(),
  sources: z.array(z.string()).default([]),
  lastUpdated: z.string().datetime().optional(),
});

// Schéma pro téma/oblast
export const IssueSchema = z.object({
  id: z.string().min(1, 'ID tématu je povinné'),
  title: z.string().min(1, 'Název tématu je povinný'),
  description: z.string().optional(),
  category: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

// Schéma pro jednotlivou tezi
export const ThesisSchema = z.object({
  id: z.string().min(1, 'ID teze je povinné'),
  issueId: z.string().min(1, 'ID tématu je povinné'),
  text: z.string().min(1, 'Text teze je povinný'),
  scaleMin: z.number().int().min(-3).max(0).default(-2),
  scaleMax: z.number().int().min(0).max(3).default(2),
  evidencePolicy: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// Schéma pro pozici strany k tezi
export const PartyPositionSchema = z.object({
  partyId: z.string().min(1, 'ID strany je povinné'),
  thesisId: z.string().min(1, 'ID teze je povinné'),
  value: z.number().min(-2).max(2, 'Hodnota musí být mezi -2 a 2'),
  confidence: z.number().min(0).max(1, 'Konfidence musí být mezi 0 a 1'),
  source: z.object({
    url: z.string().url('Neplatná URL zdroje'),
    date: z.string().datetime('Neplatné datum'),
    type: z.enum(['program', 'hlasovani', 'prohlaseni', 'rozhovor', 'finance']),
    title: z.string().optional(),
  }),
  lastUpdated: z.string().datetime().optional(),
});

// Schéma pro FAQ
export const FAQSchema = z.object({
  id: z.string().min(1, 'ID otázky je povinné'),
  question: z.string().min(1, 'Otázka je povinná'),
  answer: z.string().min(1, 'Odpověď je povinná'),
  sources: z.array(z.string()).default([]),
  category: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// Schéma pro zdroje
export const SourceSchema = z.object({
  id: z.string().min(1, 'ID zdroje je povinné'),
  url: z.string().url('Neplatná URL'),
  title: z.string().min(1, 'Název zdroje je povinný'),
  date: z.string().datetime('Neplatné datum'),
  type: z.enum(['program', 'hlasovani', 'prohlaseni', 'rozhovor', 'finance']),
  partyId: z.string().optional(),
  description: z.string().optional(),
});

// Schéma pro výsledky kalkulačky
export const ScoreResultSchema = z.object({
  partyId: z.string(),
  score: z.number().min(0).max(100),
  distance: z.number().min(0),
  matchPercentage: z.number().min(0).max(100),
  topAgreements: z.array(z.string()).default([]),
  topDisagreements: z.array(z.string()).default([]),
});

// Schéma pro uživatelské odpovědi
export const UserAnswersSchema = z.object({
  answers: z.record(z.string(), z.number().min(-2).max(2)),
  weights: z.record(z.string(), z.number().min(1).max(3)),
  timestamp: z.string().datetime(),
});

// Exporty typů
export type Party = z.infer<typeof PartySchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type Thesis = z.infer<typeof ThesisSchema>;
export type PartyPosition = z.infer<typeof PartyPositionSchema>;
export type FAQ = z.infer<typeof FAQSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type ScoreResult = z.infer<typeof ScoreResultSchema>;
export type UserAnswers = z.infer<typeof UserAnswersSchema>;

// Kolekce schémat pro validaci celých souborů
export const PartiesDataSchema = z.array(PartySchema);
export const IssuesDataSchema = z.array(IssueSchema);
export const ThesesDataSchema = z.array(ThesisSchema);
export const PartyPositionsDataSchema = z.array(PartyPositionSchema);
export const FAQDataSchema = z.array(FAQSchema);
export const SourcesDataSchema = z.array(SourceSchema);
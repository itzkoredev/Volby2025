import { z } from 'zod';

// Zod schémata pro validaci dat
export const RepresentativeSchema = z.object({
  name: z.string(),
  position: z.string(),
  photo: z.string().optional(),
  bio: z.string().optional()
});

export const TimelineEventSchema = z.object({
  date: z.string(),
  title: z.string(),
  description: z.string(),
  type: z.enum(['program', 'success', 'poll', 'election', 'controversy', 'milestone'])
});

export const PartySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  shortName: z.string().optional(),
  website: z.string().url().optional(),
  logo: z.string().optional(),
  description: z.string().optional(),
  pollPercentage: z.number().optional(),
  category: z.enum(['main', 'secondary']).default('secondary'),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  historicalAchievements: z.array(z.string()).optional(),
  controversies: z.array(z.string()).optional(),
  representatives: z.array(RepresentativeSchema).optional(),
  timeline: z.array(TimelineEventSchema).optional(),
  sources: z.array(z.string()).optional(),
  lastUpdated: z.string().optional()
});

export const IssueSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string().optional()
});

export const ThesisSchema = z.object({
  id: z.string(),
  issueId: z.string(),
  text: z.string(),
  scaleMin: z.number().min(-2).max(2).default(-2),
  scaleMax: z.number().min(-2).max(2).default(2),
  evidencePolicy: z.string().optional()
});

export const PartyPositionSchema = z.object({
  partyId: z.string(),
  thesisId: z.string(),
  value: z.number().min(-2).max(2),
  confidence: z.number().min(0).max(1), // 0-1 (0 = nejistá pozice, 1 = velmi jistá)
  source: z.string().optional(), // URL nebo ID zdroje
  sourceDate: z.string().optional(),
  sourceType: z.enum(['program', 'voting', 'statement', 'media']).optional()
});

export const FAQSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  sources: z.array(z.string()).optional()
});

export const SourceSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  title: z.string(),
  date: z.string(),
  type: z.enum(['program', 'voting', 'statement', 'media', 'finance']),
  description: z.string().optional()
});

// TypeScript typy odvozené ze schémat
export type Party = z.infer<typeof PartySchema>;
export type Representative = z.infer<typeof RepresentativeSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type Thesis = z.infer<typeof ThesisSchema>;
export type PartyPosition = z.infer<typeof PartyPositionSchema>;
export type FAQ = z.infer<typeof FAQSchema>;
export type Source = z.infer<typeof SourceSchema>;

// Dodatečné typy pro kalkulačku
export interface UserAnswer {
  thesisId: string;
  value: number; // -2 až +2
  weight: number; // 1-3 (důležitost)
  skipped?: boolean;
}

export interface CalculatorState {
  mode: 'quick' | 'full';
  currentThesis: number;
  answers: Record<string, UserAnswer>;
  completed: boolean;
}

export interface ScoreResult {
  partyId: string;
  partyName: string;
  totalScore: number;
  maxPossibleScore: number;
  agreementPercentage: number;
  confidenceScore: number;
}

// Kolekce dat pro export/import
export interface DataCollection {
  parties: Party[];
  issues: Issue[];
  theses: Thesis[];
  partyPositions: PartyPosition[];
  faq: FAQ[];
  sources: Source[];
  lastUpdated: string;
}
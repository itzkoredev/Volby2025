// Importujeme Zod a všechny schémata a typy z centrálního souboru
import { z } from 'zod';
import {
  PartySchema,
  IssueSchema,
  ThesisSchema,
  PartyPositionSchema,
  FAQSchema,
  SourceSchema,
  RepresentativeSchema,
  TimelineEventSchema
} from './schemas';

// TypeScript typy jsou nyní odvozené z importovaných schémat
export type Party = z.infer<typeof PartySchema>;
export type Representative = z.infer<typeof RepresentativeSchema>;
export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type Thesis = z.infer<typeof ThesisSchema>;
export type PartyPosition = z.infer<typeof PartyPositionSchema>;
export type FAQ = z.infer<typeof FAQSchema>;
export type Source = z.infer<typeof SourceSchema>;

// Dodatečné typy pro kalkulačku (tyto zde zůstávají, protože nejsou v schemas.ts)
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
  coveragePercentage: number;
  thesisResults: any[]; // Zjednodušeno prozatím
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
import { z } from 'zod';

// SchĂ©ma pro pĹ™edstavitele strany
export const RepresentativeSchema = z.object({
  name: z.string().min(1, 'JmĂ©no pĹ™edstavitele je povinnĂ©'),
  position: z.string().optional(),
  photo: z.string().url('NeplatnĂˇ URL fotografie').optional(),
  bio: z.string().optional(),
});

// SchĂ©ma pro udĂˇlost na ÄŤasovĂ© ose
export const TimelineEventSchema = z.object({
  // Accept simple date strings (YYYY-MM-DD) or full datetimes; keep validation lenient
  date: z.string().min(1, 'NeplatnĂ© datum udĂˇlosti'),
  title: z.string().min(1, 'NĂˇzev udĂˇlosti je povinnĂ˝'),
  description: z.string().optional(),
  type: z.enum(['success', 'controversy', 'poll', 'election', 'program', 'milestone']).optional(),
});

// SchĂ©ma pro politickou stranu
export const PartySchema = z.object({
  id: z.string().min(1, 'ID strany je povinnĂ©'),
  slug: z.string().min(1, 'Slug je povinnĂ˝'),
  name: z.string().min(1, 'NĂˇzev strany je povinnĂ˝'),
  // Short name is optional in data; logo may be an URL or an empty string when not available
  shortName: z.string().min(1, 'Zkratka strany je povinnĂˇ').optional(),
  website: z.string().url('NeplatnĂˇ URL webovĂ© strĂˇnky').optional(),
  logo: z.union([z.string().url('NeplatnĂˇ URL loga'), z.literal('')]).optional(),
  description: z.string().optional(),
  sources: z.array(z.string()).default([]),
  lastUpdated: z.string().datetime().optional(),
  pollPercentage: z.number().min(0).max(100).optional(),
  category: z.enum(['main', 'secondary']).default('secondary'),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  historicalAchievements: z.array(z.string()).optional(),
  controversies: z.array(z.string()).optional(),
  representatives: z.array(RepresentativeSchema).optional(),
  timeline: z.array(TimelineEventSchema).optional(),
});

// SchĂ©ma pro tĂ©ma/oblast
export const IssueSchema = z.object({
  id: z.string().min(1, 'ID tĂ©matu je povinnĂ©'),
  title: z.string().min(1, 'NĂˇzev tĂ©matu je povinnĂ˝'),
  description: z.string().optional(),
  category: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

// SchĂ©ma pro jednotlivou tezi
export const ThesisSchema = z.object({
  id: z.string().min(1, 'ID teze je povinnĂ©'),
  issueId: z.string().min(1, 'ID tĂ©matu je povinnĂ©'),
  text: z.string().min(1, 'Text teze je povinnĂ˝'),
  scaleMin: z.number().int().min(-3).max(0).default(-2),
  scaleMax: z.number().int().min(0).max(3).default(2),
  evidencePolicy: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  contextFact: z.string().optional(),
  contextSource: z.string().url('Neplatn�� URL zdroje kontextu').optional(),
});

// SchĂ©ma pro FAQ
export const FAQSchema = z.object({
  id: z.string().min(1, 'ID otĂˇzky je povinnĂ©'),
  question: z.string().min(1, 'OtĂˇzka je povinnĂˇ'),
  answer: z.string().min(1, 'OdpovÄ›ÄŹ je povinnĂˇ'),
  sources: z.array(z.string()).default([]),
  category: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  contextFact: z.string().optional(),
  contextSource: z.string().url('Neplatn�� URL zdroje kontextu').optional(),
});

// SchĂ©ma pro zdroje
export const SourceSchema = z.object({
  id: z.string().min(1, 'ID zdroje je povinnĂ©'),
  url: z.string().url('NeplatnĂˇ URL'),
  title: z.string().min(1, 'NĂˇzev zdroje je povinnĂ˝'),
  date: z.string().datetime('NeplatnĂ© datum'),
  type: z.enum(['program', 'hlasovani', 'prohlaseni', 'rozhovor', 'finance']),
  partyId: z.string().optional(),
  description: z.string().optional(),
});

// SchĂ©ma pro vĂ˝sledky kalkulaÄŤky
export const ScoreResultSchema = z.object({
  partyId: z.string(),
  score: z.number().min(0).max(100),
  distance: z.number().min(0),
  matchPercentage: z.number().min(0).max(100),
  topAgreements: z.array(z.string()).default([]),
  topDisagreements: z.array(z.string()).default([]),
});

// SchĂ©ma pro uĹľivatelskĂ© odpovÄ›di
export const UserAnswersSchema = z.object({
  answers: z.record(z.string(), z.number().min(-2).max(2)),
  weights: z.record(z.string(), z.number().min(1).max(3)),
  timestamp: z.string().datetime(),
});

// SchĂ©ma pro pozici strany k tezi
export const PartyPositionSchema = z.object({
  partyId: z.string().min(1, 'ID strany je povinnĂ©'),
  thesisId: z.string().min(1, 'ID teze je povinnĂ©'),
  value: z.number().min(-2).max(2, 'Hodnota musĂ­ bĂ˝t mezi -2 a 2'),
  confidence: z.number().min(0).max(1, 'Konfidence musĂ­ bĂ˝t mezi 0 a 1'),
  justification: z.string().optional(), // KrĂˇtkĂ© zdĹŻvodnÄ›nĂ­ postoje

  // NovĂˇ detailnĂ­ pole
  details: z.object({
    arguments: z.array(z.string()).optional(), // KlĂ­ÄŤovĂ© argumenty pro postoj
    quotes: z.array(z.object({
      text: z.string(),
      author: z.string(),
      source: z.string().url().optional(),
    })).optional(), // PĹ™Ă­mĂ© citace
    relatedVotes: z.array(z.object({
      name: z.string(),
      url: z.string().url(),
      result: z.enum(['pro', 'proti', 'zdrĹľel se']),
    })).optional(), // SouvisejĂ­cĂ­ hlasovĂˇnĂ­
  }).optional(),

  source: z.object({
    url: z.string().url('NeplatnĂˇ URL zdroje'),
    date: z.string().datetime('NeplatnĂ© datum'),
    type: z.enum(['program', 'hlasovani', 'prohlaseni', 'rozhovor', 'finance']),
    title: z.string().optional(),
  }),
  lastUpdated: z.string().datetime().optional(),
});

// Exporty typĹŻ
export type Party = z.infer<typeof PartySchema>;
export type Issue = z.infer<typeof IssueSchema>;
export type Thesis = z.infer<typeof ThesisSchema>;
export type PartyPosition = z.infer<typeof PartyPositionSchema>;
export type FAQ = z.infer<typeof FAQSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type ScoreResult = z.infer<typeof ScoreResultSchema>;
export type UserAnswers = z.infer<typeof UserAnswersSchema>;

// Kolekce schĂ©mat pro validaci celĂ˝ch souborĹŻ
export const PartiesDataSchema = z.array(PartySchema);
export const IssuesDataSchema = z.array(IssueSchema);
export const ThesesDataSchema = z.array(ThesisSchema);
export const PartyPositionsDataSchema = z.array(PartyPositionSchema);
export const FAQDataSchema = z.array(FAQSchema);
export const SourcesDataSchema = z.array(SourceSchema);

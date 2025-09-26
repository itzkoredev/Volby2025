import { describe, it, expect } from 'vitest';
import { calculateScores, applyRedLinePolicy, generateDetailedComparison } from '../scoring';
import type { UserAnswer, ScoreResult } from '../scoring';
import { PartyPosition, Party, Thesis } from '../types'; // Importujeme typy
import { 
  PartiesDataSchema,
  ThesesDataSchema,
  PartyPositionsDataSchema,
  FAQDataSchema,
  IssuesDataSchema,
  SourcesDataSchema
} from '../schemas'; // Importujeme Zod schĂ©mata
import { readFileSync } from 'fs';
import { join } from 'path';

// TestovacĂ­ data - zjednoduĹˇenĂˇ, aby se pĹ™edeĹˇlo typovĂ˝m chybĂˇm
const mockParties: any[] = [
  { id: 'party1', name: 'Strana A', category: 'main' },
  { id: 'party2', name: 'Strana B', category: 'main' },
  { id: 'party3', name: 'Strana C', category: 'secondary' }
];

const mockPartyPositions: any[] = [
  // Teze 1
  { partyId: 'party1', thesisId: 'thesis1', value: 2, confidence: 1.0, source: { url: 'http://a.com', date: '2025-01-01T00:00:00Z', type: 'program' } },
  { partyId: 'party2', thesisId: 'thesis1', value: -2, confidence: 0.8, source: { url: 'http://a.com', date: '2025-01-01T00:00:00Z', type: 'program' } },
  { partyId: 'party3', thesisId: 'thesis1', value: 0, confidence: 0.6, source: { url: 'http://a.com', date: '2025-01-01T00:00:00Z', type: 'program' } },
  // Teze 2
  { partyId: 'party1', thesisId: 'thesis2', value: -1, confidence: 0.9, source: { url: 'http://a.com', date: '2025-01-01T00:00:00Z', type: 'program' } },
  { partyId: 'party2', thesisId: 'thesis2', value: 1, confidence: 1.0, source: { url: 'http://a.com', date: '2025-01-01T00:00:00Z', type: 'program' } },
  { partyId: 'party3', thesisId: 'thesis2', value: 2, confidence: 0.7, source: { url: 'http://a.com', date: '2025-01-01T00:00:00Z', type: 'program' } },
];

describe('Scoring Engine', () => {
  describe('calculateScores', () => {
    it('should calculate correct scores for identical positions', () => {
      const userAnswers: Record<string, UserAnswer> = {
        thesis1: { thesisId: 'thesis1', value: 2, weight: 1 },
        thesis2: { thesisId: 'thesis2', value: -1, weight: 1 }
      };
      const results = calculateScores(userAnswers, mockPartyPositions, mockParties);
      expect(results[0].partyId).toBe('party1');
      expect(results[0].agreementPercentage).toBe(100);
    });

    it('should calculate correct scores for opposite positions', () => {
      const userAnswers: Record<string, UserAnswer> = {
        thesis1: { thesisId: 'thesis1', value: -2, weight: 1 }, // Opak Strany A (+2)
        thesis2: { thesisId: 'thesis2', value: 1, weight: 1 }   // Opak Strany A (-1)
      };

      const results = calculateScores(userAnswers, mockPartyPositions, mockParties);

      // Strana A by mÄ›la mĂ­t nejniĹľĹˇĂ­ skĂłre
      const partyAResult = results.find(r => r.partyId === 'party1');
      expect(partyAResult?.agreementPercentage).toBeLessThan(50);
    });

    it('should handle weighted answers correctly', () => {
      const userAnswers: Record<string, UserAnswer> = {
        thesis1: { thesisId: 'thesis1', value: 2, weight: 3 }, // VysokĂˇ dĹŻleĹľitost
        thesis2: { thesisId: 'thesis2', value: -1, weight: 1 }  // NĂ­zkĂˇ dĹŻleĹľitost
      };

      const results = calculateScores(userAnswers, mockPartyPositions, mockParties);

      // Strana A by mÄ›la stĂˇle vyhrĂˇt dĂ­ky vysokĂ© vĂˇze u thesis1
      expect(results[0].partyId).toBe('party1');
    });

    it('should handle missing party positions', () => {
      const limitedPositions: any[] = [
        { partyId: 'party1', thesisId: 'thesis1', value: 2, confidence: 1.0, source: { url: 'http://example.com', date: new Date().toISOString(), type: 'program' } }
      ];

      const userAnswers: Record<string, UserAnswer> = {
        thesis1: { thesisId: 'thesis1', value: 2, weight: 1 },
        thesis2: { thesisId: 'thesis2', value: -1, weight: 1 }
      };

      const results = calculateScores(userAnswers, limitedPositions, mockParties);

      // Strana A by mÄ›la mĂ­t vĂ˝sledek jen pro thesis1
      const partyAResult = results.find(r => r.partyId === 'party1');
      expect(partyAResult?.thesisResults).toHaveLength(1);
    });

    it('prioritizes hlavní strany while keeping scores ordered within each category', () => {
      const userAnswers: Record<string, UserAnswer> = {
        thesis1: { thesisId: 'thesis1', value: 0, weight: 1 }, // Nejblíže Straně C
        thesis2: { thesisId: 'thesis2', value: 2, weight: 1 }   // Opět preferuje Stranu C (secondary)
      };

      const results = calculateScores(userAnswers, mockPartyPositions, mockParties);

      const mainResults = results.filter((result) => result.partyCategory === 'main');
      const secondaryResults = results.filter((result) => result.partyCategory !== 'main');

      expect(mainResults.length).toBeGreaterThan(0);
      expect(results.slice(0, mainResults.length)).toEqual(mainResults);
      expect(results[0].partyCategory).toBe('main');

      for (let index = 1; index < mainResults.length; index += 1) {
        expect(mainResults[index - 1].agreementPercentage).toBeGreaterThanOrEqual(mainResults[index].agreementPercentage);
      }

      for (let index = 1; index < secondaryResults.length; index += 1) {
        expect(secondaryResults[index - 1].agreementPercentage).toBeGreaterThanOrEqual(secondaryResults[index].agreementPercentage);
      }

      if (secondaryResults.length > 0) {
        expect(results[mainResults.length].partyCategory).toBe('secondary');
      }
    });

    it('should ignore answers with zero weight (skipped questions)', () => {
      const userAnswers: Record<string, UserAnswer> = {
        thesis1: { thesisId: 'thesis1', value: 2, weight: 1 },
        thesis2: { thesisId: 'thesis2', value: 2, weight: 0 }  // Neshoda se Stranou A, ale vĂˇha 0
      };

      const results = calculateScores(userAnswers, mockPartyPositions, mockParties);
      const partyAResult = results.find(r => r.partyId === 'party1');

      // ProtoĹľe druhĂˇ otĂˇzka mĂˇ vĂˇhu 0, mÄ›la by bĂ˝t ignorovĂˇna.
      // Strana A mĂˇ u prvnĂ­ teze shodu, takĹľe vĂ˝sledek by mÄ›l bĂ˝t 100% z jedinĂ© relevantnĂ­ otĂˇzky.
      expect(partyAResult?.agreementPercentage).toBe(100);
      expect(partyAResult?.thesisResults).toHaveLength(1);
    });

    it('computes coverage relative to answered questions', () => {
      const userAnswers: Record<string, UserAnswer> = {
        thesis1: { thesisId: 'thesis1', value: 2, weight: 1 },
        thesis2: { thesisId: 'thesis2', value: -1, weight: 1 }
      };

      const partialPositions = mockPartyPositions.filter(
        (position: any) => !(position.partyId === 'party1' && position.thesisId === 'thesis2')
      );

      const results = calculateScores(userAnswers, partialPositions, mockParties);
      const partyA = results.find((result) => result.partyId === 'party1');
      const partyB = results.find((result) => result.partyId === 'party2');

      expect(partyA?.coveragePercentage).toBe(50);
      expect(partyB?.coveragePercentage).toBe(100);
    });
  });

  describe('applyRedLinePolicy', () => {
    it('should apply penalty for red-line disagreements', () => {
      const mockResults: ScoreResult[] = [
        {
          partyId: 'party1',
          partyName: 'Strana A',
          partyCategory: 'main',
          totalScore: 8,
          maxPossibleScore: 8,
          agreementPercentage: 100,
          confidenceScore: 1.0,
          coveragePercentage: 50,
          thesisResults: [
            {
              thesisId: 'thesis1',
              userValue: -2,
              partyValue: 2,
              difference: 4, // VelkĂ˝ nesouhlas
              weight: 1,
              confidence: 1.0,
              contribution: 0
            }
          ]
        }
      ];

      const penalizedResults = applyRedLinePolicy(mockResults, ['thesis1']);

      // MÄ›la by bĂ˝t aplikovĂˇna penalizace -20%
      expect(penalizedResults[0].agreementPercentage).toBe(80);
    });

    it('should not apply penalty when no red-line theses specified', () => {
      const mockResults: ScoreResult[] = [
        {
          partyId: 'party1',
          partyName: 'Strana A',
          partyCategory: 'main',
          totalScore: 8,
          maxPossibleScore: 8,
          agreementPercentage: 100,
          confidenceScore: 1.0,
          coveragePercentage: 100,
          thesisResults: [],
        }
      ];

      const results = applyRedLinePolicy(mockResults, []);
      expect(results[0].agreementPercentage).toBe(100);
    });
  });

  describe('generateDetailedComparison', () => {
    it('should categorize agreements and disagreements correctly', () => {
      const userAnswers: Record<string, UserAnswer> = {
        thesis1: { thesisId: 'thesis1', value: 2, weight: 1 },
        thesis2: { thesisId: 'thesis2', value: 0, weight: 1 },
        thesis3: { thesisId: 'thesis3', value: -2, weight: 1 }
      };

      const mockResult: ScoreResult = {
        partyId: 'party1',
        partyName: 'Strana A',
        partyCategory: 'main',
        totalScore: 0,
        maxPossibleScore: 0,
        agreementPercentage: 0,
        confidenceScore: 0,
        coveragePercentage: 0,
        thesisResults: [
          { thesisId: 'thesis1', userValue: 2, partyValue: 2, difference: 0, weight: 1, confidence: 1, contribution: 1 },
          { thesisId: 'thesis2', userValue: 0, partyValue: -2, difference: 2, weight: 1, confidence: 1, contribution: 0.5 },
          { thesisId: 'thesis3', userValue: -2, partyValue: 2, difference: 4, weight: 1, confidence: 1, contribution: 0 }
        ]
      };

      const comparison = generateDetailedComparison(userAnswers, mockResult);

      expect(comparison.strongAgreements).toHaveLength(1);
      expect(comparison.strongAgreements[0].thesisId).toBe('thesis1');
      expect(comparison.partialAgreements).toHaveLength(1);
      expect(comparison.partialAgreements[0].thesisId).toBe('thesis2');
      expect(comparison.strongDisagreements).toHaveLength(1);
      expect(comparison.strongDisagreements[0].thesisId).toBe('thesis3');
    });
  });

  // Test s reĂˇlnĂ˝mi daty z ÄŤeskĂ˝ voleb 2025
  describe('Real Data Integration Test', () => {
    it('should work with real Czech election data', () => {
      const dataPath = join(process.cwd(), 'public', 'data');
      const realParties: Party[] = JSON.parse(readFileSync(join(dataPath, 'parties.json'), 'utf8'));
      const realPositions: PartyPosition[] = JSON.parse(readFileSync(join(dataPath, 'party_positions.json'), 'utf8'));

      // Simulujeme uĹľivatele, kterĂ˝ souhlasĂ­ s levicovĂ˝mi pozicemi
      const leftLeaningUser: Record<string, UserAnswer> = {
        thesis_001: { thesisId: 'thesis_001', value: 2, weight: 1 }, // DanÄ› pro stĹ™ednĂ­ tĹ™Ă­du - souhlas se snĂ­ĹľenĂ­m (paradoxnÄ› levicovĂ©)
        thesis_002: { thesisId: 'thesis_002', value: 2, weight: 1 }, // StĂˇtnĂ­ investice - souhlas  
        thesis_003: { thesisId: 'thesis_003', value: 2, weight: 1 }, // MinimĂˇlnĂ­ mzda - souhlas s rĹŻstem
      };      const results = calculateScores(leftLeaningUser, realPositions, realParties);

      // OvÄ›Ĺ™Ă­me, Ĺľe vĂ˝sledky jsou logickĂ©
      expect(results).toBeDefined();
      expect(results.length).toBe(realParties.length);
      expect(results[0].agreementPercentage).toBeGreaterThan(0);
      
      // Najdeme StaÄŤilo! a ANO (mÄ›ly by bĂ˝t vysoko u levicovĂ©ho uĹľivatele)
  const staciloResult = results.find(r => r.partyId === 'stacilo');
  const anoResult = results.find(r => r.partyId === 'ano');
  const spoluResult = results.find(r => r.partyId === 'spolu');
      
      expect(staciloResult).toBeDefined();
      expect(anoResult).toBeDefined();
      expect(spoluResult).toBeDefined();

      // StaÄŤilo! a ANO by mÄ›ly bĂ˝t vĂ˝Ĺˇe neĹľ SPOLU u levicovĂ©ho uĹľivatele
      if (staciloResult && anoResult && spoluResult) {
        expect(staciloResult.agreementPercentage).toBeGreaterThan(spoluResult.agreementPercentage);
        expect(anoResult.agreementPercentage).toBeGreaterThan(spoluResult.agreementPercentage);
      }
    });
  });

  // =================================================================
  // Testy pro validaci dat
  // =================================================================

  describe('Data Validation', () => {
    const dataPath = join(process.cwd(), 'public', 'data');

    const filesToValidate = [
      { name: 'parties.json', schema: PartiesDataSchema },
      { name: 'theses.json', schema: ThesesDataSchema },
      { name: 'party_positions.json', schema: PartyPositionsDataSchema },
      { name: 'faq.json', schema: FAQDataSchema, optional: true },
      { name: 'issues.json', schema: IssuesDataSchema, optional: true },
      { name: 'sources.json', schema: SourcesDataSchema, optional: true },
    ];

    it.each(filesToValidate)('should validate schema for $name', ({ name, schema, optional }) => {
      const filePath = join(dataPath, name);
      try {
        const fileContent = readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        // @ts-ignore - Zod schema je zde validnĂ­, ale TS mĂˇ problĂ©m s typy
        const validationResult = schema.safeParse(data);
        expect(validationResult.success).toBe(true);
        if (!validationResult.success) {
          console.error(`Chyby ve souboru ${name}:`, validationResult.error.issues);
        }
      } catch (error: any) {
        if (!optional) {
          throw new Error(`PovinnĂ˝ soubor ${name} chybĂ­ nebo je neÄŤitelnĂ˝: ${error.message}`);
        }
        // Pokud je volitelnĂ˝ a chybĂ­, je to v poĹ™Ăˇdku
        expect(error.code).toBe('ENOENT');
      }
    });

    it('should check referential integrity of party_positions.json', () => {
      const parties: Party[] = JSON.parse(readFileSync(join(dataPath, 'parties.json'), 'utf-8'));
      const theses: Thesis[] = JSON.parse(readFileSync(join(dataPath, 'theses.json'), 'utf-8'));
      const positions: PartyPosition[] = JSON.parse(readFileSync(join(dataPath, 'party_positions.json'), 'utf-8'));

      const partyIds = new Set(parties.map(p => p.id));
      const thesisIds = new Set(theses.map(t => t.id));

      const errors: string[] = [];

      positions.forEach(pos => {
          if (!partyIds.has(pos.partyId)) {
              errors.push(`NeexistujĂ­cĂ­ partyId v party_positions.json: ${pos.partyId}`);
          }
          if (!thesisIds.has(pos.thesisId)) {
              errors.push(`NeexistujĂ­cĂ­ thesisId v party_positions.json: ${pos.thesisId}`);
          }
      });

      expect(errors).toEqual([]);
    });
  });
});

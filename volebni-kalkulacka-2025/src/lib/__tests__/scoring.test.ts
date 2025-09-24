import { describe, it, expect } from 'vitest';
import { calculateScores, applyRedLinePolicy, generateDetailedComparison } from '../scoring';
import type { UserAnswer } from '../scoring';
import { PartyPosition, Party } from '../types';
import { readFileSync } from 'fs';
import { join } from 'path';

// Testovací data
const mockParties: Party[] = [
  { id: 'party1', slug: 'strana-a', name: 'Strana A', shortName: 'SA' },
  { id: 'party2', slug: 'strana-b', name: 'Strana B', shortName: 'SB' },
  { id: 'party3', slug: 'strana-c', name: 'Strana C', shortName: 'SC' }
];

const mockPartyPositions: PartyPosition[] = [
  // Teze 1: Strana A = +2, Strana B = -2, Strana C = 0
  { partyId: 'party1', thesisId: 'thesis1', value: 2, confidence: 1.0 },
  { partyId: 'party2', thesisId: 'thesis1', value: -2, confidence: 0.8 },
  { partyId: 'party3', thesisId: 'thesis1', value: 0, confidence: 0.6 },
  
  // Teze 2: Strana A = -1, Strana B = +1, Strana C = +2
  { partyId: 'party1', thesisId: 'thesis2', value: -1, confidence: 0.9 },
  { partyId: 'party2', thesisId: 'thesis2', value: 1, confidence: 1.0 },
  { partyId: 'party3', thesisId: 'thesis2', value: 2, confidence: 0.7 },
];

describe('Scoring Engine', () => {
  describe('calculateScores', () => {
    it('should calculate correct scores for identical positions', () => {
      const userAnswers: Record<string, UserAnswer> = {
        thesis1: { thesisId: 'thesis1', value: 2, weight: 1 }, // Shoduje se se Stranou A
        thesis2: { thesisId: 'thesis2', value: -1, weight: 1 } // Shoduje se se Stranou A
      };

      const results = calculateScores(userAnswers, mockPartyPositions, mockParties);

      // Strana A by měla mít nejvyšší skóre (100% shoda)
      expect(results[0].partyId).toBe('party1');
      expect(results[0].agreementPercentage).toBe(100);
    });

    it('should calculate correct scores for opposite positions', () => {
      const userAnswers: Record<string, UserAnswer> = {
        thesis1: { thesisId: 'thesis1', value: -2, weight: 1 }, // Opak Strany A (+2)
        thesis2: { thesisId: 'thesis2', value: 1, weight: 1 }   // Opak Strany A (-1)
      };

      const results = calculateScores(userAnswers, mockPartyPositions, mockParties);

      // Strana A by měla mít nejnižší skóre
      const partyAResult = results.find(r => r.partyId === 'party1');
      expect(partyAResult?.agreementPercentage).toBeLessThan(50);
    });

    it('should handle weighted answers correctly', () => {
      const userAnswers: Record<string, UserAnswer> = {
        thesis1: { thesisId: 'thesis1', value: 2, weight: 3 }, // Vysoká důležitost
        thesis2: { thesisId: 'thesis2', value: -1, weight: 1 }  // Nízká důležitost
      };

      const results = calculateScores(userAnswers, mockPartyPositions, mockParties);

      // Strana A by měla stále vyhrát díky vysoké váze u thesis1
      expect(results[0].partyId).toBe('party1');
    });

    it('should handle missing party positions', () => {
      const limitedPositions: PartyPosition[] = [
        { partyId: 'party1', thesisId: 'thesis1', value: 2, confidence: 1.0 }
        // Chybí pozice pro thesis2
      ];

      const userAnswers: Record<string, UserAnswer> = {
        thesis1: { thesisId: 'thesis1', value: 2, weight: 1 },
        thesis2: { thesisId: 'thesis2', value: -1, weight: 1 }
      };

      const results = calculateScores(userAnswers, limitedPositions, mockParties);

      // Strana A by měla mít výsledek jen pro thesis1
      const partyAResult = results.find(r => r.partyId === 'party1');
      expect(partyAResult?.thesisResults).toHaveLength(1);
    });

    it('should sort results by agreement percentage', () => {
      const userAnswers: Record<string, UserAnswer> = {
        thesis1: { thesisId: 'thesis1', value: 0, weight: 1 }, // Nejblíže Straně C
        thesis2: { thesisId: 'thesis2', value: 1, weight: 1 }   // Nejblíže Straně B
      };

      const results = calculateScores(userAnswers, mockPartyPositions, mockParties);

      // Výsledky by měly být seřazené sestupně podle shody
      expect(results[0].agreementPercentage).toBeGreaterThanOrEqual(results[1].agreementPercentage);
      expect(results[1].agreementPercentage).toBeGreaterThanOrEqual(results[2].agreementPercentage);
    });
  });

  describe('applyRedLinePolicy', () => {
    it('should apply penalty for red-line disagreements', () => {
      const mockResults = [
        {
          partyId: 'party1',
          partyName: 'Strana A',
          totalScore: 8,
          maxPossibleScore: 8,
          agreementPercentage: 100,
          confidenceScore: 1.0,
          thesisResults: [
            {
              thesisId: 'thesis1',
              userValue: -2,
              partyValue: 2,
              difference: 4, // Velký nesouhlas
              weight: 1,
              confidence: 1.0,
              contribution: 0
            }
          ]
        }
      ];

      const penalizedResults = applyRedLinePolicy(mockResults, ['thesis1']);

      // Měla by být aplikována penalizace -20%
      expect(penalizedResults[0].agreementPercentage).toBe(80);
    });

    it('should not apply penalty when no red-line theses specified', () => {
      const mockResults = [
        {
          partyId: 'party1',
          partyName: 'Strana A',
          totalScore: 8,
          maxPossibleScore: 8,
          agreementPercentage: 100,
          confidenceScore: 1.0,
          thesisResults: []
        }
      ];

      const results = applyRedLinePolicy(mockResults, []);
      expect(results[0].agreementPercentage).toBe(100);
    });
  });

  describe('generateDetailedComparison', () => {
    it('should categorize agreements correctly', () => {
      const userAnswers: Record<string, UserAnswer> = {
        thesis1: { thesisId: 'thesis1', value: 2, weight: 1 },
        thesis2: { thesisId: 'thesis2', value: 0, weight: 1 }
      };

      const mockResult = {
        partyId: 'party1',
        partyName: 'Strana A',
        totalScore: 6,
        maxPossibleScore: 8,
        agreementPercentage: 75,
        confidenceScore: 0.95,
        thesisResults: [
          {
            thesisId: 'thesis1',
            userValue: 2,
            partyValue: 2,
            difference: 0, // Silná shoda
            weight: 1,
            confidence: 1.0,
            contribution: 1
          },
          {
            thesisId: 'thesis2',
            userValue: 0,
            partyValue: -2,
            difference: 2, // Částečný nesouhlas
            weight: 1,
            confidence: 0.9,
            contribution: 0.5
          }
        ]
      };

      const comparison = generateDetailedComparison(userAnswers, mockResult);

      expect(comparison.strongAgreements).toHaveLength(1);
      expect(comparison.partialAgreements).toHaveLength(1);
      expect(comparison.strongDisagreements).toHaveLength(0);
    });
  });

  // Test s reálnými daty z český voleb 2025
  describe('Real Data Integration Test', () => {
    it('should work with real Czech election data', () => {
      // Načteme reálná data ze souborů
      const partiesPath = join(process.cwd(), 'public', 'data', 'parties.json');
      const positionsPath = join(process.cwd(), 'public', 'data', 'party_positions.json');
      
      const realParties: Party[] = JSON.parse(readFileSync(partiesPath, 'utf8'));
      const realPositions: PartyPosition[] = JSON.parse(readFileSync(positionsPath, 'utf8'));

        // Simulujeme uživatele, který souhlasí s levicovými pozicemi
      const leftLeangingUser: Record<string, UserAnswer> = {
        thesis_001: { thesisId: 'thesis_001', value: 2, weight: 1 }, // Daně pro střední třídu - souhlas se snížením (paradoxně levicové)
        thesis_002: { thesisId: 'thesis_002', value: 2, weight: 1 }, // Státní investice - souhlas  
        thesis_003: { thesisId: 'thesis_003', value: 2, weight: 1 }, // Minimální mzda - souhlas s růstem
      };      const results = calculateScores(leftLeangingUser, realPositions, realParties);

      // Ověříme, že výsledky jsou logické
      expect(results).toBeDefined();
      expect(results.length).toBe(realParties.length);
      expect(results[0].agreementPercentage).toBeGreaterThan(0);
      
      // Najdeme Stačilo! a ANO (měly by být vysoko u levicového uživatele)
      const staciloResult = results.find(r => r.partyId === 'stacilo');
      const anoResult = results.find(r => r.partyId === 'ano');
      const odsResult = results.find(r => r.partyId === 'ods');
      
      expect(staciloResult).toBeDefined();
      expect(anoResult).toBeDefined();
      expect(odsResult).toBeDefined();

      // Stačilo! a ANO by měly být výše než ODS u levicového uživatele
      if (staciloResult && anoResult && odsResult) {
        expect(staciloResult.agreementPercentage).toBeGreaterThan(odsResult.agreementPercentage);
        expect(anoResult.agreementPercentage).toBeGreaterThan(odsResult.agreementPercentage);
      }
    });
  });
});
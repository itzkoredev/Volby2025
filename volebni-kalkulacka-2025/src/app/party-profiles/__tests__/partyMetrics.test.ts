import { describe, expect, it } from 'vitest';

import { calculatePartyMetrics, computePositionDepthScore, calculateRecencyScore } from '../metrics';
import type { PartyPosition, Thesis } from '@/lib/types';

describe('party metrics engagement scoring', () => {
  const baseTheses: Thesis[] = [
    {
      id: 't1',
      issueId: 'economy',
      text: 'Teze 1',
      scaleMin: -2,
      scaleMax: 2,
      order: 0,
      isActive: true,
    },
    {
      id: 't2',
      issueId: 'economy',
      text: 'Teze 2',
      scaleMin: -2,
      scaleMax: 2,
      order: 1,
      isActive: true,
    },
    {
      id: 't3',
      issueId: 'migration',
      text: 'Teze 3',
      scaleMin: -2,
      scaleMax: 2,
      order: 2,
      isActive: true,
    },
  ];

  it('favours topics with deeper, fresher coverage when computing engagement', () => {
    const recent = new Date();
    const stale = new Date('2022-01-01T00:00:00Z');

    const positions: PartyPosition[] = [
      {
        partyId: 'party-a',
        thesisId: 't1',
        value: 1,
        confidence: 0.9,
        justification: ' '.repeat(10) + 'Podrobné odůvodnění '.repeat(15),
        details: {
          arguments: ['Argument 1', 'Argument 2'],
          relatedVotes: [
            {
              name: 'Hlasování A',
              url: 'https://example.com/a',
              result: 'pro',
            },
          ],
        },
        source: {
          url: 'https://example.com/program',
          date: recent.toISOString(),
          type: 'program',
          title: 'Program',
        },
        lastUpdated: recent.toISOString(),
      },
      {
        partyId: 'party-a',
        thesisId: 't2',
        value: -1,
        confidence: 0.85,
        justification: 'Rozšířená argumentace '.repeat(12),
        details: {
          arguments: ['Argument 3'],
          quotes: [
            {
              text: 'Citace',
              author: 'Autor',
            },
          ],
        },
        source: {
          url: 'https://example.com/program-2',
          date: recent.toISOString(),
          type: 'program',
          title: 'Program 2',
        },
        lastUpdated: recent.toISOString(),
      },
      {
        partyId: 'party-a',
        thesisId: 't3',
        value: 0,
        confidence: 0.4,
        justification: 'Krátké vyjádření',
        source: {
          url: 'https://example.com/old',
          date: stale.toISOString(),
          type: 'rozhovor',
          title: 'Rozhovor',
        },
        lastUpdated: stale.toISOString(),
      },
    ];

    const metrics = calculatePartyMetrics(positions, baseTheses);
    const partyMetrics = metrics['party-a'];

    expect(partyMetrics).toBeDefined();
    expect(partyMetrics.topIssues.length).toBeGreaterThan(0);

    const economy = partyMetrics.topIssues.find(issue => issue.issueId === 'economy');
    const migration = partyMetrics.topIssues.find(issue => issue.issueId === 'migration');

    expect(economy).toBeDefined();
    expect(migration).toBeDefined();

    expect(economy!.engagementScore).toBeGreaterThan(migration!.engagementScore);
    expect(economy!.depthScore).toBeGreaterThan(migration!.depthScore);
    expect(economy!.recencyScore).toBeGreaterThan(migration!.recencyScore);
    expect(economy!.coverage).toBeCloseTo(1, 2);
  });

  it('keeps depth score within bounds based on justification and evidence', () => {
    const position: PartyPosition = {
      partyId: 'party-b',
      thesisId: 't1',
      value: 2,
      confidence: 1,
      justification: 'Detailní analýza '.repeat(25),
      details: {
        arguments: ['a', 'b', 'c', 'd'],
        quotes: [
          {
            text: 'Citace',
            author: 'Autor',
          },
        ],
        relatedVotes: [
          {
            name: 'Hlasování B',
            url: 'https://example.com/b',
            result: 'pro',
          },
        ],
      },
      source: {
        url: 'https://example.com/detail',
        date: new Date().toISOString(),
        type: 'program',
        title: 'Detail',
      },
      lastUpdated: new Date().toISOString(),
    };

    const depth = computePositionDepthScore(position);
  expect(depth).toBeGreaterThan(0.6);
    expect(depth).toBeLessThanOrEqual(1);
  });

  it('decreases recency score for older timestamps', () => {
    const now = Date.now();
    const fresh = now - 30 * 24 * 60 * 60 * 1000;
    const older = now - 600 * 24 * 60 * 60 * 1000;

    expect(calculateRecencyScore(fresh)).toBeGreaterThan(calculateRecencyScore(older));
    expect(calculateRecencyScore()).toBe(0.4);
  });
});

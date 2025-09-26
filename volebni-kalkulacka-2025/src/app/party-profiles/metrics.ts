import { PartyPosition, Thesis } from '@/lib/types';

export interface PartyMetricsIssue {
  issueId: string;
  count: number;
  avgValue: number;
  avgConfidence: number;
  coverage: number;
  depthScore: number;
  recencyScore: number;
  engagementScore: number;
}

export interface PartyMetrics {
  positionCount: number;
  avgConfidence: number;
  coverageRatio: number;
  avgValue: number;
  positiveShare: number;
  negativeShare: number;
  neutralShare: number;
  topIssues: PartyMetricsIssue[];
  latestUpdate?: string;
}

export function computePositionDepthScore(position: PartyPosition): number {
  const justificationWords = position.justification
    ? position.justification.trim().split(/\s+/).filter(Boolean).length
    : 0;
  const justificationScore = Math.min(justificationWords / 120, 1);

  const details = position.details;
  const argumentsCount = details?.arguments?.length ?? 0;
  const quotesCount = details?.quotes?.length ?? 0;
  const votesCount = details?.relatedVotes?.length ?? 0;
  const evidenceUnits = argumentsCount + quotesCount + votesCount;
  const evidenceScore = Math.min(evidenceUnits / 4, 1);

  return Math.min(0.6 * justificationScore + 0.4 * evidenceScore, 1);
}

export function calculateRecencyScore(timestamp?: number): number {
  if (!timestamp) {
    return 0.4;
  }

  const now = Date.now();
  const diffDays = Math.abs(now - timestamp) / (1000 * 60 * 60 * 24);

  if (diffDays <= 90) return 1;
  if (diffDays <= 180) return 0.85;
  if (diffDays <= 365) return 0.7;
  if (diffDays <= 540) return 0.55;
  if (diffDays <= 720) return 0.45;
  return 0.3;
}

export function calculatePartyMetrics(
  positions: PartyPosition[],
  theses: Thesis[],
): Record<string, PartyMetrics> {
  const thesisById = new Map(theses.map((thesis) => [thesis.id, thesis]));
  const totalTheses = Math.max(theses.length, 1);
  const issueThesisCounts = theses.reduce<Record<string, number>>((acc, thesis) => {
    acc[thesis.issueId] = (acc[thesis.issueId] ?? 0) + 1;
    return acc;
  }, {});

  type IssueAccumulator = {
    count: number;
    totalValue: number;
    totalConfidence: number;
    detailScoreTotal: number;
    latestTimestamp?: number;
  };

  type MetricsAccumulator = {
    positionCount: number;
    totalConfidence: number;
    totalValue: number;
    positive: number;
    negative: number;
    neutral: number;
    issues: Record<string, IssueAccumulator>;
    latestTimestamp?: number;
  };

  const accumulator: Record<string, MetricsAccumulator> = {};

  positions.forEach((position) => {
    const thesis = thesisById.get(position.thesisId);
    if (!thesis) return;

    const entry = accumulator[position.partyId] ??= {
      positionCount: 0,
      totalConfidence: 0,
      totalValue: 0,
      positive: 0,
      negative: 0,
      neutral: 0,
      issues: {},
      latestTimestamp: undefined,
    };

    entry.positionCount += 1;
    entry.totalConfidence += position.confidence;
    entry.totalValue += position.value;

    if (position.value > 0) {
      entry.positive += 1;
    } else if (position.value < 0) {
      entry.negative += 1;
    } else {
      entry.neutral += 1;
    }

    const issueId = thesis.issueId;
    const issueEntry = entry.issues[issueId] ??= {
      count: 0,
      totalValue: 0,
      totalConfidence: 0,
      detailScoreTotal: 0,
      latestTimestamp: undefined,
    };
    issueEntry.count += 1;
    issueEntry.totalValue += position.value;
    issueEntry.totalConfidence += position.confidence;
    issueEntry.detailScoreTotal += computePositionDepthScore(position);

    const latestDate = position.lastUpdated || position.source?.date;
    if (latestDate) {
      const timestamp = new Date(latestDate).getTime();
      if (!Number.isNaN(timestamp)) {
        entry.latestTimestamp = entry.latestTimestamp ? Math.max(entry.latestTimestamp, timestamp) : timestamp;
        issueEntry.latestTimestamp = issueEntry.latestTimestamp ? Math.max(issueEntry.latestTimestamp, timestamp) : timestamp;
      }
    }
  });

  const metrics: Record<string, PartyMetrics> = {};

  Object.entries(accumulator).forEach(([partyId, value]) => {
    const { positionCount } = value;
    const coverageRatio = positionCount / totalTheses;
    const topIssues = Object.entries(value.issues)
      .map(([issueId, stats]) => {
        const issueThesisTotal = issueThesisCounts[issueId] ?? totalTheses;
        const avgConfidence = stats.totalConfidence / Math.max(stats.count, 1);
        const avgValue = stats.totalValue / Math.max(stats.count, 1);
        const avgDepth = stats.detailScoreTotal / Math.max(stats.count, 1);
        const coverage = Math.min(stats.count / Math.max(issueThesisTotal, 1), 1);
        const recencyScore = calculateRecencyScore(stats.latestTimestamp);

        const weightCoverage = 0.45;
        const weightDepth = 0.25;
        const weightConfidence = 0.2;
        const weightRecency = 0.1;
        const totalWeight = weightCoverage + weightDepth + weightConfidence + weightRecency;
        const engagementIndex =
          coverage * weightCoverage +
          avgDepth * weightDepth +
          avgConfidence * weightConfidence +
          recencyScore * weightRecency;

        const engagementScore = Number(((engagementIndex / totalWeight) * 100).toFixed(1));

        return {
          issueId,
          count: stats.count,
          avgValue,
          avgConfidence,
          coverage,
          depthScore: avgDepth,
          recencyScore,
          engagementScore,
        } satisfies PartyMetricsIssue;
      })
      .sort((a, b) => b.engagementScore - a.engagementScore || b.count - a.count || Math.abs(b.avgValue) - Math.abs(a.avgValue));

    metrics[partyId] = {
      positionCount,
      avgConfidence: positionCount ? value.totalConfidence / positionCount : 0,
      coverageRatio,
      avgValue: positionCount ? value.totalValue / positionCount : 0,
      positiveShare: positionCount ? value.positive / positionCount : 0,
      negativeShare: positionCount ? value.negative / positionCount : 0,
      neutralShare: positionCount ? value.neutral / positionCount : 0,
      topIssues,
      latestUpdate: value.latestTimestamp ? new Date(value.latestTimestamp).toISOString() : undefined,
    } satisfies PartyMetrics;
  });

  return metrics;
}

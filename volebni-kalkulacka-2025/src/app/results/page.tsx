'use client';

import type { ReactNode } from 'react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  CheckCircle,
  XCircle,
  ExternalLink,
  BookOpen,
  BarChart3,
  Target,
  AlertTriangle,
  Info,
  Lightbulb,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { calculateScores, generateDetailedComparison, type ScoreResult, type ThesisResult } from '@/lib/scoring';
import { withBasePath } from '@/lib/utils';
import type { Issue, Party, PartyPosition, Thesis, UserAnswer } from '@/lib/types';

import { knowledgeBase } from '@shared/knowledge-base/entries';
import { getPartyKnowledgeId } from '@shared/knowledge-base/mappings';
import type { KnowledgeEntry } from '@shared/knowledge-base/types';

const knowledgeById = new Map(knowledgeBase.map((entry) => [entry.id, entry]));

async function loadData(): Promise<{
  parties: Party[];
  positions: PartyPosition[];
  theses: Thesis[];
  issues: Issue[];
}> {
  const [partiesRes, positionsRes, thesesRes, issuesRes] = await Promise.all([
    fetch(withBasePath('/data/parties.json')),
    fetch(withBasePath('/data/party_positions.json')),
    fetch(withBasePath('/data/theses.json')),
    fetch(withBasePath('/data/issues.json')),
  ]);

  if (![partiesRes, positionsRes, thesesRes, issuesRes].every((response) => response.ok)) {
    throw new Error('Nepodařilo se načíst potřebná data pro zobrazení výsledků.');
  }

  return {
    parties: await partiesRes.json(),
    positions: await positionsRes.json(),
    theses: await thesesRes.json(),
    issues: await issuesRes.json(),
  };
}

interface IssueInsight {
  issueId: string;
  title: string;
  description?: string;
  alignment: number;
  avgConfidence: number;
  count: number;
}

function getCoverageBadgeClass(value: number): string {
  if (value >= 80) {
    return 'border-emerald-500 bg-emerald-50 text-emerald-700';
  }

  if (value >= 50) {
    return 'border-amber-500 bg-amber-50 text-amber-700';
  }

  return 'border-rose-500 bg-rose-50 text-rose-700';
}

function getConfidenceBadgeClass(value: number): string {
  if (value >= 80) {
    return 'border-sky-500 bg-sky-50 text-sky-700';
  }

  if (value >= 60) {
    return 'border-amber-500 bg-amber-50 text-amber-700';
  }

  return 'border-slate-300 bg-slate-100 text-slate-700';
}

function formatPercent(value: number, fractionDigits = 0): string {
  return `${value.toFixed(fractionDigits)}%`;
}

function buildIssueInsights(
  result: ScoreResult,
  thesisMap: Map<string, Thesis>,
  issueMap: Map<string, Issue>
): IssueInsight[] {
  const accumulator = new Map<
    string,
    { totalWeight: number; totalContribution: number; confidenceSum: number; count: number }
  >();

  result.thesisResults.forEach((thesisResult) => {
    const thesis = thesisMap.get(thesisResult.thesisId);
    if (!thesis) {
      return;
    }

    const issueId = thesis.issueId ?? 'ostatni';
    const entry = accumulator.get(issueId) ?? {
      totalWeight: 0,
      totalContribution: 0,
      confidenceSum: 0,
      count: 0,
    };

    entry.totalWeight += thesisResult.weight;
    entry.totalContribution += thesisResult.contribution;
    entry.confidenceSum += thesisResult.confidence;
    entry.count += 1;

    accumulator.set(issueId, entry);
  });

  return Array.from(accumulator.entries())
    .map(([issueId, details]) => {
      const issue = issueMap.get(issueId);
      const alignment = details.totalWeight > 0 ? details.totalContribution / details.totalWeight : 0;
      const avgConfidence = details.count > 0 ? details.confidenceSum / details.count : 0;

      return {
        issueId,
        title: issue?.title ?? issueId,
        description: issue?.description,
        alignment: Math.min(1, Math.max(0, alignment)),
        avgConfidence,
        count: details.count,
      } satisfies IssueInsight;
    })
    .sort((a, b) => b.count - a.count || b.alignment - a.alignment);
}

function getKnowledgeEntryForParty(partyId: string): KnowledgeEntry | undefined {
  const knowledgeId = getPartyKnowledgeId(partyId);
  return knowledgeId ? knowledgeById.get(knowledgeId) : undefined;
}

function ResultsContent(): JSX.Element {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<ScoreResult[]>([]);
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const answersParam = searchParams.get('answers');

    if (!answersParam) {
      setError('Chybí data odpovědí pro výpočet výsledků.');
      setLoading(false);
      return;
    }

    let parsedAnswers: Record<string, UserAnswer>;

    try {
      parsedAnswers = JSON.parse(answersParam);
    } catch (parseError) {
      setError('Zadané odpovědi se nepodařilo zpracovat. Zkuste test vyplnit znovu.');
      setLoading(false);
      return;
    }

    setLoading(true);
    loadData()
      .then(({ parties, positions, theses: thesesData, issues: issuesData }) => {
        const scoreResults = calculateScores(parsedAnswers, positions, parties);

        setResults(scoreResults);
        setTheses(thesesData);
        setIssues(issuesData);
        setUserAnswers(parsedAnswers);
      })
      .catch((loadError: unknown) => {
        const message =
          loadError instanceof Error
            ? loadError.message
            : 'Nepodařilo se načíst výsledky. Zkuste to prosím znovu.';
        setError(message);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  const thesisMap = useMemo(() => new Map(theses.map((thesis) => [thesis.id, thesis])), [theses]);
  const issueMap = useMemo(() => new Map(issues.map((issue) => [issue.id, issue])), [issues]);

  const totalAsked = useMemo(() => Object.keys(userAnswers).length, [userAnswers]);
  const answeredCount = useMemo(
    () => Object.values(userAnswers).filter((answer) => answer.weight > 0).length,
    [userAnswers]
  );
  const skippedCount = totalAsked - answeredCount;

  const mainResults = useMemo(() => results.filter((result) => result.partyCategory === 'main'), [results]);
  const secondaryResults = useMemo(
    () => results.filter((result) => result.partyCategory !== 'main'),
    [results]
  );
  const prioritizedResults = useMemo(() => {
    if (mainResults.length === 0) {
      return results;
    }
    return [...mainResults, ...secondaryResults];
  }, [mainResults, secondaryResults, results]);

  const topResult = prioritizedResults[0] ?? null;

  const insights = useMemo(() => {
    if (!topResult) {
      return [];
    }
    return buildIssueInsights(topResult, thesisMap, issueMap);
  }, [topResult, thesisMap, issueMap]);

  const bestIssues = insights.filter((insight) => insight.alignment >= 0.6 && insight.avgConfidence >= 60);

  const watchIssues = insights.filter((insight) => insight.alignment <= -0.6 && insight.avgConfidence >= 60);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
        <div>
          <p className="font-medium text-slate-800">Počítám vaše výsledky…</p>
          <p className="text-sm text-slate-500">Získávám postoje stran a porovnávám je s vašimi odpověďmi.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <AlertTriangle className="h-10 w-10 text-amber-500" />
        <div>
          <p className="font-semibold text-slate-800">Výsledky se nepodařilo načíst</p>
          <p className="text-sm text-slate-500">{error}</p>
        </div>
        <Link href="/calculator-setup">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na začátek testu
          </Button>
        </Link>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
        <Info className="h-10 w-10 text-slate-400" />
        <div>
          <p className="font-semibold text-slate-800">Zatím zde nemáme žádné výsledky</p>
          <p className="text-sm text-slate-500">
            Zdá se, že odpovědi nebyly odeslány. Zkuste prosím vyplnit test znovu.
          </p>
        </div>
        <Link href="/calculator-setup">
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            Spustit volební kalkulačku
          </Button>
        </Link>
      </div>
    );
  }

  const ensuredTopResult = (topResult ?? prioritizedResults[0] ?? results[0])!;

  return (
    <div className="container mx-auto max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Vaše výsledky</h1>
        <p className="mt-2 text-base text-slate-600">
          Kompletní přehled toho, se kterými stranami se shodujete a kde se naopak vaše postoje rozcházejí.
        </p>
      </div>

      <OverviewCard
        topResult={ensuredTopResult}
        results={prioritizedResults}
        secondaryResults={secondaryResults}
        answeredCount={answeredCount}
        skippedCount={skippedCount}
        totalAsked={totalAsked}
        thesisMap={thesisMap}
        issueMap={issueMap}
      />

      <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-white/90 p-4 text-sm text-slate-600">
        <Info className="mt-0.5 h-5 w-5 text-slate-500" />
        <span>
          Shoda vychází z vašich odpovědí a zveřejněných postojů stran. Čím vyšší pokrytí zodpovězených tezí,
          tím přesnější doporučení.
        </span>
      </div>

      <div className="mt-8 space-y-6">
        {prioritizedResults.map((result, index) => (
          <ResultCard
            key={result.partyId}
            result={result}
            isTopResult={index === 0}
            knowledgeEntry={getKnowledgeEntryForParty(result.partyId)}
            thesisMap={thesisMap}
            issuesMap={issueMap}
            userAnswers={userAnswers}
            totalUserAnswered={answeredCount}
          />
        ))}
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-3 text-center">
        <Link href="/calculator-setup">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zpět na úvod kalkulačky
          </Button>
        </Link>
        <Link href="/calculator">
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            Upravit odpovědi
          </Button>
        </Link>
      </div>
    </div>
  );
}

interface OverviewCardProps {
  topResult: ScoreResult;
  results: ScoreResult[];
  secondaryResults: ScoreResult[];
  answeredCount: number;
  skippedCount: number;
  totalAsked: number;
  thesisMap: Map<string, Thesis>;
  issueMap: Map<string, Issue>;
}

function OverviewCard({ topResult, results, secondaryResults, answeredCount, skippedCount, totalAsked, thesisMap, issueMap }: OverviewCardProps) {
  const mainRunnerUps = results.filter((result) => result.partyCategory === 'main').slice(1, 3);
  const alternativeSuggestions = secondaryResults
    .filter((party) => party.partyId !== topResult.partyId)
    .slice(0, 3);
  const top3 = results.slice(0, Math.min(3, results.length));
  const averageTop3 =
    top3.reduce((sum, item) => sum + item.agreementPercentage, 0) / Math.max(1, top3.length);

  const coverageDisplay = Math.round(topResult.coveragePercentage);
  const confidenceDisplay = Math.round(topResult.confidenceScore * 100);

  // Calculate issue insights from the top result
  const insights = buildIssueInsights(topResult, thesisMap, issueMap);
  
  // Filter insights into strong agreement and areas to watch
  const bestIssues = insights.filter(insight => insight.alignment >= 0.6 && insight.avgConfidence >= 60);
  const watchIssues = insights.filter(insight => insight.alignment <= -0.6 && insight.avgConfidence >= 60);

  return (
    <Card className="border-0 bg-white/95 shadow-xl">
      <CardHeader className="space-y-3 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3 text-indigo-600">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Shrnutí</p>
            <h2 className="text-lg font-semibold text-slate-900">Nejbližší shoda: {topResult.partyName}</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={`text-sm ${getCoverageBadgeClass(coverageDisplay)}`}>
            Pokrytí odpovědí {coverageDisplay}%
          </Badge>
          <Badge variant="outline" className={`text-sm ${getConfidenceBadgeClass(confidenceDisplay)}`}>
            Důvěra dat {confidenceDisplay}%
          </Badge>
          <Badge variant="outline" className="border-slate-200 bg-slate-100 text-slate-700">
            Odpovězeno {answeredCount} z {totalAsked} otázek
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div>
            <p className="text-sm text-slate-600">
              Nejvyšší shodu máte se stranou <span className="font-semibold text-slate-900">{topResult.partyName}</span>.
              Shoda vychází na <span className="font-semibold text-slate-900">{Math.round(topResult.agreementPercentage)} %</span>
              a strana pokrývá {formatPercent(topResult.coveragePercentage)} vašich odpovědí.
            </p>
            <div className="mt-4 flex items-start gap-3 rounded-lg bg-emerald-50/70 p-4 text-sm text-emerald-800">
              <Lightbulb className="mt-0.5 h-5 w-5" />
              <span>
                Pokuste se projít i témata, kde je shoda nižší. Často právě tam objevíte zásadní programové rozdíly mezi
                stranami.
              </span>
            </div>
          </div>
          <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-700">Další favorité</p>
              <ul className="mt-2 space-y-2 text-sm text-slate-600">
                {mainRunnerUps.length > 0 ? (
                  mainRunnerUps.map((party) => (
                    <li key={party.partyId} className="flex items-center justify-between rounded-md bg-white p-2 shadow-sm">
                      <span className="font-medium text-slate-800">{party.partyName}</span>
                      <span className="flex items-center gap-2 text-sm text-slate-600">
                        {Math.round(party.agreementPercentage)}%
                        <Badge variant="outline" className={`text-xs ${getCoverageBadgeClass(Math.round(party.coveragePercentage))}`}>
                          {Math.round(party.coveragePercentage)}% pokrytí
                        </Badge>
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="rounded-md bg-white p-3 text-xs text-slate-500 shadow-sm">
                    Při vašich odpovědích se žádná další hlavní strana výrazně nepřibližuje top výsledku.
                  </li>
                )}
              </ul>
            </div>

            {alternativeSuggestions.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3">
                <p className="text-sm font-semibold text-amber-700">Alternativní volby</p>
                <ul className="mt-2 space-y-2 text-sm text-amber-700">
                  {alternativeSuggestions.map((party) => (
                    <li key={party.partyId} className="flex items-center justify-between rounded-md bg-white/90 p-2 shadow-sm">
                      <span className="font-medium text-amber-800">{party.partyName}</span>
                      <span className="flex items-center gap-2 text-sm">
                        {Math.round(party.agreementPercentage)}%
                        <Badge variant="outline" className="text-xs border-amber-200 bg-amber-100 text-amber-700">
                          {Math.round(party.coveragePercentage)}% pokrytí
                        </Badge>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-amber-700">
                  Menší nebo novější strany, které stojí za zvážení jako doplňkové možnosti.
                </p>
              </div>
            )}
          </div>
        </div>

        {insights.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <CheckCircle className="h-4 w-4" /> Silná témata shody
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {bestIssues.length > 0 ? (
                  bestIssues.map((issue) => (
                    <Badge
                      key={issue.issueId}
                      variant="secondary"
                      className="border border-emerald-200 bg-white text-emerald-700 shadow-sm"
                    >
                      <span className="font-medium">{issue.title}</span>
                      <span className="ml-2 text-xs text-emerald-500">
                        {Math.round(issue.alignment * 100)}%
                      </span>
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-emerald-700">
                    Strana nemá výrazné oblasti shody, doporučujeme prozkoumat detailní rozbory.
                  </p>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-rose-100 bg-rose-50/70 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-rose-700">
                <AlertTriangle className="h-4 w-4" /> Témata k ověření
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {watchIssues.length > 0 ? (
                  watchIssues.map((issue) => (
                    <Badge
                      key={issue.issueId}
                      variant="outline"
                      className="border border-rose-200 bg-white text-rose-700"
                    >
                      <span className="font-medium">{issue.title}</span>
                      <span className="ml-2 text-xs text-rose-500">
                        {Math.round(issue.alignment * 100)}%
                      </span>
                    </Badge>
                  ))
                ) : (
                  <p className="text-xs text-rose-700">
                    Bez výrazných rozporů, ale sledujte témata s nižším pokrytím.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <MetricCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="Průměr top 3"
            description="Průměrná shoda tří nejbližších stran"
            value={formatPercent(averageTop3, 1)}
          />
          <MetricCard
            icon={<Target className="h-5 w-5" />}
            title="Pokrytí otázek"
            description="Kolik odpovědí strany dokázaly porovnat"
            value={formatPercent(topResult.coveragePercentage, 0)}
          />
          <MetricCard
            icon={<AlertTriangle className="h-5 w-5" />}
            title="Přeskočené otázky"
            description="Otázky bez váhy se do výsledku nepočítají"
            value={`${Math.max(skippedCount, 0)} otáz${skippedCount === 1 ? 'ka' : skippedCount >= 2 && skippedCount <= 4 ? 'ky' : 'ek'}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  value: string;
}

function MetricCard({ icon, title, description, value }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-indigo-600">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
          {icon}
        </div>
        <span className="text-sm font-semibold text-slate-800">{title}</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

interface ResultCardProps {
  result: ScoreResult;
  isTopResult: boolean;
  knowledgeEntry?: KnowledgeEntry;
  thesisMap: Map<string, Thesis>;
  issuesMap: Map<string, Issue>;
  userAnswers: Record<string, UserAnswer>;
  totalUserAnswered: number;
}

function ResultCard({
  result,
  isTopResult,
  knowledgeEntry,
  thesisMap,
  issuesMap,
  userAnswers,
  totalUserAnswered,
}: ResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(isTopResult);
  const isAlternative = result.partyCategory !== 'main';

  const comparison = useMemo(
    () => generateDetailedComparison(userAnswers, result),
    [userAnswers, result]
  );

  const issueInsights = useMemo(
    () => buildIssueInsights(result, thesisMap, issuesMap),
    [result, thesisMap, issuesMap]
  );

  const bestIssues = issueInsights.filter((issue) => issue.alignment >= 0.65).slice(0, 3);
  const frictionIssues = issueInsights.filter((issue) => issue.alignment <= 0.4).slice(0, 3);

  const coverageDisplay = Math.round(result.coveragePercentage);
  const confidenceDisplay = Math.round(result.confidenceScore * 100);
  const agreementDisplay = Math.round(result.agreementPercentage);
  const answeredForParty = result.thesisResults.length;

  const toggleExpanded = () => setIsExpanded((prev) => !prev);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className={`overflow-hidden border ${isTopResult ? 'border-indigo-200 shadow-2xl' : 'border-slate-200 shadow-lg'}`}>
        <CardHeader
          role="button"
          tabIndex={0}
          onClick={toggleExpanded}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              toggleExpanded();
            }
          }}
          className="space-y-4 bg-gradient-to-r from-white via-white to-slate-50 px-6 py-6"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold ${isTopResult ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}>
                {agreementDisplay}%
              </div>
              <div>
                <CardTitle className="text-2xl font-semibold text-slate-900">{result.partyName}</CardTitle>
                <p className="mt-1 text-sm text-slate-500">Celková shoda s vašimi odpověďmi</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {isAlternative ? (
                    <Badge variant="outline" className="border-amber-300 bg-amber-100 text-amber-700">
                      Alternativní doporučení
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700">
                      Hlavní strana
                    </Badge>
                  )}
                  <Badge variant="outline" className={getCoverageBadgeClass(coverageDisplay)}>
                    Pokrytí {coverageDisplay}%
                  </Badge>
                  <Badge variant="outline" className={getConfidenceBadgeClass(confidenceDisplay)}>
                    Důvěra dat {confidenceDisplay}%
                  </Badge>
                  <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">
                    {answeredForParty} z {totalUserAnswered} odpovědí porovnáno
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 text-sm text-slate-500 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-slate-600">
                <Progress value={result.agreementPercentage} className="h-2 w-36 bg-slate-200" />
                <span>{agreementDisplay}%</span>
              </div>
              <span className="hidden text-xs text-slate-400 sm:block">Kliknutím zobrazíte detailní rozbor</span>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-6 bg-white/95 px-6 py-6">
            {knowledgeEntry && <KnowledgePanel entry={knowledgeEntry} />}

            <div className="grid gap-6 lg:grid-cols-2">
              <IssueHighlights
                partyName={result.partyName}
                bestIssues={bestIssues}
                frictionIssues={frictionIssues}
              />
              <ComparisonLists
                partyId={result.partyId}
                partyName={result.partyName}
                comparison={comparison}
                thesisMap={thesisMap}
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href={`/party-profiles?party=${result.partyId}`}>
                <Button>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Zobrazit detailní profil {result.partyName}
                </Button>
              </Link>
              <Link href={`/results?answers=${encodeURIComponent(JSON.stringify(userAnswers))}#${result.partyId}`}>
                <Button variant="outline">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Sdílet tento výsledek
                </Button>
              </Link>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

function KnowledgePanel({ entry }: { entry: KnowledgeEntry }) {
  return (
    <div className="rounded-xl border border-indigo-100 bg-white/90 p-5 shadow-sm">
      <div className="flex items-center gap-3 text-indigo-600">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Znalostní báze</p>
          <p className="text-xs text-slate-500">Ověřená fakta o straně</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-700">{entry.summary}</p>
      {entry.highlights?.length ? (
        <ul className="mt-4 space-y-2">
          {entry.highlights.slice(0, 3).map((highlight, index) => (
            <li key={`${entry.id}-${index}`} className="flex items-start gap-3 text-sm text-slate-600">
              <span className="mt-0.5 inline-flex min-w-[68px] justify-center rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700">
                {(highlight.emphasis ?? 'info').toUpperCase()}
              </span>
              <span>{highlight.bullet}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {entry.sources?.[0] && (
        <a
          href={entry.sources[0].url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          Zdroj: {entry.sources[0].label}
          <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

interface IssueHighlightsProps {
  partyName: string;
  bestIssues: IssueInsight[];
  frictionIssues: IssueInsight[];
}

function IssueHighlights({ partyName, bestIssues, frictionIssues }: IssueHighlightsProps) {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        <Target className="h-4 w-4" /> Tematické souznění
      </h3>
      <div className="space-y-4">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-4">
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-sm font-semibold">Kde si nejvíc rozumíte</span>
            <CheckCircle className="h-4 w-4" />
          </div>
          <div className="mt-3 space-y-3">
            {bestIssues.length > 0 ? (
              bestIssues.map((issue) => (
                <IssueInsightRow key={issue.issueId} issue={issue} intent="positive" />
              ))
            ) : (
              <p className="text-xs text-emerald-700">
                Zatím nemáme dostatek údajů, abychom vyzdvihli konkrétní téma se shodou.
              </p>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-rose-100 bg-rose-50/70 p-4">
          <div className="flex items-center justify-between text-rose-700">
            <span className="text-sm font-semibold">Pozor na rozpory</span>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div className="mt-3 space-y-3">
            {frictionIssues.length > 0 ? (
              frictionIssues.map((issue) => (
                <IssueInsightRow key={issue.issueId} issue={issue} intent="negative" />
              ))
            ) : (
              <p className="text-xs text-rose-700">
                Nenašli jsme výrazné rozpory, ale doporučujeme podívat se na podrobnosti nižší shody.
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-500">
          {partyName} se nejvíce věnuje tématům s vyšším počtem postojů. Nízký počet podkladů může znamenat, že strana
          dané téma detailně nerozpracovala.
        </p>
      </div>
    </div>
  );
}

function IssueInsightRow({
  issue,
  intent,
}: {
  issue: IssueInsight;
  intent: 'positive' | 'negative';
}) {
  const alignmentPercent = Math.round(issue.alignment * 100);
  const confidencePercent = Math.round(issue.avgConfidence * 100);

  const progressClass = intent === 'positive' ? 'bg-emerald-200' : 'bg-rose-200';
  const barClass = intent === 'positive' ? 'bg-emerald-500' : 'bg-rose-500';

  return (
    <div className="rounded-lg bg-white/90 p-3 shadow-sm">
      <div className="flex items-center justify-between text-sm font-medium text-slate-800">
        <span>{issue.title}</span>
        <span className={intent === 'positive' ? 'text-emerald-600' : 'text-rose-600'}>{alignmentPercent}%</span>
      </div>
      <div className={`mt-2 h-2 w-full overflow-hidden rounded-full ${progressClass}`}>
        <div className={`h-2 rounded-full ${barClass}`} style={{ width: `${alignmentPercent}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
        <span>{issue.count} tezí</span>
        <span>Důvěra dat {confidencePercent}%</span>
      </div>
      {issue.description && <p className="mt-2 text-xs text-slate-500">{issue.description}</p>}
    </div>
  );
}

interface ComparisonListsProps {
  partyId: string;
  partyName: string;
  comparison: ReturnType<typeof generateDetailedComparison>;
  thesisMap: Map<string, Thesis>;
}

function ComparisonLists({ partyId, partyName, comparison, thesisMap }: ComparisonListsProps) {
  return (
    <div className="space-y-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        <BarChart3 className="h-4 w-4" /> Detailní rozbory otázek
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <ComparisonGroup
          title="Silné shody"
          icon={<CheckCircle className="h-4 w-4" />}
          colorClass="text-emerald-700"
          items={comparison.strongAgreements.slice(0, 3)}
          emptyText="Nenalezli jsme žádné výrazné shody."
          partyId={partyId}
          partyName={partyName}
          thesisMap={thesisMap}
        />
        <ComparisonGroup
          title="Výrazné rozdíly"
          icon={<XCircle className="h-4 w-4" />}
          colorClass="text-rose-700"
          items={comparison.strongDisagreements.slice(0, 3)}
          emptyText="Nenašli jsme zásadní neshody."
          partyId={partyId}
          partyName={partyName}
          thesisMap={thesisMap}
        />
      </div>
      {comparison.partialAgreements.length > 0 && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          <p>
            V několika tématech ({comparison.partialAgreements.length}) se vaše postoje a postoje strany částečně
            překrývají, ale nejsou zcela totožné. Doporučujeme projít si je detailně v profilu strany.
          </p>
        </div>
      )}
    </div>
  );
}

interface ComparisonGroupProps {
  title: string;
  icon: ReactNode;
  colorClass: string;
  items: ThesisResult[];
  emptyText: string;
  partyId: string;
  partyName: string;
  thesisMap: Map<string, Thesis>;
}

function ComparisonGroup({
  title,
  icon,
  colorClass,
  items,
  emptyText,
  partyId,
  partyName,
  thesisMap,
}: ComparisonGroupProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className={`flex items-center gap-2 text-sm font-semibold ${colorClass}`}>
        {icon}
        <span>{title}</span>
      </div>
      <ul className="mt-3 space-y-3 text-sm text-slate-700">
        {items.length > 0 ? (
          items.map((item) => {
            const thesis = thesisMap.get(item.thesisId);
            return (
              <li key={item.thesisId} className="rounded-lg border border-slate-200 bg-white/95 p-3 shadow-sm">
                <p className="font-medium text-slate-900">{thesis?.text ?? 'Otázka'}</p>
                {thesis?.issueId && (
                  <Link
                    href={`/party-profiles?party=${partyId}#${thesis.issueId}`}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Jak to vidí {partyName}
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </li>
            );
          })
        ) : (
          <li className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">{emptyText}</li>
        )}
      </ul>
    </div>
  );
}

export default function ResultsPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-indigo-100/60">
      <Suspense
        fallback={
          <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
            <p className="text-sm text-slate-500">Načítám výsledky…</p>
          </div>
        }
      >
        <ResultsContent />
      </Suspense>
    </div>
  );
}







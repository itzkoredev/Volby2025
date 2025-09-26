'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ExternalLink, Users, TrendingUp, Calendar, Globe, ChevronDown, Quote, ListChecks, Vote, BookOpen, Filter, Compass, Sparkles, ArrowUpDown, CheckCircle2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Radar } from 'react-chartjs-2';
import { Party, PartyPosition, Thesis, Issue } from '@/lib/types';
import { withBasePath } from '@/lib/utils';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Filler,
  RadialLinearScale,
  ArcElement,
  Title, 
  Tooltip, 
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Barevné schéma pro politické strany podle jejich oficiálních barev
const partyColors: Record<string, { primary: string; secondary: string; accent: string; light: string }> = {
  'ano': { primary: '#0B1F5D', secondary: '#112E7A', accent: '#27459F', light: '#E8ECFA' },
  'stan': { primary: '#FF6FBF', secondary: '#FF8BD0', accent: '#FFB1E2', light: '#FFE8F5' },
  'spolu': { primary: '#37E28A', secondary: '#5FF5A4', accent: '#8CFFBE', light: '#E8FFF2' },
  'spd': { primary: '#7B1113', secondary: '#92181B', accent: '#B02225', light: '#F7E6E7' },
  'pirati': { primary: '#000000', secondary: '#1C1C1C', accent: '#3A3A3A', light: '#F5F5F5' },
  'stacilo': { primary: '#D60000', secondary: '#F21B1B', accent: '#FF3B3B', light: '#FFE6E6' },
  'motoriste': { primary: '#1ABC9C', secondary: '#39D4B3', accent: '#6FE6C9', light: '#E0FAF4' },
  'volt': { primary: '#502379', secondary: '#673AB7', accent: '#9C27B0', light: '#F3E5F5' },
  'hnutigenerace': { primary: '#00796B', secondary: '#009688', accent: '#4DB6AC', light: '#E0F2F1' },
  'prisaha': { primary: '#1565C0', secondary: '#2196F3', accent: '#42A5F5', light: '#E3F2FD' },
  'korunaceska': { primary: '#8E24AA', secondary: '#9C27B0', accent: '#BA68C8', light: '#F3E5F5' },
  'ceskarepublika1': { primary: '#D84315', secondary: '#FF5722', accent: '#FF7043', light: '#FBE9E7' },
  'cssdsocialni': { primary: '#E65100', secondary: '#FF9800', accent: '#FFB74D', light: '#FFF3E0' },
  'hnutikruh': { primary: '#5E35B1', secondary: '#673AB7', accent: '#9575CD', light: '#EDE7F6' },
  'hnutiobcanu': { primary: '#00838F', secondary: '#00ACC1', accent: '#4DD0E1', light: '#E0F7FA' },
  'jasnysignal': { primary: '#6A1B9A', secondary: '#8E24AA', accent: '#AB47BC', light: '#F3E5F5' },
  'levice': { primary: '#B71C1C', secondary: '#F44336', accent: '#EF5350', light: '#FFEBEE' },
  'moravskezemske': { primary: '#F57F17', secondary: '#FBC02D', accent: '#FDD835', light: '#FFFDE7' },
  'nevolteurza': { primary: '#4A148C', secondary: '#6A1B9A', accent: '#8E24AA', light: '#F3E5F5' },
  'rebelove': { primary: '#212121', secondary: '#424242', accent: '#616161', light: '#FAFAFA' },
  'sms': { primary: '#1B5E20', secondary: '#2E7D32', accent: '#43A047', light: '#E8F5E8' },
  'svycarska': { primary: '#C62828', secondary: '#D32F2F', accent: '#F44336', light: '#FFEBEE' },
  'voluntia': { primary: '#1A237E', secondary: '#303F9F', accent: '#3F51B5', light: '#E8EAF6' },
  'voltepravyblok': { primary: '#4E342E', secondary: '#5D4037', accent: '#8D6E63', light: '#EFEBE9' },
  'balbinova': { primary: '#AD1457', secondary: '#C2185B', accent: '#E91E63', light: '#FCE4EC' }
};

type CategoryFilter = 'all' | 'main' | 'secondary';
type SortOption = 'poll' | 'coverage' | 'alphabetical';

interface PartyMetricsIssue {
  issueId: string;
  count: number;
  avgValue: number;
  avgConfidence: number;
}

interface PartyMetrics {
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

async function loadParties(): Promise<Party[]> {
  const response = await fetch(withBasePath('/data/parties.json'));
  if (!response.ok) {
    throw new Error('Nepodařilo se načíst data stran');
  }
  return response.json();
}

// Nové funkce pro načtení dat postojů a tezí
async function loadPartyPositions(): Promise<PartyPosition[]> {
  const response = await fetch(withBasePath('/data/party_positions.json'));
  if (!response.ok) {
    throw new Error('Nepodařilo se načíst data o postojích stran');
  }
  return response.json();
}

async function loadTheses(): Promise<Thesis[]> {
  const response = await fetch(withBasePath('/data/theses.json'));
  if (!response.ok) {
    throw new Error('Nepodařilo se načíst data tezí');
  }
  return response.json();
}

async function loadIssues(): Promise<Issue[]> {
  const response = await fetch(withBasePath('/data/issues.json'));
  if (!response.ok) {
    throw new Error('Nepodařilo se načíst data témat');
  }
  return response.json();
}

function calculatePartyMetrics(positions: PartyPosition[], theses: Thesis[]): Record<string, PartyMetrics> {
  const thesisById = new Map(theses.map(thesis => [thesis.id, thesis]));
  const totalTheses = Math.max(theses.length, 1);

  type IssueAccumulator = { count: number; totalValue: number; totalConfidence: number };
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

  positions.forEach(position => {
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
    const issueEntry = entry.issues[issueId] ??= { count: 0, totalValue: 0, totalConfidence: 0 };
    issueEntry.count += 1;
    issueEntry.totalValue += position.value;
    issueEntry.totalConfidence += position.confidence;

    const latestDate = position.lastUpdated || position.source?.date;
    if (latestDate) {
      const timestamp = new Date(latestDate).getTime();
      if (!Number.isNaN(timestamp)) {
        entry.latestTimestamp = entry.latestTimestamp ? Math.max(entry.latestTimestamp, timestamp) : timestamp;
      }
    }
  });

  const metrics: Record<string, PartyMetrics> = {};

  Object.entries(accumulator).forEach(([partyId, value]) => {
    const { positionCount } = value;
    const coverageRatio = positionCount / totalTheses;
    const topIssues = Object.entries(value.issues).map(([issueId, stats]) => ({
      issueId,
      count: stats.count,
      avgValue: stats.totalValue / Math.max(stats.count, 1),
      avgConfidence: stats.totalConfidence / Math.max(stats.count, 1),
    })).sort((a, b) => b.count - a.count || Math.abs(b.avgValue) - Math.abs(a.avgValue));

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
    };
  });

  return metrics;
}

function formatAverageStance(value: number): string {
  if (value >= 1.5) return 'Rozhodně souhlasí';
  if (value >= 0.5) return 'Spíše souhlasí';
  if (value <= -1.5) return 'Rozhodně nesouhlasí';
  if (value <= -0.5) return 'Spíše nesouhlasí';
  return 'Neutrální nebo rozpolcený postoj';
}

function describeOrientation(metrics: PartyMetrics): { label: string; detail: string } {
  const intensity = metrics.avgValue;
  if (intensity >= 1.2) return { label: 'Silně podporuje změny', detail: 'Převažují jednoznačně souhlasné postoje' };
  if (intensity >= 0.5) return { label: 'Spíše podporuje', detail: 'Souhlasné odpovědi převažují' };
  if (intensity <= -1.2) return { label: 'Silně odmítá', detail: 'Většina postojů je proti navrženým tezím' };
  if (intensity <= -0.5) return { label: 'Spíše odmítá', detail: 'Převaha nesouhlasných stanovisek' };
  if (Math.abs(metrics.positiveShare - metrics.negativeShare) < 0.1) {
    return { label: 'Vyvážený mix', detail: 'Souhlasné i nesouhlasné postoje jsou v rovnováze' };
  }
  return metrics.positiveShare > metrics.negativeShare
    ? { label: 'Mírně reformní', detail: 'Více souhlasných než nesouhlasných postojů' }
    : { label: 'Mírně konzervativní', detail: 'Nesouhlasná stanoviska mírně převažují' };
}

function formatPercent(value: number, fractionDigits = 0): string {
  return `${(value * 100).toFixed(fractionDigits)}%`;
}

function PartyProfilesContent() {
  const searchParams = useSearchParams();
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [partyPositions, setPartyPositions] = useState<PartyPosition[]>([]);
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [partyMetrics, setPartyMetrics] = useState<Record<string, PartyMetrics>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [issueFilter, setIssueFilter] = useState<string>('all');
  const [minPoll, setMinPoll] = useState(0);
  const [onlyProfiled, setOnlyProfiled] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('poll');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAllData() {
      try {
        const [partiesData, positionsData, thesesData, issuesData] = await Promise.all([
          loadParties(),
          loadPartyPositions(),
          loadTheses(),
          loadIssues(),
        ]);

        const sortedParties = [...partiesData].sort((a, b) => {
          const aPercent = a.pollPercentage || 0;
          const bPercent = b.pollPercentage || 0;
          return bPercent - aPercent;
        });

        setParties(sortedParties);
        setPartyPositions(positionsData);
        setTheses(thesesData);
        setIssues(issuesData);
        setPartyMetrics(calculatePartyMetrics(positionsData, thesesData));
        setLoading(false);

        const partyIdFromUrl = searchParams.get('party');
        if (partyIdFromUrl) {
          const partyToShow = sortedParties.find(p => p.id === partyIdFromUrl);
          if (partyToShow) {
            setSelectedParty(partyToShow);
          }
        }
      } catch (err) {
        console.error('Chyba při načítání dat:', err);
        setError('Nepodařilo se načíst všechna potřebná data');
        setLoading(false);
      }
    }

    fetchAllData();
  }, [searchParams]);

  const issueTitleMap = useMemo(
    () => Object.fromEntries(issues.map(issue => [issue.id, issue.title])),
    [issues]
  );

  const filteredParties = useMemo(() => {
    const lowerTerm = searchTerm.trim().toLowerCase();

    const filtered = parties.filter(party => {
      if (categoryFilter !== 'all' && party.category !== categoryFilter) {
        return false;
      }

      if (lowerTerm) {
        const haystack = `${party.name} ${party.shortName ?? ''}`.toLowerCase();
        if (!haystack.includes(lowerTerm)) {
          return false;
        }
      }

      if (minPoll > 0 && (party.pollPercentage ?? 0) < minPoll) {
        return false;
      }

      if (onlyProfiled) {
        const metrics = partyMetrics[party.id];
        if (!metrics || metrics.positionCount === 0) {
          return false;
        }
      }

      if (issueFilter !== 'all') {
        const metrics = partyMetrics[party.id];
        if (!metrics || !metrics.topIssues.some(issue => issue.issueId === issueFilter)) {
          return false;
        }
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortOption === 'alphabetical') {
        return a.name.localeCompare(b.name, 'cs');
      }

      if (sortOption === 'coverage') {
        const aCoverage = partyMetrics[a.id]?.coverageRatio ?? 0;
        const bCoverage = partyMetrics[b.id]?.coverageRatio ?? 0;
        if (bCoverage !== aCoverage) {
          return bCoverage - aCoverage;
        }
        const aConfidence = partyMetrics[a.id]?.avgConfidence ?? 0;
        const bConfidence = partyMetrics[b.id]?.avgConfidence ?? 0;
        if (bConfidence !== aConfidence) {
          return bConfidence - aConfidence;
        }
        return a.name.localeCompare(b.name, 'cs');
      }

      const aPoll = a.pollPercentage ?? 0;
      const bPoll = b.pollPercentage ?? 0;
      if (bPoll !== aPoll) {
        return bPoll - aPoll;
      }
      return a.name.localeCompare(b.name, 'cs');
    });

    return sorted;
  }, [parties, categoryFilter, searchTerm, minPoll, onlyProfiled, issueFilter, sortOption, partyMetrics]);

  const mainParties = useMemo(
    () => filteredParties.filter(party => party.category === 'main'),
    [filteredParties]
  );

  const secondaryParties = useMemo(
    () => filteredParties.filter(party => party.category === 'secondary'),
    [filteredParties]
  );

  const maxPollValue = useMemo(() => {
    const peak = parties.reduce((acc, party) => Math.max(acc, party.pollPercentage ?? 0), 0);
    return Math.max(40, Math.ceil((peak + 5) / 5) * 5);
  }, [parties]);

  const activeIssueLabel = issueFilter === 'all' ? 'Všechna témata' : issueTitleMap[issueFilter] ?? 'Neznámé téma';
  const filteredCount = filteredParties.length;
  const profiledCount = filteredParties.filter(party => (partyMetrics[party.id]?.positionCount ?? 0) > 0).length;
  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    categoryFilter !== 'all' ||
    issueFilter !== 'all' ||
    minPoll > 0 ||
    onlyProfiled ||
    sortOption !== 'poll'
  );

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('all');
    setIssueFilter('all');
    setMinPoll(0);
    setOnlyProfiled(false);
    setSortOption('poll');
  };

  const getPartyColor = (partyId: string) => {
    return partyColors[partyId] || {
      primary: '#666666',
      secondary: '#888888',
      accent: '#AAAAAA',
      light: '#F5F5F5'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Načítám profily stran...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/">
            <Button>Zpět na úvod</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Profily politických stran
              </h1>
              <p className="text-gray-600">
                Kompletní přehled všech 26 politických stran kandidujících ve volbách 2025
              </p>
            </div>
            <div className="flex gap-2 mt-4 sm:mt-0">
              <Link href="/stem-polls">
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Průzkumy STEM
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zpět na úvod
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {!selectedParty && (
          <div className="mb-8 space-y-4">
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur">
              <CardContent className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex-1">
                  <label className="flex items-center text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                    <Filter className="h-4 w-4 mr-2 text-gray-400" />
                    Chytrý filtr
                  </label>
                  <Input
                    placeholder="Hledejte podle názvu nebo zkratky..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="shadow-sm"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                  {(['all', 'main', 'secondary'] as CategoryFilter[]).map(option => (
                    <Button
                      key={option}
                      variant={categoryFilter === option ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCategoryFilter(option)}
                      className="whitespace-nowrap"
                    >
                      {option === 'all' ? 'Vše' : option === 'main' ? 'Hlavní' : 'Ostatní'}
                    </Button>
                  ))}
                </div>
                <div className="grid grid-cols-1 gap-2 sm:flex sm:items-center sm:gap-3">
                  {(['poll', 'coverage', 'alphabetical'] as SortOption[]).map(option => (
                    <Button
                      key={option}
                      variant={sortOption === option ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => setSortOption(option)}
                      className="whitespace-nowrap"
                    >
                      {option === 'poll' ? 'Podle průzkumu' : option === 'coverage' ? 'Podle dat' : 'Abecedně'}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <div className="flex items-center justify-between text-xs uppercase tracking-wide text-gray-500 mb-2">
                    <span>Minimální preference</span>
                    <span className="text-gray-700 font-semibold">{minPoll.toFixed(1)}%</span>
                  </div>
                  <Slider
                    max={maxPollValue}
                    min={0}
                    step={0.5}
                    value={[minPoll]}
                    onValueChange={value => setMinPoll(value[0] ?? 0)}
                  />
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                  <Button
                    variant={onlyProfiled ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setOnlyProfiled(prev => !prev)}
                    className="whitespace-nowrap"
                  >
                    <Compass className="h-4 w-4 mr-2" />
                    Jen strany s detailním profilem
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetFilters}
                      className="whitespace-nowrap text-gray-600 hover:text-gray-900"
                    >
                      Vymazat filtr
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Témata</span>
                  <span className="text-xs text-gray-400">{activeIssueLabel}</span>
                </div>
                <ScrollArea className="w-full">
                  <div className="flex gap-2 pb-2">
                    <Button
                      size="sm"
                      variant={issueFilter === 'all' ? 'secondary' : 'outline'}
                      onClick={() => setIssueFilter('all')}
                      className="whitespace-nowrap"
                    >
                      Všechna témata
                    </Button>
                    {issues.map(issue => (
                      <Button
                        key={issue.id}
                        size="sm"
                        variant={issueFilter === issue.id ? 'secondary' : 'outline'}
                        onClick={() => setIssueFilter(issue.id)}
                        className="whitespace-nowrap"
                      >
                        {issue.title}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex flex-wrap items-center justify-between text-xs text-gray-500">
                <span>
                  Nalezeno {filteredCount} z {parties.length} stran
                  {filteredCount > 0 && ` • ${profiledCount} s analyzovanými postoji`}
                </span>
                <span className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-white/70">
                    <ArrowUpDown className="h-3 w-3 mr-1" />
                    řazení: {sortOption === 'poll' ? 'průzkumy' : sortOption === 'coverage' ? 'data' : 'abeceda'}
                  </Badge>
                </span>
              </div>
            </CardContent>
          </Card>
          </div>
        )}

        {selectedParty ? (
          <DetailedPartyProfile
            party={selectedParty}
            onBack={() => setSelectedParty(null)}
            colors={getPartyColor(selectedParty.id)}
            positions={partyPositions.filter(p => p.partyId === selectedParty.id)}
            theses={theses}
            issues={issues}
            metrics={partyMetrics[selectedParty.id]}
          />
        ) : filteredParties.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white/90">
            <CardContent className="py-12 text-center space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Žádná strana neodpovídá zvoleným filtrům</h3>
              <p className="text-gray-600 max-w-xl mx-auto">
                Upravte parametry vyhledávání nebo zobrazte kompletní přehled všech kandidujících subjektů.
              </p>
              <div className="flex justify-center gap-3">
                <Button onClick={resetFilters}>Zobrazit všechny strany</Button>
                <Button variant="outline" onClick={() => setOnlyProfiled(prev => !prev)}>
                  {onlyProfiled ? 'Zahrnout i neúplné profily' : 'Zobrazit pouze profily'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            <section>
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Hlavní politické strany</h2>
                  <p className="text-gray-600">Strany s nejvyšší podporou a největším vlivem na politickou scénu</p>
                </div>
                <Badge variant="outline" className="bg-white/70">
                  {mainParties.length} {mainParties.length === 1 ? 'strana' : 'stran'}
                </Badge>
              </div>
              {mainParties.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {mainParties.map((party, index) => (
                    <motion.div
                      key={party.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <PartyCard
                        party={party}
                        colors={getPartyColor(party.id)}
                        onClick={() => setSelectedParty(party)}
                        isMainParty
                        metrics={partyMetrics[party.id]}
                        issueTitles={issueTitleMap}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <Card className="border-0 bg-white/80 shadow-sm">
                  <CardContent className="py-8 text-center text-gray-600">
                    Žádná hlavní strana neodpovídá zvoleným filtrům.
                  </CardContent>
                </Card>
              )}
            </section>

            <section>
              <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-gray-700 mb-1">Ostatní politické subjekty</h2>
                  <p className="text-gray-500 text-sm">Další strany a hnutí na politické scéně</p>
                </div>
                <Badge variant="outline" className="bg-white/70">
                  {secondaryParties.length} {secondaryParties.length === 1 ? 'strana' : 'stran'}
                </Badge>
              </div>
              {secondaryParties.length > 0 ? (
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {secondaryParties.map((party, index) => (
                    <motion.div
                      key={party.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.03 }}
                    >
                      <PartyCard
                        party={party}
                        colors={getPartyColor(party.id)}
                        onClick={() => setSelectedParty(party)}
                        isMainParty={false}
                        metrics={partyMetrics[party.id]}
                        issueTitles={issueTitleMap}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <Card className="border-0 bg-white/80 shadow-sm">
                  <CardContent className="py-8 text-center text-gray-600">
                    Filtrování nezobrazuje žádnou vedlejší stranu.
                  </CardContent>
                </Card>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

interface PartyCardProps {
  party: Party;
  colors: { primary: string; secondary: string; accent: string; light: string };
  onClick: () => void;
  isMainParty?: boolean;
  metrics?: PartyMetrics;
  issueTitles?: Record<string, string>;
}

function PartyCard({ party, colors, onClick, isMainParty = true, metrics, issueTitles }: PartyCardProps) {
  const coveragePercent = metrics ? Math.round(metrics.coverageRatio * 100) : null;
  const avgConfidence = metrics ? Math.round(metrics.avgConfidence * 100) : null;
  const topIssues = metrics ? metrics.topIssues.slice(0, isMainParty ? 3 : 2) : [];

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card 
        className={`cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col ${
          isMainParty ? 'min-h-[15rem]' : 'min-h-[11.5rem]'
        }`}
        style={{ 
          background: `linear-gradient(135deg, ${colors.light} 0%, white 100%)`,
          borderTop: `${isMainParty ? '4px' : '2px'} solid ${colors.primary}`,
          opacity: isMainParty ? 1 : 0.9
        }}
        onClick={onClick}
      >
        <CardHeader className={`${isMainParty ? 'pb-3' : 'pb-2'} space-y-1`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle 
                className={`${isMainParty ? 'text-lg' : 'text-base'} font-bold mb-1 line-clamp-2`}
                style={{ color: colors.primary }}
              >
                {party.name}
              </CardTitle>
              {isMainParty && (
                <p className="text-sm font-medium opacity-80 mb-2" style={{ color: colors.secondary }}>
                  {party.shortName}
                </p>
              )}
            </div>
            <div 
              className={`${isMainParty ? 'w-12 h-12' : 'w-8 h-8'} rounded-full flex items-center justify-center text-white font-bold ${isMainParty ? 'text-lg' : 'text-sm'} shadow-md overflow-hidden`}
              style={{ backgroundColor: colors.primary }}
            >
              {party.logo ? (
                <img 
                  src={party.logo} 
                  alt={`${party.name} logo`}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    // Fallback na iniciály pokud se logo nepodaří načíst
                    e.currentTarget.style.display = 'none';
                    const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                    if (nextElement) nextElement.style.display = 'block';
                  }}
                />
              ) : null}
              <span 
                className={party.logo ? "hidden" : "block"}
              >
                {party.shortName?.charAt(0) || party.name.charAt(0)}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col justify-between">
          {/* Popis - vždy zobrazit, ale kratší pro vedlejší strany */}
          <p className={`text-sm text-gray-600 ${isMainParty ? 'line-clamp-4' : 'line-clamp-3'}`}>
            {party.description || 'Informace o straně nejsou k dispozici.'}
          </p>

          {metrics && (
            <div className="mt-4 space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Pokrytí tezí</span>
                  <span className="font-semibold" style={{ color: colors.primary }}>{coveragePercent}%</span>
                </div>
                <Progress value={coveragePercent ?? 0} className="h-1.5 bg-white/60" />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center">
                  <ListChecks className="h-3.5 w-3.5 mr-1 text-gray-400" />
                  <span>{metrics.positionCount} postojů</span>
                </div>
                {avgConfidence !== null && (
                  <div className="flex items-center">
                    <Sparkles className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    <span>{avgConfidence}% důvěra</span>
                  </div>
                )}
              </div>

              {topIssues.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {topIssues.map(issue => (
                    <Badge
                      key={issue.issueId}
                      variant="outline"
                      className="bg-white/80 text-[10px] font-medium"
                    >
                      {issueTitles?.[issue.issueId] ?? issue.issueId}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center justify-between mt-4">
            <div className={`flex items-center ${isMainParty ? 'space-x-4' : 'space-x-2'} text-xs text-gray-500`}>
              {isMainParty && (
                <>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>2025</span>
                  </div>
                  <div className="flex items-center">
                    <Globe className="h-3 w-3 mr-1" />
                    <span>ČR</span>
                  </div>
                </>
              )}
              {/* Procenta - vždy zobrazit, i když je 0 */}
              <div className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span className="font-medium text-xs" style={{ color: colors.primary }}>
                  {party.pollPercentage || 0}%
                </span>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="p-2 rounded-full"
              style={{ backgroundColor: colors.accent + '20' }}
            >
              <ExternalLink className="h-4 w-4" style={{ color: colors.primary }} />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface DetailedPartyProfileProps {
  party: Party;
  colors: { primary: string; secondary: string; accent: string; light: string };
  onBack: () => void;
  positions: PartyPosition[];
  theses: Thesis[];
  issues: Issue[];
  metrics?: PartyMetrics;
}

function DetailedPartyProfile({ party, colors, onBack, positions, theses, issues, metrics }: DetailedPartyProfileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header s gradientem ve stylu strany */}
      <div 
        className="rounded-2xl p-8 mb-8 text-white relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.accent} 100%)`
        }}
      >
        <div className="relative z-10">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="mb-6 border-white/30 text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na přehled
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {party.name}
              </h1>
              <p className="text-xl opacity-90 mb-4">
                {party.shortName}
              </p>
              <p className="text-lg opacity-80 max-w-3xl">
                {party.description}
              </p>
            </div>
            <div className="mt-6 md:mt-0 md:ml-8">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm overflow-hidden">
                {party.logo ? (
                  <img 
                    src={party.logo} 
                    alt={`${party.name} logo`}
                    className="w-16 h-16 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                      if (nextElement) nextElement.style.display = 'block';
                    }}
                  />
                ) : null}
                <span 
                  className={party.logo ? "hidden text-4xl font-bold" : "text-4xl font-bold"}
                >
                  {party.shortName?.charAt(0) || party.name.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dekorativní elementy */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
      </div>

      <div className="space-y-8 mb-8">
        <PartyInsights
          party={party}
          metrics={metrics}
          theses={theses}
          issues={issues}
          colors={colors}
        />
        <PartyProsCons
          party={party}
          positions={positions}
          theses={theses}
          issues={issues}
          colors={colors}
        />
        <PartyHighlights positions={positions} theses={theses} colors={colors} />
      </div>

      {/* Hlavní obsah */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Základní informace - sloupec 1 */}
        <div className="lg:col-span-1 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: colors.primary }}>
                <Users className="h-5 w-5 mr-2" />
                Základní informace
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Oficiální název</h4>
                <p className="text-gray-600">{party.name}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Zkratka</h4>
                <p className="text-gray-600">{party.shortName}</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Web</h4>
                <a 
                  href={party.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center hover:underline"
                  style={{ color: colors.primary }}
                >
                  {party.website}
                  <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
              {party.pollPercentage && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Aktuální preference</h4>
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2" style={{ color: colors.primary }} />
                    <span className="text-2xl font-bold" style={{ color: colors.primary }}>
                      {party.pollPercentage}%
                    </span>
                    <span className="text-sm text-gray-500 ml-2">v průzkumech</span>
                  </div>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">Poslední aktualizace</h4>
                <p className="text-gray-600">
                  {party.lastUpdated ? new Date(party.lastUpdated).toLocaleDateString('cs-CZ') : 'Neuvedeno'}
                </p>
              </div>
            </CardContent>
          </Card>
        
          {/* Klíčoví představitelé */}
          {party.representatives && party.representatives.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center" style={{ color: colors.primary }}>
                  <Users className="h-5 w-5 mr-2" />
                  Klíčoví představitelé
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {party.representatives.map((rep, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        {rep.photo ? (
                          <img 
                            src={rep.photo} 
                            alt={rep.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-full h-full flex items-center justify-center text-white font-bold text-xl"
                            style={{ backgroundColor: colors.primary }}
                          >
                            {rep.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{rep.name}</h4>
                        <p className="text-sm text-gray-600">{rep.position}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Politické postoje - sloupec 2 a 3 */}
        <div className="lg:col-span-2">
          <PartyPositionsDisplay 
            positions={positions}
            theses={theses}
            issues={issues}
            colors={colors}
          />
        </div>
      </div>

      {/* Ostatní sekce pod hlavní mřížkou */}
      <div className="mt-8 space-y-8">
        {/* Historické úspěchy */}
        {party.historicalAchievements && party.historicalAchievements.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: colors.primary }}>
                <Calendar className="h-5 w-5 mr-2" />
                Historické milníky
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {party.historicalAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-start">
                    <div 
                      className="w-3 h-3 rounded-full mt-2 mr-3 flex-shrink-0"
                      style={{ backgroundColor: colors.primary }}
                    ></div>
                    <span className="text-gray-700">{achievement}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Kauzy */}
        {party.controversies && party.controversies.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-orange-600">
                <ExternalLink className="h-5 w-5 mr-2" />
                Kauzy a kritické body
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {party.controversies.map((controversy, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span className="text-gray-700">{controversy}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline - časová linka událostí */}
        {party.timeline && party.timeline.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: colors.primary }}>
                <Calendar className="h-5 w-5 mr-2" />
                Aktuální dění
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Vertikální linka */}
                <div 
                  className="absolute left-4 top-0 bottom-0 w-0.5"
                  style={{ backgroundColor: colors.secondary }}
                ></div>
                
                <div className="space-y-6">
                  {party.timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((event, index) => (
                    <div key={index} className="relative flex items-start pl-10">
                      {/* Tečka na timeline */}
                      <div 
                        className="absolute left-2 w-4 h-4 rounded-full border-2 border-white shadow-md -translate-x-1/2"
                        style={{ 
                          backgroundColor: event.type === 'success' ? '#10B981' : 
                                         event.type === 'controversy' ? '#F59E0B' :
                                         event.type === 'poll' ? colors.primary :
                                         event.type === 'election' ? '#8B5CF6' :
                                         colors.secondary
                        }}
                      ></div>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-800">{event.title}</h4>
                          <span className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString('cs-CZ')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{event.description}</p>
                        <span 
                          className="inline-block px-2 py-1 rounded-full text-xs font-medium mt-2"
                          style={{ 
                            backgroundColor: event.type === 'success' ? '#D1FAE5' : 
                                           event.type === 'controversy' ? '#FEF3C7' :
                                           event.type === 'poll' ? colors.light :
                                           event.type === 'election' ? '#EDE9FE' :
                                           '#F3F4F6',
                            color: event.type === 'success' ? '#065F46' : 
                                   event.type === 'controversy' ? '#92400E' :
                                   event.type === 'poll' ? colors.primary :
                                   event.type === 'election' ? '#5B21B6' :
                                   '#374151'
                          }}
                        >
                          {event.type === 'success' && 'Úspěch'}
                          {event.type === 'controversy' && 'Kauza'}
                          {event.type === 'poll' && 'Průzkum'}
                          {event.type === 'election' && 'Volby'}
                          {event.type === 'program' && 'Program'}
                          {event.type === 'milestone' && 'Milník'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </motion.div>
  );
}

// Nová komponenta pro zobrazení postojů strany
interface PartyPositionsDisplayProps {
  positions: PartyPosition[];
  theses: Thesis[];
  issues: Issue[];
  colors: { primary: string; secondary: string; accent: string; light: string };
}

interface PartyInsightsProps {
  party: Party;
  metrics?: PartyMetrics;
  theses: Thesis[];
  issues: Issue[];
  colors: { primary: string; secondary: string; accent: string; light: string };
}

function PartyInsights({ party, metrics, theses, issues, colors }: PartyInsightsProps) {
  const issueMap = useMemo(() => new Map(issues.map(issue => [issue.id, issue])), [issues]);
  const totalTheses = Math.max(theses.length, 1);

  if (!metrics) {
    return (
      <Card className="shadow-lg border-0 bg-white/85">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-700">
            <Sparkles className="h-5 w-5 mr-2" />
            Profil se právě doplňuje
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600">
          Sbíráme podrobné informace o programu strany {party.name}. Sledujte novinky, brzy přidáme další postoje a analýzy.
        </CardContent>
      </Card>
    );
  }

  const coveragePercent = Math.round(metrics.coverageRatio * 100);
  const avgConfidence = Math.round(metrics.avgConfidence * 100);
  const orientation = describeOrientation(metrics);
  const topIssues = metrics.topIssues.slice(0, 6);
  const chartAvailable = topIssues.length >= 3;
  const latestUpdate = metrics.latestUpdate
    ? new Date(metrics.latestUpdate).toLocaleDateString('cs-CZ')
    : 'Neuvedeno';

  const radarData = {
    labels: topIssues.map(issue => issueMap.get(issue.issueId)?.title ?? issue.issueId),
    datasets: [
      {
        label: 'Intenzita postoje',
        data: topIssues.map(issue => Number(issue.avgValue.toFixed(2))),
        backgroundColor: colors.accent + '33',
        borderColor: colors.primary,
        borderWidth: 2,
        pointBackgroundColor: colors.primary,
        pointBorderColor: '#ffffff',
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.parsed.r.toFixed(2)}`,
        },
      },
    },
    scales: {
      r: {
        suggestedMin: -2,
        suggestedMax: 2,
        ticks: { stepSize: 1, display: false },
        grid: { color: '#e5e7eb' },
        angleLines: { color: '#e5e7eb' },
        pointLabels: { font: { size: 11 }, color: '#4b5563' },
      },
    },
  };

  const distribution = [
    { label: 'Souhlas', value: metrics.positiveShare, color: 'text-green-600' },
    { label: 'Neutrální', value: metrics.neutralShare, color: 'text-gray-600' },
    { label: 'Nesouhlas', value: metrics.negativeShare, color: 'text-red-600' },
  ];

  const priorityIssues = metrics.topIssues.slice(0, 5);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="shadow-lg border-0 bg-white/95 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center" style={{ color: colors.primary }}>
            <Sparkles className="h-5 w-5 mr-2" />
            Programová DNA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-xs uppercase tracking-wide text-gray-500">Pokrytí tezí</p>
              <p className="text-2xl font-semibold text-gray-900">{coveragePercent}%</p>
              <p className="text-xs text-gray-500">{metrics.positionCount} z {totalTheses} tezí</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-xs uppercase tracking-wide text-gray-500">Průměrná důvěra</p>
              <p className="text-2xl font-semibold text-gray-900">{avgConfidence}%</p>
              <p className="text-xs text-gray-500">Zohledňuje kvalitu zdrojů</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
              <p className="text-xs uppercase tracking-wide text-gray-500">Směřování programu</p>
              <p className="text-lg font-semibold text-gray-900">{orientation.label}</p>
              <p className="text-xs text-gray-500">{orientation.detail}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            {distribution.map(item => (
              <div key={item.label} className={`px-3 py-1 rounded-full bg-gray-100/80 ${item.color}`}>
                {item.label}: {formatPercent(item.value, 0)}
              </div>
            ))}
          </div>

          <div className="h-64">
            {chartAvailable ? (
              <Radar data={radarData} options={radarOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-gray-500">
                Pro vizualizaci je potřeba více postojů k tématům.
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400 text-right">Aktualizováno {latestUpdate}</p>
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center" style={{ color: colors.primary }}>
            <Compass className="h-5 w-5 mr-2" />
            Prioritní témata
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {priorityIssues.length === 0 && (
            <p className="text-sm text-gray-500">Zatím nemáme dostatek dat k vyhodnocení priorit strany.</p>
          )}
          {priorityIssues.map(issue => {
            const meta = issueMap.get(issue.issueId);
            return (
              <div key={issue.issueId} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-sm font-semibold text-gray-800">
                  <span>{meta?.title ?? issue.issueId}</span>
                  <Badge variant="outline" className="bg-white/80 text-[11px]">
                    {issue.count}×
                  </Badge>
                </div>
                {meta?.description && (
                  <p className="text-xs text-gray-500 mt-1">{meta.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mt-2">
                  <Badge variant="outline" className="bg-white/80">
                    {formatAverageStance(issue.avgValue)}
                  </Badge>
                  <Badge variant="outline" className="bg-white/80">
                    Důvěra {Math.round(issue.avgConfidence * 100)}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

interface PartyHighlightsProps {
  positions: PartyPosition[];
  theses: Thesis[];
  colors: { primary: string; secondary: string; accent: string; light: string };
}

interface PartyProsConsProps {
  party: Party;
  positions: PartyPosition[];
  theses: Thesis[];
  issues: Issue[];
  colors: { primary: string; secondary: string; accent: string; light: string };
}

type ProgramHighlight = {
  id: string;
  thesisText: string;
  stance: string;
  confidence: number;
  issueTitle?: string;
  sourceTitle?: string;
  sourceUrl?: string;
  sourceDate?: string;
};

function PartyProsCons({ party, positions, theses, issues, colors }: PartyProsConsProps) {
  const thesisMap = useMemo(() => new Map(theses.map(thesis => [thesis.id, thesis])), [theses]);
  const issueMap = useMemo(() => new Map(issues.map(issue => [issue.id, issue])), [issues]);

  const positiveHighlights = useMemo<ProgramHighlight[]>(() => {
    return positions
      .filter(position => position.value >= 1)
      .sort((a, b) => {
        const intensityDiff = Math.abs(b.value) - Math.abs(a.value);
        if (intensityDiff !== 0) return intensityDiff;
        return b.confidence - a.confidence;
      })
      .slice(0, 3)
      .map(position => {
        const thesis = thesisMap.get(position.thesisId);
        const issueTitle = thesis ? issueMap.get(thesis.issueId)?.title : undefined;
        return {
          id: position.thesisId,
          thesisText: thesis?.text ?? position.thesisId,
          stance: formatAverageStance(position.value),
          confidence: Math.round(position.confidence * 100),
          issueTitle,
          sourceTitle: position.source?.title,
          sourceUrl: position.source?.url,
          sourceDate: position.source?.date,
        };
      });
  }, [positions, thesisMap, issueMap]);

  const negativeHighlights = useMemo<ProgramHighlight[]>(() => {
    return positions
      .filter(position => position.value <= -1)
      .sort((a, b) => {
        const intensityDiff = Math.abs(b.value) - Math.abs(a.value);
        if (intensityDiff !== 0) return intensityDiff;
        return b.confidence - a.confidence;
      })
      .slice(0, 3)
      .map(position => {
        const thesis = thesisMap.get(position.thesisId);
        const issueTitle = thesis ? issueMap.get(thesis.issueId)?.title : undefined;
        return {
          id: position.thesisId,
          thesisText: thesis?.text ?? position.thesisId,
          stance: formatAverageStance(position.value),
          confidence: Math.round(position.confidence * 100),
          issueTitle,
          sourceTitle: position.source?.title,
          sourceUrl: position.source?.url,
          sourceDate: position.source?.date,
        };
      });
  }, [positions, thesisMap, issueMap]);

  const manualPros = party.pros ?? [];
  const manualCons = party.cons ?? [];

  const formatSourceDate = (date?: string) => {
    if (!date) return undefined;
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return undefined;
    }
    return parsed.toLocaleDateString('cs-CZ');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="shadow-lg border-0 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center text-green-600">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Pro stranu hovoří
          </CardTitle>
        </CardHeader>
        <CardContent>
          {manualPros.length === 0 && positiveHighlights.length === 0 ? (
            <p className="text-sm text-gray-500">
              Zatím nemáme konkrétní argumenty ve prospěch této strany. Sledujte průběžné doplňování dat.
            </p>
          ) : (
            <ul className="space-y-4">
              {manualPros.map((pro, index) => (
                <li key={`manual-pro-${index}`} className="flex items-start gap-3">
                  <CheckCircle2 className="h-4 w-4 mt-1 text-green-600" />
                  <span className="text-sm text-gray-700">{pro}</span>
                </li>
              ))}
              {positiveHighlights.map(highlight => {
                const sourceDateLabel = formatSourceDate(highlight.sourceDate);
                return (
                  <li key={`highlight-pro-${highlight.id}`} className="rounded-lg border border-gray-100 bg-white/80 p-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                    <Badge variant="outline" className="bg-white/90" style={{ borderColor: colors.primary, color: colors.primary }}>
                      Programový postoj
                    </Badge>
                    <span>{highlight.stance}</span>
                    {highlight.issueTitle && <span className="text-gray-400">• {highlight.issueTitle}</span>}
                  </div>
                  <p className="text-sm text-gray-800">{highlight.thesisText}</p>
                  <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-3">
                    <span>Důvěra {highlight.confidence}%</span>
                    {highlight.sourceTitle && highlight.sourceUrl ? (
                      <a
                        href={highlight.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {highlight.sourceTitle}
                      </a>
                    ) : highlight.sourceTitle ? (
                      <span>{highlight.sourceTitle}</span>
                    ) : null}
                    {sourceDateLabel && (
                      <span>{sourceDateLabel}</span>
                    )}
                  </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg border-0 bg-white/95">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Proti straně hovoří
          </CardTitle>
        </CardHeader>
        <CardContent>
          {manualCons.length === 0 && negativeHighlights.length === 0 ? (
            <p className="text-sm text-gray-500">
              Zatím nemáme konkrétní problematické body. Sledujte průběžné doplňování dat.
            </p>
          ) : (
            <ul className="space-y-4">
              {manualCons.map((con, index) => (
                <li key={`manual-con-${index}`} className="flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 mt-1 text-red-600" />
                  <span className="text-sm text-gray-700">{con}</span>
                </li>
              ))}
              {negativeHighlights.map(highlight => {
                const sourceDateLabel = formatSourceDate(highlight.sourceDate);
                return (
                  <li key={`highlight-con-${highlight.id}`} className="rounded-lg border border-gray-100 bg-white/80 p-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 mb-2">
                    <Badge variant="outline" className="bg-white/90 border-red-200 text-red-600">
                      Sporný postoj
                    </Badge>
                    <span>{highlight.stance}</span>
                    {highlight.issueTitle && <span className="text-gray-400">• {highlight.issueTitle}</span>}
                  </div>
                  <p className="text-sm text-gray-800">{highlight.thesisText}</p>
                  <div className="mt-2 text-xs text-gray-500 flex flex-wrap gap-3">
                    <span>Důvěra {highlight.confidence}%</span>
                    {highlight.sourceTitle && highlight.sourceUrl ? (
                      <a
                        href={highlight.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {highlight.sourceTitle}
                      </a>
                    ) : highlight.sourceTitle ? (
                      <span>{highlight.sourceTitle}</span>
                    ) : null}
                    {sourceDateLabel && (
                      <span>{sourceDateLabel}</span>
                    )}
                  </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PartyHighlights({ positions, theses, colors }: PartyHighlightsProps) {
  const thesisById = useMemo(() => new Map(theses.map(thesis => [thesis.id, thesis])), [theses]);

  const highlighted = useMemo(() => {
    return [...positions]
      .filter(position => position.confidence >= 0.5)
      .sort((a, b) => {
        const intensityDiff = Math.abs(b.value) - Math.abs(a.value);
        if (intensityDiff !== 0) return intensityDiff;
        return b.confidence - a.confidence;
      })
      .slice(0, 3);
  }, [positions]);

  if (!highlighted.length) {
    return null;
  }

  return (
    <Card className="shadow-lg border-0 bg-white/95">
      <CardHeader>
        <CardTitle className="flex items-center" style={{ color: colors.primary }}>
          <BookOpen className="h-5 w-5 mr-2" />
          Nejvýraznější postoje
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {highlighted.map(position => {
            const thesis = thesisById.get(position.thesisId);
            if (!thesis) return null;

            return (
              <div key={position.thesisId} className="h-full p-4 rounded-xl border border-gray-100 bg-gray-50/80 flex flex-col">
                <h4 className="text-sm font-semibold text-gray-800 mb-2 line-clamp-3">{thesis.text}</h4>
                <Badge
                  variant="outline"
                  className="self-start mb-2 text-xs font-semibold bg-white"
                  style={{ borderColor: colors.primary, color: colors.primary }}
                >
                  {formatAverageStance(position.value)}
                </Badge>
                <p className="text-xs text-gray-500 mb-3">Důvěra {Math.round(position.confidence * 100)}%</p>
                {position.justification && (
                  <p className="text-xs text-gray-600 italic line-clamp-4 mb-3">&bdquo;{position.justification}&ldquo;</p>
                )}
                <div className="mt-auto pt-3 text-xs text-gray-400 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(position.source.date).toLocaleDateString('cs-CZ')}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function PartyPositionItem({ position, thesis, colors }: { position: PartyPosition; thesis: Thesis; colors: PartyPositionsDisplayProps['colors'] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const stanceLabel = formatAverageStance(position.value);
  const confidencePercent = Math.round(position.confidence * 100);

  return (
    <div
      className="p-4 rounded-lg border border-white/60 bg-white/70 shadow-sm"
      style={{ borderColor: colors.accent + '40' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="font-semibold text-gray-700 mb-2">{thesis.text}</p>
          {position.justification && (
            <p className="text-sm text-gray-600 italic mb-2">&bdquo;{position.justification}&ldquo;</p>
          )}
        </div>
        <Badge
          variant="outline"
          className="text-xs font-semibold px-2 py-1 bg-white"
          style={{ borderColor: colors.primary, color: colors.primary }}
        >
          {stanceLabel}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span>Důvěra {confidencePercent}%</span>
          <div className="w-28">
            <Progress value={confidencePercent} className="h-1.5 bg-gray-200/80" />
          </div>
        </div>
        {position.details && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-xs px-2 py-1"
          >
            Detaily
            <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
        )}
      </div>

      {isExpanded && position.details && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t"
          style={{ borderColor: colors.accent + '50' }}
        >
          {position.details.arguments && position.details.arguments.length > 0 && (
            <div className="mb-3">
              <h5 className="font-semibold text-sm flex items-center mb-1" style={{ color: colors.primary }}>
                <ListChecks className="h-4 w-4 mr-2" /> Argumenty
              </h5>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 pl-2">
                {position.details.arguments.map((arg, i) => <li key={i}>{arg}</li>)}
              </ul>
            </div>
          )}
          {position.details.quotes && position.details.quotes.length > 0 && (
            <div className="mb-3">
              <h5 className="font-semibold text-sm flex items-center mb-1" style={{ color: colors.primary }}>
                <Quote className="h-4 w-4 mr-2" /> Citace
              </h5>
              {position.details.quotes.map((quote, i) => (
                <blockquote key={i} className="border-l-4 pl-3 text-sm italic text-gray-700" style={{ borderColor: colors.secondary }}>
                  &bdquo;{quote.text}&ldquo;
                  <footer className="text-xs not-italic mt-1 text-gray-500">- {quote.author}</footer>
                </blockquote>
              ))}
            </div>
          )}
          {position.details.relatedVotes && position.details.relatedVotes.length > 0 && (
            <div>
              <h5 className="font-semibold text-sm flex items-center mb-1" style={{ color: colors.primary }}>
                <Vote className="h-4 w-4 mr-2" /> Související hlasování
              </h5>
              <ul className="text-sm space-y-1">
                {position.details.relatedVotes.map((vote, i) => (
                  <li key={i}>
                    <a href={vote.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                      {vote.name} <ExternalLink className="h-3 w-3 ml-1" />
                      <span className={`ml-2 text-xs font-bold ${vote.result === 'pro' ? 'text-green-600' : 'text-red-600'}`}>
                        ({vote.result})
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      <a
        href={position.source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs flex items-center hover:underline mt-2"
        style={{ color: colors.secondary }}
      >
        <ExternalLink className="h-3 w-3 mr-1" />
        Zdroj: {position.source.title || 'Odkaz'} ({new Date(position.source.date).toLocaleDateString('cs-CZ')})
      </a>
    </div>
  );
}

function PartyPositionsDisplay({ positions, theses, issues, colors }: PartyPositionsDisplayProps) {
  const thesesById = useMemo(() => new Map(theses.map(t => [t.id, t])), [theses]);
  const issuesById = useMemo(() => new Map(issues.map(issue => [issue.id, issue])), [issues]);
  const issueOrder = useMemo(
    () => new Map(issues.map((issue, index) => [issue.id, issue.order ?? index])),
    [issues]
  );
  const [activeIssueId, setActiveIssueId] = useState<string>('all');

  const positionsByIssue = useMemo(() => {
    return positions.reduce((acc, position) => {
      const thesis = thesesById.get(position.thesisId);
      if (!thesis) return acc;

      const issueId = thesis.issueId || 'ostatni';
      if (!acc[issueId]) {
        acc[issueId] = [];
      }
      acc[issueId].push(position);
      return acc;
    }, {} as Record<string, PartyPosition[]>);
  }, [positions, thesesById]);

  const sortedIssues = useMemo(() => {
    return Object.entries(positionsByIssue).sort((a, b) => {
      const orderA = issueOrder.get(a[0]) ?? 999;
      const orderB = issueOrder.get(b[0]) ?? 999;
      return orderA - orderB;
    });
  }, [positionsByIssue, issueOrder]);

  useEffect(() => {
    if (activeIssueId === 'all') {
      return;
    }
    const exists = sortedIssues.some(([issueId]) => issueId === activeIssueId);
    if (!exists) {
      setActiveIssueId('all');
    }
  }, [sortedIssues, activeIssueId]);

  const visibleIssueSections = useMemo(() => {
    if (activeIssueId === 'all') {
      return sortedIssues;
    }
    return sortedIssues.filter(([issueId]) => issueId === activeIssueId);
  }, [sortedIssues, activeIssueId]);

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="flex items-center" style={{ color: colors.primary }}>
          <TrendingUp className="h-5 w-5 mr-2" />
          Klíčové postoje
        </CardTitle>
        <Badge variant="outline" className="bg-white/80 text-xs font-medium">
          {positions.length} {positions.length === 1 ? 'postoj' : 'postojů'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-8">
        {visibleIssueSections.length === 0 && positions.length > 0 && (
          <p className="text-sm text-gray-500">
            Pro vybrané téma zatím nemáme u této strany zaznamenané postoje. Zkuste vybrat jiné téma.
          </p>
        )}

        {visibleIssueSections.map(([issueId, issuePositions]) => {
          const issueMeta = issuesById.get(issueId);
          const averageValue = issuePositions.reduce((acc, pos) => acc + pos.value, 0) / issuePositions.length;
          const averageConfidence = Math.round(
            (issuePositions.reduce((acc, pos) => acc + pos.confidence, 0) / issuePositions.length) * 100
          );
          const sortedPositions = [...issuePositions].sort((a, b) => {
            const orderA = thesesById.get(a.thesisId)?.order ?? 0;
            const orderB = thesesById.get(b.thesisId)?.order ?? 0;
            return orderA - orderB;
          });

          return (
            <div key={issueId} className="space-y-4" id={issueId}>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {issueMeta?.title ?? issueId.replace('-', ' ')}
                </h3>
                {issueMeta?.description && (
                  <p className="text-sm text-gray-500 max-w-3xl">{issueMeta.description}</p>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <Badge variant="outline" className="bg-white/80">
                    {issuePositions.length} {issuePositions.length === 1 ? 'postoj' : 'postojů'}
                  </Badge>
                  <Badge variant="outline" className="bg-white/80" style={{ borderColor: colors.primary, color: colors.primary }}>
                    {formatAverageStance(averageValue)}
                  </Badge>
                  <Badge variant="outline" className="bg-white/80">
                    Důvěra {averageConfidence}%
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                {sortedPositions.map(position => {
                  const thesis = thesesById.get(position.thesisId);
                  if (!thesis) return null;

                  return (
                    <PartyPositionItem
                      key={position.thesisId}
                      position={position}
                      thesis={thesis}
                      colors={colors}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}

        {positions.length === 0 && (
          <p className="text-gray-500">Pro tuto stranu zatím nebyly zpracovány žádné postoje.</p>
        )}

        {positions.length > 0 && (
          <div className="pt-6 border-t border-gray-100 space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-700">Filtr tezí</h4>
              <p className="text-xs text-gray-500">Vyberte téma, které chcete u této strany prozkoumat. Výchozí zobrazení ukazuje všechny dostupné postoje.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={activeIssueId === 'all' ? 'secondary' : 'outline'}
                onClick={() => setActiveIssueId('all')}
                className="whitespace-nowrap"
              >
                Všechny teze
              </Button>
              {sortedIssues.map(([issueId]) => {
                const issueMeta = issuesById.get(issueId);
                return (
                  <Button
                    key={`filter-${issueId}`}
                    size="sm"
                    variant={activeIssueId === issueId ? 'secondary' : 'outline'}
                    onClick={() => setActiveIssueId(issueId)}
                    className="whitespace-nowrap"
                  >
                    {issueMeta?.title ?? issueId.replace('-', ' ')}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PartyProfilesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><div className="text-lg">Načítám profily...</div></div>}>
      <PartyProfilesContent />
    </Suspense>
  );
}





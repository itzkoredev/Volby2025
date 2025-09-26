'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Users, BarChart3, Activity } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Party } from '@/lib/types';
import { withBasePath } from '@/lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
  ChartDataset
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ALL_AGENCIES = 'ALL';
const TIMEFRAME_MONTHS = 2;
const MIN_TIMELINE_POINTS = 6;

interface PollResult {
  partyId: string;
  percentage: number | null;
  originalValue: string;
  note: string | null;
}

interface Poll {
  id: string;
  date: string;
  dateLabel: string;
  agency: string;
  client: string | null;
  source: string;
  results: PollResult[];
}

const partyColors: Record<string, { primary: string; light: string }> = {
  ano: { primary: '#0D47A1', light: '#E3F2FD' },
  spolu: { primary: '#2E7D32', light: '#E8F5E9' },
  stan: { primary: '#D81B60', light: '#FCE4EC' },
  spd: { primary: '#C62828', light: '#FFEBEE' },
  pirati: { primary: '#121212', light: '#F5F5F5' },
  stacilo: { primary: '#B71C1C', light: '#FFEBEE' },
  motoriste: { primary: '#29B6F6', light: '#E1F5FE' },
  prisaha: { primary: '#0D47A1', light: '#E3F2FD' },
  volt: { primary: '#502379', light: '#F3E5F5' },
  ceskarepublika1: { primary: '#8BC34A', light: '#F1F8E9' },
  slovan: { primary: '#795548', light: '#EFEBE9' }
};

const parseISODate = (value: string): Date | null => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

const formatFullDate = (date: Date) =>
  new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(date);

const formatShortDate = (date: Date) =>
  new Intl.DateTimeFormat('cs-CZ', {
    day: 'numeric',
    month: 'short'
  }).format(date);

const formatValue = (value: number | null) => {
  if (value === null || Number.isNaN(value)) {
    return '—';
  }
  return `${value.toLocaleString('cs-CZ', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })}%`;
};

const describeChange = (value: number) => {
  const rounded = value.toLocaleString('cs-CZ', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
  return `${value > 0 ? '+' : ''}${rounded} p.b.`;
};

export default function StemPollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParties, setSelectedParties] = useState<string[]>([]);
  const [showSecondaryParties, setShowSecondaryParties] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<string>('STEM');
  const [allPartyIds, setAllPartyIds] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pollsData, partiesData] = await Promise.all([
          fetch(withBasePath('/data/complete-polls.json')).then((response) => {
            if (!response.ok) {
              throw new Error('Nepodařilo se načíst data průzkumů');
            }
            return response.json();
          }),
          fetch(withBasePath('/data/parties.json')).then((response) => {
            if (!response.ok) {
              throw new Error('Nepodařilo se načíst data stran');
            }
            return response.json();
          })
        ]);

        const sortedPolls: Poll[] = pollsData.sort(
          (a: Poll, b: Poll) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setPolls(sortedPolls);
        setParties(partiesData);

        const ids = Array.from(
          new Set(sortedPolls.flatMap((poll) => poll.results.map((result) => result.partyId)))
        );
        setAllPartyIds(ids);
        setSelectedParties((previous) => (previous.length ? previous : ids));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Neočekávaná chyba');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const mainPartyIds = useMemo(
    () => new Set(parties.filter((party) => party.category === 'main').map((party) => party.id)),
    [parties]
  );

  const agencies = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    polls.forEach((poll) => {
      if (!seen.has(poll.agency)) {
        seen.add(poll.agency);
        list.push(poll.agency);
      }
    });
    return list;
  }, [polls]);

  const filteredPolls = useMemo(() => {
    if (selectedAgency === ALL_AGENCIES) {
      return polls;
    }
    return polls.filter((poll) => poll.agency === selectedAgency);
  }, [polls, selectedAgency]);

  const timeframePolls = useMemo(() => {
    if (!filteredPolls.length) {
      return [] as Poll[];
    }

    const latestDate = parseISODate(filteredPolls[0].date);

    if (!latestDate) {
      return [...filteredPolls].reverse();
    }

    const startDate = new Date(latestDate);
    startDate.setMonth(startDate.getMonth() - TIMEFRAME_MONTHS);

    const windowed = filteredPolls.filter((poll) => {
      const pollDate = parseISODate(poll.date);
      return pollDate ? pollDate.getTime() >= startDate.getTime() : false;
    });

    const ordered = (windowed.length ? windowed : filteredPolls.slice(0, MIN_TIMELINE_POINTS)).slice().reverse();

    return ordered;
  }, [filteredPolls]);

  const timeframeStart = timeframePolls.length ? parseISODate(timeframePolls[0].date) : null;
  const timeframeEnd = timeframePolls.length
    ? parseISODate(timeframePolls[timeframePolls.length - 1].date)
    : null;

  const getPartyName = useCallback(
    (partyId: string) => {
      const party = parties.find((item) => item.id === partyId);
      return party?.shortName || party?.name || partyId.toUpperCase();
    },
    [parties]
  );

  const getPartyColor = useCallback((partyId: string) => {
    return partyColors[partyId]?.primary || '#6B7280';
  }, []);

  const chartData = useMemo<ChartData<'line'>>(() => {
    if (!timeframePolls.length) {
      return { labels: [], datasets: [] };
    }

    const labels = timeframePolls.map((poll) => {
      const date = parseISODate(poll.date);
      return date ? formatShortDate(date) : poll.dateLabel || poll.date;
    });

    const datasets = selectedParties
      .map((partyId) => {
        const data = timeframePolls.map((poll) => {
          const result = poll.results.find((item) => item.partyId === partyId);
          return result?.percentage ?? null;
        });

        if (data.every((value) => value === null)) {
          return null;
        }

        const color = getPartyColor(partyId);
        const isMainParty = mainPartyIds.has(partyId);

        const dataset: ChartDataset<'line', (number | null)[]> = {
          label: getPartyName(partyId),
          data,
          borderColor: color,
          backgroundColor: `${color}26`,
          borderWidth: isMainParty ? 3 : 2,
          borderDash: isMainParty ? undefined : [6, 4],
          pointRadius: isMainParty ? 4 : 3,
          pointHoverRadius: 6,
          spanGaps: true,
          tension: 0.25
        };

        return dataset;
      })
      .filter((dataset): dataset is ChartDataset<'line', (number | null)[]> => dataset !== null);

    return { labels, datasets };
  }, [timeframePolls, selectedParties, getPartyColor, getPartyName, mainPartyIds]);

  const chartOptions: ChartOptions<'line'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 20,
          padding: 14,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'nearest',
        intersect: false,
        callbacks: {
          label: (context) => {
            if (context.parsed.y === null) {
              return `${context.dataset.label}: —`;
            }
            return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} %`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Datum měření'
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        suggestedMax: 35,
        title: {
          display: true,
          text: 'Preference (%)'
        }
      }
    }
  }), []);

  const timeframeAverages = useMemo(() => {
    if (!timeframePolls.length) {
      return [] as Array<{ partyId: string; average: number; change: number; samples: number }>;
    }

    const statistics = new Map<string, { sum: number; first: number | null; last: number | null; count: number }>();

    timeframePolls.forEach((poll) => {
      poll.results.forEach((result) => {
        if (result.percentage === null) {
          return;
        }

        const entry = statistics.get(result.partyId) || {
          sum: 0,
          first: null,
          last: null,
          count: 0
        };

        entry.sum += result.percentage;
        if (entry.first === null) {
          entry.first = result.percentage;
        }
        entry.last = result.percentage;
        entry.count += 1;
        statistics.set(result.partyId, entry);
      });
    });

    return Array.from(statistics.entries())
      .filter(([partyId]) => selectedParties.includes(partyId))
      .map(([partyId, entry]) => {
        const average = entry.count ? entry.sum / entry.count : 0;
        const change = entry.last !== null && entry.first !== null ? entry.last - entry.first : 0;
        return {
          partyId,
          average,
          change,
          samples: entry.count
        };
      })
      .sort((a, b) => b.average - a.average);
  }, [timeframePolls, selectedParties]);

  const trendHighlights = useMemo(() => {
    if (timeframePolls.length < 2) {
      return [] as Array<{ partyId: string; diff: number; latest: number; earliest: number }>;
    }

    const earliest = timeframePolls[0];
    const latest = timeframePolls[timeframePolls.length - 1];

    const highlights: Array<{ partyId: string; diff: number; latest: number; earliest: number }> = [];

    latest.results.forEach((latestResult) => {
      const early = earliest.results.find((item) => item.partyId === latestResult.partyId);
      if (!early || latestResult.percentage === null || early.percentage === null) {
        return;
      }
      const diff = latestResult.percentage - early.percentage;
      highlights.push({
        partyId: latestResult.partyId,
        diff,
        latest: latestResult.percentage,
        earliest: early.percentage
      });
    });

    return highlights
      .filter((item) => selectedParties.includes(item.partyId))
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
      .slice(0, 6);
  }, [timeframePolls, selectedParties]);

  const togglePartySelection = (partyId: string) => {
    setSelectedParties((previous) =>
      previous.includes(partyId)
        ? previous.filter((id) => id !== partyId)
        : [...previous, partyId]
    );
  };

  const selectMainParties = () => {
    setSelectedParties(allPartyIds.filter((id) => mainPartyIds.has(id)));
  };

  const selectAllParties = () => {
    setSelectedParties(allPartyIds);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Načítám průzkumy...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="p-6 max-w-md text-center">
          <p className="text-red-600 mb-4">⚠️ {error}</p>
          <Link href="/">
            <Button>Zpět do menu</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const latestPoll = filteredPolls.length ? filteredPolls[0] : null;
  const latestPartyCount = latestPoll?.results.filter((result) => result.percentage !== null).length ?? 0;
  const filteredCount = filteredPolls.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět do menu
            </Button>
          </Link>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Aktuální volební preference 2025
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Kompletní přehled průzkumů STEM, Median a NMS. Výchozí zobrazení ukazuje všechny sledované strany a vývoj za poslední dva měsíce.
            </p>
          </div>
        </div>

        {agencies.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[ALL_AGENCIES, ...agencies].map((agency) => (
                <Button
                  key={agency}
                  variant={selectedAgency === agency ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedAgency(agency)}
                >
                  {agency === ALL_AGENCIES ? 'Všechny agentury' : agency}
                </Button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600 mt-3">
              Zobrazuji {filteredCount} průzkumů{selectedAgency !== ALL_AGENCIES ? ` agentury ${selectedAgency}` : ''}.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Poslední měření</h3>
              <p className="text-2xl font-bold text-blue-600">
                {latestPoll ? formatFullDate(new Date(latestPoll.date)) : '—'}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Zdroje dat</h3>
              <p className="text-lg font-semibold text-gray-700">
                {latestPoll ? latestPoll.source : '—'}
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Počet průzkumů ve výběru</h3>
              <p className="text-2xl font-bold text-purple-600">{filteredCount}</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Strany v posledním měření</h3>
              <p className="text-2xl font-bold text-orange-600">{latestPartyCount}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
              Vývoj preferencí
            </CardTitle>
            <p className="text-gray-600">
              Výchozí výběr zobrazuje všechny strany. Můžete přepnout na hlavní strany nebo ručně odznačit konkrétní stranu.
            </p>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllParties}>
                    Vybrat všechny
                  </Button>
                  <Button variant="outline" size="sm" onClick={selectMainParties}>
                    Jen hlavní strany
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSecondaryParties((value) => !value)}
                  >
                    {showSecondaryParties ? 'Skrýt vedlejší strany' : 'Další strany'}
                  </Button>
                </div>
                <p className="text-sm text-gray-500">
                  Vybráno {selectedParties.length} z {allPartyIds.length} subjektů.
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Hlavní strany:</p>
                <div className="flex flex-wrap gap-2">
                  {allPartyIds
                    .filter((id) => mainPartyIds.has(id))
                    .map((partyId) => (
                      <button
                        key={partyId}
                        onClick={() => togglePartySelection(partyId)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                          selectedParties.includes(partyId)
                            ? 'text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={{
                          backgroundColor: selectedParties.includes(partyId)
                            ? getPartyColor(partyId)
                            : undefined
                        }}
                      >
                        {getPartyName(partyId)}
                      </button>
                    ))}
                </div>
              </div>

              {showSecondaryParties && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Vedlejší strany:</p>
                  <div className="flex flex-wrap gap-2">
                    {allPartyIds
                      .filter((id) => !mainPartyIds.has(id))
                      .map((partyId) => (
                        <button
                          key={partyId}
                          onClick={() => togglePartySelection(partyId)}
                          className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                            selectedParties.includes(partyId)
                              ? 'text-white shadow-lg'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          style={{
                            backgroundColor: selectedParties.includes(partyId)
                              ? getPartyColor(partyId)
                              : undefined
                          }}
                        >
                          {getPartyName(partyId)}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 mb-4">
              <span>
                Časové okno: {timeframeStart && timeframeEnd ? `${formatFullDate(timeframeStart)} – ${formatFullDate(timeframeEnd)}` : '—'}
              </span>
              <span>
                Datové body v grafu: {timeframePolls.length}
              </span>
            </div>

            <div style={{ height: '420px' }}>
              {chartData.datasets.length ? (
                <Line data={chartData} options={chartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Zvolená kombinace nemá dostatek dat pro graf.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {timeframeAverages.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Souhrn preference za poslední dva měsíce</CardTitle>
              <p className="text-sm text-gray-600">
                Průměrná hodnota vychází z průzkumů ve zvoleném časovém okně. Změna porovnává první a poslední dostupné měření.
              </p>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-gray-500">
                  <tr>
                    <th className="pb-2 pr-4">Strana</th>
                    <th className="pb-2 pr-4">Průměr</th>
                    <th className="pb-2 pr-4">Změna</th>
                    <th className="pb-2">Počet měření</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {timeframeAverages.map((stat) => (
                    <tr key={stat.partyId} className="hover:bg-gray-50">
                      <td className="py-2 pr-4 font-medium" style={{ color: getPartyColor(stat.partyId) }}>
                        {getPartyName(stat.partyId)}
                      </td>
                      <td className="py-2 pr-4">{formatValue(stat.average)}</td>
                      <td className={`py-2 pr-4 ${
                        stat.change > 0
                          ? 'text-green-600'
                          : stat.change < 0
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                      >
                        {describeChange(stat.change)}
                      </td>
                      <td className="py-2">{stat.samples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {latestPoll && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <BarChart3 className="h-6 w-6 mr-2 text-green-600" />
                Nejnovější průzkum ({formatFullDate(new Date(latestPoll.date))})
              </CardTitle>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Agentura:</strong> {latestPoll.agency}</p>
                {latestPoll.client && <p><strong>Médium:</strong> {latestPoll.client}</p>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...latestPoll.results]
                  .filter((result) => result.percentage !== null)
                  .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
                  .map((result, index) => {
                    const changeEntry = trendHighlights.find((item) => item.partyId === result.partyId);
                    return (
                      <motion.div
                        key={result.partyId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.08 }}
                      >
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <div
                                  className="w-4 h-4 rounded-full mr-3"
                                  style={{ backgroundColor: getPartyColor(result.partyId) }}
                                />
                                <div>
                                  <h4 className="font-semibold text-sm">
                                    {getPartyName(result.partyId)}
                                  </h4>
                                  <div className="flex items-center mt-1 text-xs">
                                    {changeEntry ? (
                                      changeEntry.diff > 0 ? (
                                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                                      ) : changeEntry.diff < 0 ? (
                                        <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                                      ) : null
                                    ) : null}
                                    <span
                                      className={`${
                                        changeEntry
                                          ? changeEntry.diff > 0
                                            ? 'text-green-600'
                                            : changeEntry.diff < 0
                                            ? 'text-red-600'
                                            : 'text-gray-500'
                                          : 'text-gray-500'
                                      }`}
                                    >
                                      {changeEntry ? describeChange(changeEntry.diff) : '—'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold" style={{ color: getPartyColor(result.partyId) }}>
                                  {formatValue(result.percentage)}
                                </div>
                                <div className="text-xs text-gray-500">#{index + 1}</div>
                              </div>
                            </div>

                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="h-2 rounded-full transition-all duration-500"
                                  style={{
                                    width: `${((result.percentage ?? 0) / 35) * 100}%`,
                                    backgroundColor: getPartyColor(result.partyId)
                                  }}
                                />
                              </div>
                            </div>

                            {result.note && (
                              <p className="text-xs text-gray-500 mt-2">
                                Deklarováno jako &bdquo;{result.note}&ldquo;.
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Calendar className="h-6 w-6 mr-2 text-purple-600" />
              Historie průzkumů
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPolls.map((poll, index) => (
                <motion.div
                  key={poll.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 gap-2">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {formatFullDate(new Date(poll.date))}
                      </h4>
                      <p className="text-sm text-gray-600">{poll.source}</p>
                    </div>
                    <div className="text-sm text-gray-500 text-right">
                      <p>Prvních pět stran</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[...poll.results]
                      .filter((result) => result.percentage !== null)
                      .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
                      .slice(0, 5)
                      .map((result) => (
                        <span
                          key={`${poll.id}-${result.partyId}`}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{ backgroundColor: getPartyColor(result.partyId) }}
                        >
                          {getPartyName(result.partyId)}: {formatValue(result.percentage)}
                        </span>
                      ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {trendHighlights.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-xl">Největší pohyby v okně {TIMEFRAME_MONTHS} měsíců</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {trendHighlights.map((item) => (
                  <li key={item.partyId} className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-semibold" style={{ color: getPartyColor(item.partyId) }}>
                      {getPartyName(item.partyId)}
                    </span>
                    <span className={item.diff >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                      {describeChange(item.diff)}
                    </span>
                    <span className="text-gray-500">
                      ({formatValue(item.earliest)} {'->'} {formatValue(item.latest)})
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}




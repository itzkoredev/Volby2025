'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Users, BarChart3, Activity } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Party } from '@/lib/types';
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
  ChartOptions
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

interface PollResult {
  partyId: string;
  percentage: number;
  change: string;
}

interface Poll {
  id: string;
  date: string;
  agency: string;
  sampleSize: number;
  methodology: string;
  results: PollResult[];
}

// Barevné schéma pro politické strany
const partyColors: Record<string, { primary: string; light: string }> = {
  'ano': { primary: '#663399', light: '#F3E8FF' },
  'spolu': { primary: '#1976D2', light: '#E3F2FD' },
  'stan': { primary: '#FFB300', light: '#FFF9C4' },
  'spd': { primary: '#D32F2F', light: '#FFEBEE' },
  'pirati': { primary: '#000000', light: '#F5F5F5' },
  'stacilo': { primary: '#C62828', light: '#FFEBEE' },
  'motoriste': { primary: '#FF6F00', light: '#FFF3E0' },
  'prisaha': { primary: '#1565C0', light: '#E3F2FD' },
  'volt': { primary: '#502379', light: '#F3E5F5' },
  'ceskarepublika1': { primary: '#8BC34A', light: '#F1F8E9' },
  'slovan': { primary: '#795548', light: '#EFEBE9' },
};

async function loadPolls(): Promise<Poll[]> {
  const response = await fetch('/data/stem-polls.json');
  if (!response.ok) {
    throw new Error('Nepodařilo se načíst data průzkumů');
  }
  return response.json();
}

async function loadParties(): Promise<Party[]> {
  const response = await fetch('/data/parties.json');
  if (!response.ok) {
    throw new Error('Nepodařilo se načíst data stran');
  }
  return response.json();
}

export default function StemPollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParties, setSelectedParties] = useState<string[]>(['ano', 'spolu', 'stan', 'spd', 'pirati', 'stacilo', 'motoriste']);
  const [showSecondaryParties, setShowSecondaryParties] = useState<boolean>(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pollsData, partiesData] = await Promise.all([
          loadPolls(),
          loadParties()
        ]);
        setPolls(pollsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setParties(partiesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Neočekávaná chyba');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getPartyName = (partyId: string): string => {
    const party = parties.find(p => p.id === partyId);
    return party?.shortName || party?.name || partyId;
  };

  const getPartyColor = (partyId: string): string => {
    return partyColors[partyId]?.primary || '#6B7280';
  };

  const generateTrendChartData = (): ChartData<'line'> => {
    const filteredPolls = polls.slice(0, 6).reverse(); // Posledních 6 průzkumů, od nejstarších
    
    const datasets = selectedParties.map(partyId => {
      const data = filteredPolls.map(poll => {
        const result = poll.results.find(r => r.partyId === partyId);
        return result ? result.percentage : 0;
      });

      return {
        label: getPartyName(partyId),
        data,
        borderColor: getPartyColor(partyId),
        backgroundColor: getPartyColor(partyId) + '20',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 3,
      };
    });

    return {
      labels: filteredPolls.map(poll => new Date(poll.date).toLocaleDateString('cs-CZ', { month: 'short', day: 'numeric' })),
      datasets,
    };
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 20,
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}%`;
          }
        }
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Datum průzkumu'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Preference (%)'
        },
        beginAtZero: true,
        max: 35
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const togglePartySelection = (partyId: string) => {
    setSelectedParties(prev => 
      prev.includes(partyId) 
        ? prev.filter(id => id !== partyId)
        : [...prev, partyId]
    );
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
          <p className="text-red-600 mb-4">❌ {error}</p>
          <Link href="/">
            <Button>Zpět na hlavní stránku</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const latestPoll = polls[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/party-profiles">
            <Button variant="outline" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zpět na profily stran
            </Button>
          </Link>
          
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Průzkumy STEM
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Aktuální preference politických stran podle agentury STEM
            </p>
          </div>
        </div>

        {/* Statistiky */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <CardContent className="pt-6">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Poslední průzkum</h3>
              <p className="text-2xl font-bold text-blue-600">
                {new Date(latestPoll?.date || '').toLocaleDateString('cs-CZ')}
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Velikost vzorku</h3>
              <p className="text-2xl font-bold text-green-600">
                {latestPoll?.sampleSize || 0}
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Počet průzkumů</h3>
              <p className="text-2xl font-bold text-purple-600">
                {polls.length}
              </p>
            </CardContent>
          </Card>
          
          <Card className="text-center">
            <CardContent className="pt-6">
              <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-gray-800">Sledované strany</h3>
              <p className="text-2xl font-bold text-orange-600">
                {latestPoll?.results.length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Vývoj preferencí - Graf */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
              Vývoj preferencí za poslední 2 měsíce
            </CardTitle>
            <p className="text-gray-600">Klikněte na strany níže pro výběr zobrazených dat</p>
          </CardHeader>
          <CardContent>
            {/* Výběr stran */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Zobrazené strany:</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSecondaryParties(!showSecondaryParties)}
                >
                  {showSecondaryParties ? 'Skrýt vedlejší strany' : 'Zobrazit všechny strany'}
                </Button>
              </div>
              
              {/* Hlavní strany */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Hlavní strany:</p>
                <div className="flex flex-wrap gap-2">
                  {parties.filter(p => p.category === 'main').map(party => (
                    <button
                      key={party.id}
                      onClick={() => togglePartySelection(party.id)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        selectedParties.includes(party.id)
                          ? 'text-white shadow-lg'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      style={{
                        backgroundColor: selectedParties.includes(party.id) ? getPartyColor(party.id) : undefined
                      }}
                    >
                      <span className="mr-1">{party.shortName || party.name}</span>
                      <span className="text-xs opacity-75">({party.pollPercentage || 0}%)</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vedlejší strany - pouze pokud jsou zapnuté */}
              {showSecondaryParties && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">Ostatní strany:</p>
                  <div className="flex flex-wrap gap-2">
                    {parties.filter(p => p.category === 'secondary').map(party => (
                      <button
                        key={party.id}
                        onClick={() => togglePartySelection(party.id)}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                          selectedParties.includes(party.id)
                            ? 'text-white shadow-lg'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={{
                          backgroundColor: selectedParties.includes(party.id) ? getPartyColor(party.id) : undefined
                        }}
                      >
                        <span className="mr-1">{party.shortName || party.name}</span>
                        <span className="opacity-75">({party.pollPercentage || 0}%)</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Graf */}
            <div style={{ height: '400px' }}>
              <Line data={generateTrendChartData()} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* Nejnovější výsledky */}
        {latestPoll && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <BarChart3 className="h-6 w-6 mr-2 text-green-600" />
                Nejnovější průzkum ({new Date(latestPoll.date).toLocaleDateString('cs-CZ')})
              </CardTitle>
              <div className="text-sm text-gray-600">
                <p><strong>Agentura:</strong> {latestPoll.agency}</p>
                <p><strong>Velikost vzorku:</strong> {latestPoll.sampleSize} respondentů</p>
                <p><strong>Metodologie:</strong> {latestPoll.methodology}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {latestPoll.results
                  .sort((a, b) => b.percentage - a.percentage)
                  .map((result, index) => {
                    const party = parties.find(p => p.id === result.partyId);
                    const changeNum = parseFloat(result.change);
                    
                    return (
                      <motion.div
                        key={result.partyId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
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
                                    {party?.shortName || party?.name || result.partyId}
                                  </h4>
                                  <div className="flex items-center mt-1">
                                    {changeNum > 0 ? (
                                      <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                                    ) : changeNum < 0 ? (
                                      <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                                    ) : null}
                                    <span className={`text-xs ${
                                      changeNum > 0 ? 'text-green-600' : 
                                      changeNum < 0 ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                      {result.change}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold" style={{ color: getPartyColor(result.partyId) }}>
                                  {result.percentage}%
                                </div>
                                <div className="text-xs text-gray-500">
                                  #{index + 1}
                                </div>
                              </div>
                            </div>
                            
                            {/* Progress bar */}
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${(result.percentage / 35) * 100}%`,
                                    backgroundColor: getPartyColor(result.partyId)
                                  }}
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Historie průzkumů */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Calendar className="h-6 w-6 mr-2 text-purple-600" />
              Historie průzkumů
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {polls.map((poll, index) => (
                <motion.div
                  key={poll.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {new Date(poll.date).toLocaleDateString('cs-CZ', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {poll.agency} • {poll.sampleSize} respondentů
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Top 3 strany
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {poll.results
                      .sort((a, b) => b.percentage - a.percentage)
                      .slice(0, 5)
                      .map((result) => {
                        const party = parties.find(p => p.id === result.partyId);
                        return (
                          <span
                            key={result.partyId}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
                            style={{ backgroundColor: getPartyColor(result.partyId) }}
                          >
                            {party?.shortName || result.partyId}: {result.percentage}%
                          </span>
                        );
                      })}
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* Metodologie */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Metodologie průzkumů STEM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose text-gray-600">
              <p className="mb-3">
                <strong>STEM (Středisko empirických výzkumů)</strong> provádí pravidelné průzkumy politických preferencí pomocí metody CATI (Computer Assisted Telephone Interviewing).
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Reprezentativní vzorek obyvatel ČR starších 18 let</li>
                <li>Velikost vzorku obvykle 1000+ respondentů</li>
                <li>Stratifikace podle věku, pohlaví, vzdělání a regionu</li>
                <li>Statistická chyba cca ±3% při 95% intervalu spolehlivosti</li>
                <li>Data jsou vážena podle demografických charakteristik populace</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
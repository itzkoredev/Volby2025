'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Users, TrendingUp, Calendar, Globe } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Party } from '@/lib/types';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Barevné schéma pro politické strany podle jejich oficiálních barev
const partyColors: Record<string, { primary: string; secondary: string; accent: string; light: string }> = {
  'ano': { primary: '#663399', secondary: '#8A4FBE', accent: '#B366D9', light: '#F3E8FF' },
  'ods': { primary: '#0052CC', secondary: '#336BD6', accent: '#6699FF', light: '#E6F2FF' },
  'stan': { primary: '#FFB300', secondary: '#FFC107', accent: '#FFD54F', light: '#FFF9C4' },
  'spolu': { primary: '#1976D2', secondary: '#42A5F5', accent: '#64B5F6', light: '#E3F2FD' },
  'spd': { primary: '#D32F2F', secondary: '#F44336', accent: '#EF5350', light: '#FFEBEE' },
  'pirati': { primary: '#000000', secondary: '#333333', accent: '#666666', light: '#F5F5F5' },
  'stacilo': { primary: '#C62828', secondary: '#E53935', accent: '#F44336', light: '#FFEBEE' },
  'motoriste': { primary: '#FF6F00', secondary: '#FF9800', accent: '#FFB74D', light: '#FFF3E0' },
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

interface ChartDataType {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    pointBackgroundColor?: string;
  }>;
}

async function loadParties(): Promise<Party[]> {
  const response = await fetch('/data/parties.json');
  if (!response.ok) {
    throw new Error('Nepodařilo se načíst data stran');
  }
  return response.json();
}

export default function PartyProfilesPage() {
  const [parties, setParties] = useState<Party[]>([]);
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchParties() {
      try {
        const partiesData = await loadParties();
        // Řazení podle průzkumů (nejvyšší procenta první)
        const sortedParties = partiesData.sort((a, b) => {
          const aPercent = a.pollPercentage || 0;
          const bPercent = b.pollPercentage || 0;
          return bPercent - aPercent;
        });
        setParties(sortedParties);
        setLoading(false);
      } catch (err) {
        console.error('Chyba při načítání stran:', err);
        setError('Nepodařilo se načíst data stran');
        setLoading(false);
      }
    }

    fetchParties();
  }, []);

  const getPartyColor = (partyId: string) => {
    return partyColors[partyId] || { 
      primary: '#666666', 
      secondary: '#888888', 
      accent: '#AAAAAA', 
      light: '#F5F5F5' 
    };
  };

  const generateMockData = (partyId: string): { spectrumData: ChartDataType; supportData: ChartDataType } => {
    // Mock data pro demonstrační účely - v reálné aplikaci by tato data přišla z API
    const spectrumData: ChartDataType = {
      labels: ['Ekonomika', 'Sociální politika', 'Bezpečnost', 'Životní prostředí', 'EU', 'Migrace'],
      datasets: [{
        label: 'Pozice strany',
        data: [
          Math.floor(Math.random() * 10) + 1,
          Math.floor(Math.random() * 10) + 1,
          Math.floor(Math.random() * 10) + 1,
          Math.floor(Math.random() * 10) + 1,
          Math.floor(Math.random() * 10) + 1,
          Math.floor(Math.random() * 10) + 1
        ],
        backgroundColor: getPartyColor(partyId).accent + '40',
        borderColor: getPartyColor(partyId).primary,
        borderWidth: 2,
        pointBackgroundColor: getPartyColor(partyId).primary
      }]
    };

    const supportData: ChartDataType = {
      labels: ['18-29', '30-44', '45-59', '60+'],
      datasets: [{
        label: 'Podpora podle věku (%)',
        data: [
          Math.floor(Math.random() * 30) + 10,
          Math.floor(Math.random() * 35) + 15,
          Math.floor(Math.random() * 25) + 10,
          Math.floor(Math.random() * 20) + 5
        ],
        backgroundColor: [
          getPartyColor(partyId).accent + '80',
          getPartyColor(partyId).accent + '60',
          getPartyColor(partyId).accent + '40',
          getPartyColor(partyId).accent + '20'
        ],
        borderColor: getPartyColor(partyId).primary,
        borderWidth: 2
      }]
    };

    return { spectrumData, supportData };
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
        {/* Header */}
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

        {selectedParty ? (
          /* Detailní profil vybrané strany */
          <DetailedPartyProfile 
            party={selectedParty} 
            onBack={() => setSelectedParty(null)}
            colors={getPartyColor(selectedParty.id)}
            mockData={generateMockData(selectedParty.id)}
          />
        ) : (
          <div className="space-y-12">
            {/* Hlavní strany */}
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Hlavní politické strany</h2>
                <p className="text-gray-600">Strany s nejvyšší podporou a největším vlivem na politickou scénu</p>
              </div>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {parties
                  .filter(party => party.category === 'main')
                  .map((party, index) => (
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
                        isMainParty={true}
                      />
                    </motion.div>
                  ))}
              </motion.div>
            </section>

            {/* Vedlejší strany */}
            <section>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Ostatní politické strany</h2>
                <p className="text-gray-500 text-sm">Další strany a hnutí na politické scéně</p>
              </div>
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {parties
                  .filter(party => party.category === 'secondary')
                  .map((party, index) => (
                    <motion.div
                      key={party.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.03 }}
                    >
                      <PartyCard 
                        party={party} 
                        colors={getPartyColor(party.id)}
                        onClick={() => setSelectedParty(party)}
                        isMainParty={false}
                      />
                    </motion.div>
                  ))}
              </motion.div>
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
}

function PartyCard({ party, colors, onClick, isMainParty = true }: PartyCardProps) {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card 
        className={`cursor-pointer overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
          isMainParty ? 'h-52' : 'h-36'
        }`}
        style={{ 
          background: `linear-gradient(135deg, ${colors.light} 0%, white 100%)`,
          borderTop: `${isMainParty ? '4px' : '2px'} solid ${colors.primary}`,
          opacity: isMainParty ? 1 : 0.9
        }}
        onClick={onClick}
      >
        <CardHeader className={`${isMainParty ? 'pb-3' : 'pb-2'}`}>
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
        <CardContent className="pt-0">
          {/* Popis - vždy zobrazit, ale kratší pro vedlejší strany */}
          <p className={`text-sm text-gray-600 mb-4 ${isMainParty ? 'line-clamp-3' : 'line-clamp-2'}`}>
            {party.description || 'Informace o straně nejsou k dispozici.'}
          </p>
          
          <div className="flex items-center justify-between">
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
  mockData: {
    spectrumData: ChartDataType;
    supportData: ChartDataType;
  };
}

function DetailedPartyProfile({ party, colors, onBack, mockData }: DetailedPartyProfileProps) {
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 2
        }
      }
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 50
      }
    }
  };

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

      {/* Hlavní obsah */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Základní informace */}
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

        {/* Politické spektrum */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: colors.primary }}>
              <TrendingUp className="h-5 w-5 mr-2" />
              Politické postoje
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Radar data={mockData.spectrumData} options={chartOptions} />
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Hodnocení pozic strany v klíčových oblastech (1-10)
            </p>
          </CardContent>
        </Card>

        {/* Podpora podle věkových skupin */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: colors.primary }}>
              <Users className="h-5 w-5 mr-2" />
              Demografická podpora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={mockData.supportData} options={barChartOptions} />
            </div>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Odhad podpory podle věkových skupin (demo data)
            </p>
          </CardContent>
        </Card>

        {/* Klíčové politiky */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center" style={{ color: colors.primary }}>
              <TrendingUp className="h-5 w-5 mr-2" />
              Programové priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Mock klíčové body - v reálné aplikaci by se načetly z dat */}
              {[
                'Ekonomický růst a konkurenceschopnost',
                'Sociální spravedlnost a solidarita', 
                'Bezpečnost a obrana',
                'Životní prostředí a udržitelnost',
                'Digitalizace a inovace'
              ].map((item, index) => (
                <div key={index} className="flex items-center p-3 rounded-lg" style={{ backgroundColor: colors.light }}>
                  <div 
                    className="w-3 h-3 rounded-full mr-3 flex-shrink-0"
                    style={{ backgroundColor: colors.primary }}
                  ></div>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Nové sekce */}
      <div className="mt-8 space-y-8">
        {/* PRO a PROTI */}
        {(party.pros || party.cons) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {party.pros && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-600">
                    <Users className="h-5 w-5 mr-2" />
                    Pro stranu hovoří
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {party.pros.map((pro, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {party.cons && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-600">
                    <Users className="h-5 w-5 mr-2" />
                    Proti straně hovoří
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {party.cons.map((con, index) => (
                      <li key={index} className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700">{con}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Představitelé */}
        {party.representatives && party.representatives.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center" style={{ color: colors.primary }}>
                <Users className="h-5 w-5 mr-2" />
                Klíčoví představitelé
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {party.representatives.map((rep, index) => (
                  <div key={index} className="text-center">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden bg-gray-200">
                      {rep.photo ? (
                        <img 
                          src={rep.photo} 
                          alt={rep.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                            if (nextElement) nextElement.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full flex items-center justify-center text-white font-bold text-xl ${rep.photo ? 'hidden' : ''}`}
                        style={{ backgroundColor: colors.primary }}
                      >
                        {rep.name.charAt(0)}
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-800">{rep.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{rep.position}</p>
                    {rep.bio && (
                      <p className="text-xs text-gray-500 line-clamp-2">{rep.bio}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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
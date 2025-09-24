'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateScores, ScoreResult, generateDetailedComparison } from '@/lib/scoring';
import { Party, PartyPosition, Thesis, UserAnswer } from '@/lib/types';

// Načítání dat
async function loadData(): Promise<{ parties: Party[]; positions: PartyPosition[]; theses: Thesis[] }> {
  const [partiesRes, positionsRes, thesesRes] = await Promise.all([
    fetch('/data/parties.json'),
    fetch('/data/party_positions.json'),
    fetch('/data/theses.json')
  ]);

  if (!partiesRes.ok || !positionsRes.ok || !thesesRes.ok) {
    throw new Error('Nepodařilo se načíst potřebná data pro výsledky');
  }

  return {
    parties: await partiesRes.json(),
    positions: await positionsRes.json(),
    theses: await thesesRes.json(),
  };
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<ScoreResult[]>([]);
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function calculateAndSetResults() {
      const answersParam = searchParams.get('answers');
      if (!answersParam) {
        setError('Chybí data odpovědí pro výpočet výsledků.');
        setLoading(false);
        return;
      }

      try {
        const answers: Record<string, UserAnswer> = JSON.parse(answersParam);
        const { parties, positions, theses } = await loadData();
        
        const scoreResults = calculateScores(answers, positions, parties);
        setResults(scoreResults);
        setTheses(theses);
      } catch (err) {
        console.error("Chyba při výpočtu výsledků:", err);
        setError(err instanceof Error ? err.message : 'Neznámá chyba při zpracování výsledků.');
      } finally {
        setLoading(false);
      }
    }

    calculateAndSetResults();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Počítám vaše výsledky...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/calculator">
          <Button>Zpět do kalkulačky</Button>
        </Link>
      </div>
    );
  }

  const topResult = results[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Vaše výsledky</h1>
        <p className="text-gray-600">
          Přehled vaší politické shody s kandidujícími stranami.
        </p>
      </div>

      {/* Zobrazení výsledků */}
      <div className="space-y-6">
        {results.map((result, index) => (
          <ResultCard 
            key={result.partyId} 
            result={result} 
            theses={theses}
            isTopResult={index === 0}
          />
        ))}
      </div>

      <div className="mt-8 text-center">
        <Link href="/calculator-setup">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zpět na začátek
          </Button>
        </Link>
      </div>
    </div>
  );
}

interface ResultCardProps {
  result: ScoreResult;
  theses: Thesis[];
  isTopResult: boolean;
}

function ResultCard({ result, theses, isTopResult }: ResultCardProps) {
  const [isExpanded, setIsExpanded] = useState(isTopResult);
  const answersParam = useSearchParams().get('answers');
  const userAnswers: Record<string, UserAnswer> = answersParam ? JSON.parse(answersParam) : {};
  
  const comparison = generateDetailedComparison(userAnswers, result);
  const thesesById = new Map(theses.map(t => [t.id, t]));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={`overflow-hidden ${isTopResult ? 'border-2 border-blue-500 shadow-xl' : 'shadow-lg'}`}>
        <CardHeader 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer p-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-4">
            <div className="text-2xl font-bold w-12 text-center">{Math.round(result.agreementPercentage)}%</div>
            <div className="w-1 h-12 bg-gray-200 rounded-full"></div>
            <div>
              <CardTitle className="text-xl">{result.partyName}</CardTitle>
              <p className="text-sm text-gray-500">Shoda s vašimi postoji</p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <Progress value={result.agreementPercentage} className="w-full sm:w-48 h-3" />
          </div>
        </CardHeader>
        
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="p-4 pt-0">
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shody */}
                  <div>
                    <h4 className="font-semibold text-green-600 flex items-center mb-3">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Největší shody
                    </h4>
                    <ul className="space-y-3 text-sm">
                      {comparison.strongAgreements.slice(0, 3).map(item => {
                        const thesis = thesesById.get(item.thesisId);
                        return (
                          <li key={item.thesisId} className="p-3 bg-green-50 rounded-md hover:bg-green-100 transition-colors">
                            <p className="text-gray-800 font-medium">{thesis?.text}</p>
                            <Link href={`/party-profiles?party=${result.partyId}#${thesis?.issueId}`} className="text-xs text-green-700 hover:underline flex items-center mt-1">
                              Jak to vidí {result.partyName}? <ExternalLink className="h-3 w-3 ml-1" />
                            </Link>
                          </li>
                        );
                      })}
                       {comparison.strongAgreements.length === 0 && <p className="text-gray-500 text-xs">Nenalezeny žádné silné shody.</p>}
                    </ul>
                  </div>
                  {/* Neshody */}
                  <div>
                    <h4 className="font-semibold text-red-600 flex items-center mb-3">
                      <XCircle className="h-5 w-5 mr-2" />
                      Největší neshody
                    </h4>
                    <ul className="space-y-3 text-sm">
                      {comparison.strongDisagreements.slice(0, 3).map(item => {
                        const thesis = thesesById.get(item.thesisId);
                        return (
                          <li key={item.thesisId} className="p-3 bg-red-50 rounded-md hover:bg-red-100 transition-colors">
                            <p className="text-gray-800 font-medium">{thesis?.text}</p>
                             <Link href={`/party-profiles?party=${result.partyId}#${thesis?.issueId}`} className="text-xs text-red-700 hover:underline flex items-center mt-1">
                              Jak to vidí {result.partyName}? <ExternalLink className="h-3 w-3 ml-1" />
                            </Link>
                          </li>
                        );
                      })}
                      {comparison.strongDisagreements.length === 0 && <p className="text-gray-500 text-xs">Nenalezeny žádné silné neshody.</p>}
                    </ul>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <Link href={`/party-profiles?party=${result.partyId}`}>
                    <Button variant="secondary">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Zobrazit kompletní profil strany
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}


export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Načítám výsledky...</div>
        </div>
      }>
        <ResultsContent />
      </Suspense>
    </div>
  );
}
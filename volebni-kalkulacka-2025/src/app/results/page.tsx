'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, CheckCircle, XCircle, ExternalLink, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateScores, ScoreResult, generateDetailedComparison } from '@/lib/scoring';
import { Party, PartyPosition, Thesis, UserAnswer } from '@/lib/types';

import { knowledgeBase } from '@shared/knowledge-base/entries';
import { getPartyKnowledgeId } from '@shared/knowledge-base/mappings';
import type { KnowledgeEntry } from '@shared/knowledge-base/types';

// NaÄŤĂ­tĂˇnĂ­ dat
const knowledgeById = new Map(knowledgeBase.map((entry) => [entry.id, entry]));
const getKnowledgeEntryForParty = (partyId: string): KnowledgeEntry | undefined => {
  const knowledgeId = getPartyKnowledgeId(partyId);
  return knowledgeId ? knowledgeById.get(knowledgeId) : undefined;
};

async function loadData(): Promise<{ parties: Party[]; positions: PartyPosition[]; theses: Thesis[] }> {
  const [partiesRes, positionsRes, thesesRes] = await Promise.all([
    fetch('/data/parties.json'),
    fetch('/data/party_positions.json'),
    fetch('/data/theses.json')
  ]);

  if (!partiesRes.ok || !positionsRes.ok || !thesesRes.ok) {
    throw new Error('NepodaĹ™ilo se naÄŤĂ­st potĹ™ebnĂˇ data pro vĂ˝sledky');
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
        setError('ChybĂ­ data odpovÄ›dĂ­ pro vĂ˝poÄŤet vĂ˝sledkĹŻ.');
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
        console.error("Chyba pĹ™i vĂ˝poÄŤtu vĂ˝sledkĹŻ:", err);
        setError(err instanceof Error ? err.message : 'NeznĂˇmĂˇ chyba pĹ™i zpracovĂˇnĂ­ vĂ˝sledkĹŻ.');
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
        <p className="text-gray-600">PoÄŤĂ­tĂˇm vaĹˇe vĂ˝sledky...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link href="/calculator">
          <Button>ZpÄ›t do kalkulaÄŤky</Button>
        </Link>
      </div>
    );
  }

  const topResult = results[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">VaĹˇe vĂ˝sledky</h1>
        <p className="text-gray-600">
          PĹ™ehled vaĹˇĂ­ politickĂ© shody s kandidujĂ­cĂ­mi stranami.
        </p>
      </div>

      {/* ZobrazenĂ­ vĂ˝sledkĹŻ */}
      <div className="space-y-6">
        {results.map((result, index) => {
          const knowledgeEntry = getKnowledgeEntryForParty(result.partyId);
          return (
            <ResultCard
              key={result.partyId}
              result={result}
              theses={theses}
              isTopResult={index === 0}
              knowledgeEntry={knowledgeEntry}
            />
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link href="/calculator-setup">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            ZpÄ›t na zaÄŤĂˇtek
          </Button>
        </Link>
      </div>
    </div>
  );
}

interface ResultCardProps {\r\n  result: ScoreResult;\r\n  theses: Thesis[];\r\n  isTopResult: boolean;\r\n  knowledgeEntry?: KnowledgeEntry;\r\n}

function ResultCard({ result, theses, isTopResult, knowledgeEntry }: ResultCardProps) {
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
              <p className="text-sm text-gray-500">Shoda s vaĹˇimi postoji</p>
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
              {knowledgeEntry && (
                <div className="mb-5 rounded-xl border border-slate-200/60 bg-white/80 p-5 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/60">
                  <div className="flex items-center gap-3 text-indigo-600">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Knowledge base</p>
                      <p className="text-xs text-slate-500">Shrnutí z ověřených zdrojů</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">{knowledgeEntry.summary}</p>
                  <ul className="mt-4 space-y-2">
                    {knowledgeEntry.highlights.slice(0, 3).map((highlight, idx) => (
                      <li
                        key={`${knowledgeEntry.id}-${idx}`}
                        className="flex items-start gap-3 text-sm text-slate-600"
                      >
                        <span className="mt-0.5 inline-flex min-w-[64px] justify-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-indigo-700">
                          {(highlight.emphasis ?? 'info').toUpperCase()}
                        </span>
                        <span>{highlight.bullet}</span>
                      </li>
                    ))}
                  </ul>
                  {knowledgeEntry.sources[0] && (
                    <a
                      href={knowledgeEntry.sources[0].url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      Zdroj: {knowledgeEntry.sources[0].label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              )}
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Shody */}
                  <div>
                    <h4 className="font-semibold text-green-600 flex items-center mb-3">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      NejvÄ›tĹˇĂ­ shody
                    </h4>
                    <ul className="space-y-3 text-sm">
                      {comparison.strongAgreements.slice(0, 3).map(item => {
                        const thesis = thesesById.get(item.thesisId);
                        return (
                          <li key={item.thesisId} className="p-3 bg-green-50 rounded-md hover:bg-green-100 transition-colors">
                            <p className="text-gray-800 font-medium">{thesis?.text}</p>
                            <Link href={`/party-profiles?party=${result.partyId}#${thesis?.issueId}`} className="text-xs text-green-700 hover:underline flex items-center mt-1">
                              Jak to vidĂ­ {result.partyName}? <ExternalLink className="h-3 w-3 ml-1" />
                            </Link>
                          </li>
                        );
                      })}
                       {comparison.strongAgreements.length === 0 && <p className="text-gray-500 text-xs">Nenalezeny ĹľĂˇdnĂ© silnĂ© shody.</p>}
                    </ul>
                  </div>
                  {/* Neshody */}
                  <div>
                    <h4 className="font-semibold text-red-600 flex items-center mb-3">
                      <XCircle className="h-5 w-5 mr-2" />
                      NejvÄ›tĹˇĂ­ neshody
                    </h4>
                    <ul className="space-y-3 text-sm">
                      {comparison.strongDisagreements.slice(0, 3).map(item => {
                        const thesis = thesesById.get(item.thesisId);
                        return (
                          <li key={item.thesisId} className="p-3 bg-red-50 rounded-md hover:bg-red-100 transition-colors">
                            <p className="text-gray-800 font-medium">{thesis?.text}</p>
                             <Link href={`/party-profiles?party=${result.partyId}#${thesis?.issueId}`} className="text-xs text-red-700 hover:underline flex items-center mt-1">
                              Jak to vidĂ­ {result.partyName}? <ExternalLink className="h-3 w-3 ml-1" />
                            </Link>
                          </li>
                        );
                      })}
                      {comparison.strongDisagreements.length === 0 && <p className="text-gray-500 text-xs">Nenalezeny ĹľĂˇdnĂ© silnĂ© neshody.</p>}
                    </ul>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <Link href={`/party-profiles?party=${result.partyId}`}>
                    <Button variant="secondary">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Zobrazit kompletnĂ­ profil strany
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
          <div className="text-lg">NaÄŤĂ­tĂˇm vĂ˝sledky...</div>
        </div>
      }>
        <ResultsContent />
      </Suspense>
    </div>
  );
}





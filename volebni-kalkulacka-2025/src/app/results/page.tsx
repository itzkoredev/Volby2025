'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ExternalLink, Share2, Download } from 'lucide-react';
import Link from 'next/link';
import { calculateScores, ScoreResult } from '@/lib/scoring';
import { UserAnswer, Party, PartyPosition } from '@/lib/types';
import jsPDF from 'jspdf';

interface UserProfile {
  testLength: string;
  age?: string;
  education?: string;
  region?: string;
  interests?: string[];
}

// Načítání reálných dat z JSON souborů
async function loadParties(): Promise<Party[]> {
  const response = await fetch('/data/parties.json');
  if (!response.ok) {
    throw new Error('Nepodařilo se načíst data stran');
  }
  return response.json();
}

async function loadPartyPositions(): Promise<PartyPosition[]> {
  const response = await fetch('/data/party_positions.json');
  if (!response.ok) {
    throw new Error('Nepodařilo se načíst pozice stran');
  }
  return response.json();
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<ScoreResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Načtení user profilu z localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (e) {
        console.error('Chyba při načítání user profilu:', e);
      }
    }

    async function calculateResults() {
      try {
        const answersParam = searchParams.get('answers');
        if (!answersParam) {
          throw new Error('Chybí odpovědi z dotazníku');
        }

        const answers: Record<string, UserAnswer> = JSON.parse(answersParam) as Record<string, UserAnswer>;
        
        // Načti reálná data
        const [parties, partyPositions] = await Promise.all([
          loadParties(),
          loadPartyPositions()
        ]);
        
        // Vypočti výsledky pomocí scoring engine s reálnými daty
        const calculatedResults = calculateScores(answers, partyPositions, parties);
        
        setResults(calculatedResults);
        setLoading(false);
      } catch (err: unknown) {
        console.error('Chyba při výpočtu výsledků:', err);
        setError('Nepodařilo se vypočítat výsledky. Zkuste to znovu.');
        setLoading(false);
      }
    }

    calculateResults();
  }, [searchParams]);

  const shareResults = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Odkaz na výsledky byl zkopírován do schránky!');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const margin = 20;
    let yPos = margin;

    // Nastavení fontů
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    
    // Hlavička
    doc.text('Volební kalkulačka - Výsledky 2025', margin, yPos);
    yPos += 15;

    // Datum a čas
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const now = new Date();
    doc.text(`Vygenerováno: ${now.toLocaleString('cs-CZ')}`, margin, yPos);
    yPos += 15;

    // User profil
    if (userProfile) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Profil uživatele:', margin, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      if (userProfile.testLength) {
        doc.text(`Délka testu: ${userProfile.testLength}`, margin, yPos);
        yPos += 6;
      }
      if (userProfile.age) {
        doc.text(`Věk: ${userProfile.age}`, margin, yPos);
        yPos += 6;
      }
      if (userProfile.education) {
        doc.text(`Vzdělání: ${userProfile.education}`, margin, yPos);
        yPos += 6;
      }
      if (userProfile.region) {
        doc.text(`Region: ${userProfile.region}`, margin, yPos);
        yPos += 6;
      }
      if (userProfile.interests && userProfile.interests.length > 0) {
        doc.text(`Zájmové oblasti: ${userProfile.interests.join(', ')}`, margin, yPos);
        yPos += 6;
      }
      yPos += 10;
    }

    // Výsledky
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Výsledky shody s politickými stranami:', margin, yPos);
    yPos += 10;

    results.forEach((result, index) => {
      // Kontrola, zda je dostatek místa na stránce
      if (yPos > 250) {
        doc.addPage();
        yPos = margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`${index + 1}. ${result.partyName}`, margin, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Shoda: ${result.agreementPercentage}%`, margin + 5, yPos);
      yPos += 5;
      doc.text(`Důvěryhodnost: ${Math.round(result.confidenceScore * 100)}%`, margin + 5, yPos);
      yPos += 5;
      doc.text(`Odpovězeno otázek: ${result.thesisResults?.length || 0}`, margin + 5, yPos);
      yPos += 10;
    });

    // Dodatečné informace
    if (yPos > 200) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('O výsledcích:', margin, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const infoText = [
      'Jak funguje výpočet: Srovnáváme vaše odpovědi s oficiálními programy',
      'a hlasováními politických stran. Čím vyšší procento, tím více se s vámi strana shoduje.',
      '',
      'Důvěryhodnost dat: Ukazuje, jak spolehlivé jsou naše informace',
      'o pozici strany. Vychází z oficiálních zdrojů jako programy, hlasování a prohlášení.',
      '',
      'Poznámka: Výsledky slouží pouze pro orientaci.',
      'Doporučujeme prostudovat si programy stran a jejich konkrétní návrhy.'
    ];

    infoText.forEach(line => {
      doc.text(line, margin, yPos);
      yPos += 5;
    });

    // Uložení PDF
    const filename = `volebni-vysledky-${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}.pdf`;
    doc.save(filename);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Počítám výsledky...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Vaše výsledky
            </h1>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={exportToPDF} className="touch-manipulation min-h-[44px] flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" />
                Stáhnout PDF
              </Button>
              <Button variant="outline" size="sm" onClick={shareResults} className="touch-manipulation min-h-[44px] flex-1 sm:flex-none">
                <Share2 className="h-4 w-4 mr-2" />
                Sdílet
              </Button>
              <Link href="/" className="flex-1 sm:flex-none">
                <Button variant="outline" size="sm" className="touch-manipulation min-h-[44px] w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Nový test
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  // V development módu přesměruj na hlavní stránku (můžeme použít file:// protokol pro místní index.html)
                  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    window.open('../../index.html', '_blank');
                  } else {
                    window.open('https://www.itzkore.cz/volby2025/', '_blank');
                  }
                }}
                className="touch-manipulation min-h-[44px] flex-1 sm:flex-none"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Hlavní stránka
              </Button>
            </div>
          </div>
          
          <p className="text-sm sm:text-base text-gray-600">
            Založeno na vašich odpovědích jsme vypočítali, jak moc se shodujete s jednotlivými politickými stranami.
          </p>
          
          {/* Zobrazení user profilu */}
          {userProfile && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">Váš profil:</h3>
              <div className="flex flex-wrap gap-2 text-xs text-blue-700">
                <span className="bg-blue-100 px-2 py-1 rounded">Test: {userProfile.testLength}</span>
                {userProfile.age && <span className="bg-blue-100 px-2 py-1 rounded">Věk: {userProfile.age}</span>}
                {userProfile.education && <span className="bg-blue-100 px-2 py-1 rounded">Vzdělání: {userProfile.education}</span>}
                {userProfile.region && <span className="bg-blue-100 px-2 py-1 rounded">Region: {userProfile.region}</span>}
                {userProfile.interests && userProfile.interests.length > 0 && (
                  <span className="bg-blue-100 px-2 py-1 rounded">
                    Zájmy: {userProfile.interests.join(', ')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Výsledky */}
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {results.map((result, index) => (
            <Card key={result.partyId} className="overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 leading-tight">
                      {index + 1}. {result.partyName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">
                      Shoda: {result.agreementPercentage}% • 
                      Důvěryhodnost: {Math.round(result.confidenceScore * 100)}%
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      {result.agreementPercentage}%
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={result.agreementPercentage} 
                    className="h-2 sm:h-3"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
                
                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div className="text-xs sm:text-sm text-gray-600">
                    Odpovězeno otázek: {result.thesisResults?.length || 0}
                  </div>
                  <Button variant="outline" size="sm" className="touch-manipulation min-h-[44px] w-full sm:w-auto">
                    Detailní srovnání
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dodatečné informace */}
        <Card>
          <CardHeader>
            <CardTitle>O výsledcích</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              <strong>Jak funguje výpočet:</strong> Srovnáváme vaše odpovědi s oficiálními programy 
              a hlasováními politických stran. Čím vyšší procento, tím více se s vámi strana shoduje.
            </p>
            <p className="text-sm text-gray-600">
              <strong>Důvěryhodnost dat:</strong> Ukazuje, jak spolehlivé jsou naše informace 
              o pozici strany. Vychází z oficiálních zdrojů jako programy, hlasování a prohlášení.
            </p>
            <p className="text-sm text-gray-600">
              <strong>Poznámka:</strong> Výsledky slouží pouze pro orientaci. 
              Doporučujeme prostudovat si programy stran a jejich konkrétní návrhy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><div className="text-lg">Načítám výsledky...</div></div>}>
      <ResultsContent />
    </Suspense>
  );
}
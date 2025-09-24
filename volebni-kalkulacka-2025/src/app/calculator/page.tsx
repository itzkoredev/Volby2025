'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, SkipForward } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { UserAnswer, Thesis } from '@/lib/types';

// Načítání reálných dat z JSON souborů
async function loadTheses(): Promise<Thesis[]> {
  const response = await fetch('/data/theses.json');
  if (!response.ok) {
    throw new Error('Nepodařilo se načíst data tezí');
  }
  return response.json();
}

const scaleLabels = [
  'Rozhodně nesouhlasím',
  'Spíše nesouhlasím', 
  'Nevím / Neutrální',
  'Spíše souhlasím',
  'Rozhodně souhlasím'
];

const importanceLabels = [
  'Málo důležité',
  'Středně důležité', 
  'Velmi důležité'
];

interface UserProfile {
  age?: string
  education?: string
  employment?: string
  region?: string
  interests?: string[]
  testMode: 'quick' | 'full'
}

function CalculatorContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'quick';
  
  const [currentThesis, setCurrentThesis] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [currentValue, setCurrentValue] = useState<number>(0); // -2 až +2
  const [currentWeight, setCurrentWeight] = useState<number>(2); // 1-3
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
    // Načti reálná data při načítání komponenty
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await loadTheses();
        
        // Filtruj podle typu testu
        let filteredTheses = data;
        if (mode === 'quick') {
          filteredTheses = data.slice(0, 10); // Prvních 10 nejdůležitějších
        }
        
        setTheses(filteredTheses);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Neznámá chyba');
        setLoading(false);
      }
    }
    
    // Načti uživatelský profil z localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (err) {
        console.warn('Nepodařilo se načíst uživatelský profil:', err);
      }
    }
    
    fetchData();
  }, [mode]);
  
  const totalTheses = theses.length;
  const currentThesisData = theses[currentThesis];
  
  // Výpočet pokroku
  const progress = Math.round((Object.keys(answers).length / totalTheses) * 100);
  
  useEffect(() => {
    // Načti existující odpověď pokud existuje
    const existingAnswer = answers[currentThesisData?.id];
    if (existingAnswer) {
      setCurrentValue(existingAnswer.value);
      setCurrentWeight(existingAnswer.weight);
    } else {
      setCurrentValue(0);
      setCurrentWeight(2);
    }
  }, [currentThesis, currentThesisData?.id, answers]);

  const handleAnswer = () => {
    if (!currentThesisData) return;
    
    const answer: UserAnswer = {
      thesisId: currentThesisData.id,
      value: currentValue,
      weight: currentWeight
    };
    
    setAnswers(prev => ({
      ...prev,
      [currentThesisData.id]: answer
    }));
    
    // Přejdi na další otázku
    if (currentThesis < totalTheses - 1) {
      setCurrentThesis(prev => prev + 1);
    } else {
      // Posledni otázka - přesměruj na výsledky
      const searchParams = new URLSearchParams();
      searchParams.set('answers', JSON.stringify(answers));
      window.location.href = `/results?${searchParams.toString()}`;
    }
  };

  const handleSkip = () => {
    if (currentThesis < totalTheses - 1) {
      setCurrentThesis(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentThesis > 0) {
      setCurrentThesis(prev => prev - 1);
    }
  };

  const convertSliderValue = (sliderValue: number): number => {
    // Převeď 0-4 na -2 až +2
    return sliderValue - 2;
  };

  const convertToSliderValue = (value: number): number => {
    // Převeď -2 až +2 na 0-4
    return value + 2;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Načítání otázek...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">❌ Chyba</div>
          <div className="text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!currentThesisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">Žádné otázky k zobrazení.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header s navigací a profilem */}
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/calculator-setup'}
                className="flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Změnit nastavení
              </Button>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <div className="text-lg font-bold text-gray-900">
                🧮 Volební kalkulačka
              </div>
            </div>
            
            {userProfile && (
              <div className="text-sm text-gray-600 hidden md:block">
                {userProfile.age && `${userProfile.age}, `}
                {userProfile.region && `${userProfile.region}`}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl p-4 md:p-6">
        {/* Header s pokrokem */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {mode === 'quick' ? 'Rychlý test' : 'Podrobný test'}
              </h1>
              {userProfile?.interests && userProfile.interests.length > 0 && (
                <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Zaměřeno na vaše zájmy
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600">
              {Object.keys(answers).length} / {totalTheses} otázek
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Otázka {currentThesis + 1} z {totalTheses}</span>
              <span>{progress}% dokončeno</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Hlavní karta s otázkou */}
        <Card className="mb-6 md:mb-8">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl leading-relaxed">
              {currentThesisData.text}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6 md:space-y-8">
            {/* Škála souhlasu */}
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Jak moc s tímto výrokem souhlasíte?
              </Label>
              
              <div className="space-y-3">
                <Slider
                  value={[convertToSliderValue(currentValue)]}
                  onValueChange={(value) => setCurrentValue(convertSliderValue(value[0]))}
                  max={4}
                  step={1}
                  className="w-full"
                />
                
                <div className="flex justify-between text-xs sm:text-sm text-gray-600 px-1">
                  {scaleLabels.map((label, index) => (
                    <span 
                      key={index} 
                      className={`text-center w-16 sm:w-20 leading-tight ${
                        index === convertToSliderValue(currentValue) 
                          ? 'font-semibold text-blue-600' 
                          : ''
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Důležitost */}
            <div className="space-y-4">
              <Label className="text-base font-medium">
                Jak důležité je pro vás toto téma?
              </Label>
              
              <div className="space-y-3">
                <Slider
                  value={[currentWeight]}
                  onValueChange={(value) => setCurrentWeight(value[0])}
                  min={1}
                  max={3}
                  step={1}
                  className="w-full"
                />
                
                <div className="flex justify-between text-xs sm:text-sm text-gray-600 px-1">
                  {importanceLabels.map((label, index) => (
                    <span 
                      key={index} 
                      className={`text-center leading-tight ${
                        index + 1 === currentWeight 
                          ? 'font-semibold text-green-600' 
                          : ''
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigační tlačítka */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentThesis === 0}
            className="flex items-center justify-center gap-2 min-h-[44px] touch-manipulation"
          >
            <ArrowLeft className="h-4 w-4" />
            Předchozí
          </Button>

          <div className="flex gap-2 sm:gap-2">
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none min-h-[44px] touch-manipulation"
            >
              <SkipForward className="h-4 w-4" />
              Přeskočit
            </Button>
            
            <Button
              onClick={handleAnswer}
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none min-h-[44px] touch-manipulation"
            >
              {currentThesis === totalTheses - 1 ? 'Dokončit' : 'Další'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Počet zodpovězených otázek */}
        <div className="mt-4 sm:mt-6 text-center text-sm sm:text-base text-gray-600">
          <div className="bg-gray-100 rounded-full p-2 sm:p-3">
            <strong>Zodpovězeno: {Object.keys(answers).length} z {totalTheses} otázek</strong>
            <div className="mt-1 w-full bg-gray-300 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(Object.keys(answers).length / totalTheses) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><div className="text-lg">Načítám dotazník...</div></div>}>
      <CalculatorContent />
    </Suspense>
  );
}
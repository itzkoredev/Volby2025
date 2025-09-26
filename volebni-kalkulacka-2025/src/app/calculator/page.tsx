"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, SkipForward, Info, ChevronDown, ChevronUp, Keyboard } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import type { UserAnswer, Thesis } from "@/lib/types";
import { withBasePath } from "@/lib/utils";

// Načítání reálných dat z JSON souborů
async function loadTheses(): Promise<Thesis[]> {
  const response = await fetch(withBasePath("/data/theses.json"));
  if (!response.ok) {
    throw new Error("Nepodařilo se načíst data tezí");
  }
  return response.json();
}

const scaleLabels = [
  "Rozhodně nesouhlasím",
  "Spíše nesouhlasím",
  "Nevím / Neutrální",
  "Spíše souhlasím",
  "Rozhodně souhlasím"
];

const importanceLabels = ["Málo důležité", "Středně důležité", "Velmi důležité"];
const sliderPositions = [-2, -1, 0, 1, 2] as const;

type SliderValue = (typeof sliderPositions)[number];

function shuffleArray<T>(items: T[]): T[] {
  const array = [...items];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[randomIndex]] = [array[randomIndex], array[index]];
  }
  return array;
}

interface UserProfile {
  age?: string;
  education?: string;
  employment?: string;
  region?: string;
  interests?: string[];
  testMode: "quick" | "full";
}

function CalculatorContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "quick";

  const [currentThesis, setCurrentThesis] = useState(0);
  const [answers, setAnswers] = useState<Record<string, UserAnswer>>({});
  const [currentValue, setCurrentValue] = useState<SliderValue>(0);
  const [currentWeight, setCurrentWeight] = useState<number>(2);
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [factOpen, setFactOpen] = useState(false);
  const [confirmedQuestionIds, setConfirmedQuestionIds] = useState<Record<string, true>>({});

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await loadTheses();
        const activeTheses = data
          .filter((thesis) => thesis.isActive !== false)
          .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

        const randomizedTheses = shuffleArray(activeTheses);
        const filteredTheses = mode === "quick"
          ? randomizedTheses.slice(0, Math.min(10, randomizedTheses.length))
          : randomizedTheses;
  setTheses(filteredTheses);
  setAnswers({});
  setConfirmedQuestionIds({});
  setCurrentThesis(0);
  setCurrentValue(0);
  setCurrentWeight(2);
  setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Neznámá chyba");
        setLoading(false);
      }
    }

    const savedProfile = localStorage.getItem("userProfile");
    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (err) {
        console.warn("Nepodařilo se načíst uživatelský profil:", err);
      }
    }

    fetchData();
  }, [mode]);

  const totalTheses = theses.length;
  const currentThesisData = theses[currentThesis];
  const currentThesisId = currentThesisData?.id;
  const answeredCount = useMemo(() => Object.keys(confirmedQuestionIds).length, [confirmedQuestionIds]);
  const progress = totalTheses > 0 ? Math.round((answeredCount / totalTheses) * 100) : 0;

  useEffect(() => {
    if (!currentThesisId) {
      setCurrentValue(0);
      setCurrentWeight(2);
      setFactOpen(false);
      return;
    }

    const existingAnswer = answers[currentThesisId];
    if (existingAnswer) {
      setCurrentValue(existingAnswer.value as SliderValue);
      setCurrentWeight(existingAnswer.weight);
    } else {
      setCurrentValue(0);
      setCurrentWeight(2);
    }
    setFactOpen(false);
  }, [answers, currentThesisId, currentThesisData]);

  const convertSliderValue = useCallback((sliderValue: number): SliderValue => {
    return sliderPositions[Math.max(0, Math.min(sliderPositions.length - 1, sliderValue))];
  }, []);

  const convertToSliderValue = useCallback((value: number): number => {
    const index = sliderPositions.indexOf(value as SliderValue);
    return index >= 0 ? index : 2;
  }, []);

  const handleAnswer = useCallback(
    (overrideValue?: SliderValue, overrideWeight?: number) => {
      if (!currentThesisData) return;

      const value = overrideValue ?? currentValue;
      const weight = overrideWeight ?? currentWeight;

      const answer: UserAnswer = {
        thesisId: currentThesisData.id,
        value,
        weight,
      };

      const updatedAnswers = {
        ...answers,
        [currentThesisData.id]: answer,
      };

      setAnswers(updatedAnswers);
      setConfirmedQuestionIds((prev) => ({ ...prev, [currentThesisData.id]: true }));

      if (currentThesis < totalTheses - 1) {
        setCurrentThesis((prev) => prev + 1);
      } else {
        const params = new URLSearchParams();
        params.set("answers", JSON.stringify(updatedAnswers));
        window.location.href = `${withBasePath("/results")}?${params.toString()}`;
      }
    },
    [answers, currentThesis, currentThesisData, currentValue, currentWeight, totalTheses]
  );

  const handleSkip = useCallback(() => {
    if (!currentThesisData) {
      return;
    }

    setAnswers((prev) => {
      if (!prev[currentThesisData.id]) {
        return prev;
      }
      const updated = { ...prev };
      delete updated[currentThesisData.id];
      return updated;
    });

    setConfirmedQuestionIds((prev) => {
      if (!prev[currentThesisData.id]) {
        return prev;
      }
      const updated = { ...prev };
      delete updated[currentThesisData.id];
      return updated;
    });

    if (currentThesis < totalTheses - 1) {
      setCurrentThesis((prev) => prev + 1);
    }
  }, [currentThesis, currentThesisData, totalTheses]);

  const handlePrevious = useCallback(() => {
    if (currentThesis > 0) {
      const previousThesis = theses[currentThesis - 1];
      if (previousThesis) {
        setConfirmedQuestionIds((prev) => {
          if (!prev[previousThesis.id]) {
            return prev;
          }
          const updated = { ...prev };
          delete updated[previousThesis.id];
          return updated;
        });
      }

      setCurrentThesis((prev) => prev - 1);
    }
  }, [currentThesis, theses]);

  const handleQuickAnswer = useCallback(
    (value: SliderValue) => {
      setCurrentValue(value);
    },
    []
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (!currentThesisData) return;
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag && ["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
        return;
      }

      if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        handleAnswer();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePrevious();
      } else if (event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
        handleSkip();
      } else if (/^[1-5]$/.test(event.key)) {
        event.preventDefault();
        const index = Number(event.key) - 1;
        const selected = sliderPositions[index];
        handleQuickAnswer(selected);
      } else if (event.key === "!" || event.key === "+" || event.key === "=") {
        event.preventDefault();
        setCurrentWeight((prev) => (prev === 3 ? 3 : prev + 1));
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        setCurrentWeight((prev) => (prev === 1 ? 1 : prev - 1));
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentThesisData, handleAnswer, handleSkip, handlePrevious, handleQuickAnswer]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
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
        <div className="text-center text-gray-600">Žádné otázky k zobrazení.</div>
      </div>
    );
  }

  const quickChoices = scaleLabels.map((label, index) => ({
    label,
    value: sliderPositions[index],
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 max-w-4xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => (window.location.href = withBasePath("/calculator-setup"))}
                className="flex items-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Změnit nastavení
              </Button>
              <div className="hidden sm:block w-px h-6 bg-gray-300" />
              <div className="text-lg font-bold text-gray-900">ČR Volební kalkulačka</div>
            </div>
            {userProfile && (
              <div className="hidden md:block text-sm text-gray-600">
                {userProfile.age && `${userProfile.age}, `}
                {userProfile.region && `${userProfile.region}`}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl p-4 md:p-6">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                {mode === "quick" ? "Rychlý test" : "Podrobný test"}
              </h1>
              {userProfile?.interests && userProfile.interests.length > 0 && (
                <div className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Zaměřeno na vaše zájmy
                </div>
              )}
            </div>
            <div className="text-sm text-gray-600">{answeredCount} / {totalTheses} otázek</div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Otázka {currentThesis + 1} z {totalTheses}</span>
              <span>{progress}% dokončeno</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <Card className="mb-6 md:mb-8">
          <CardHeader className="pb-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap text-sm text-blue-700">
              <Badge variant="secondary" className="bg-blue-100 text-blue-700 border-transparent">
                Téma: {currentThesisData.issueId}
              </Badge>
              {currentThesisData.contextSource && (
                <a
                  href={currentThesisData.contextSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline"
                >
                  Zdroj kontextu
                </a>
              )}
            </div>
            <CardTitle className="text-lg sm:text-xl leading-relaxed">
              {currentThesisData.text}
            </CardTitle>
            {(currentThesisData.contextFact ?? "") !== "" && (
              <div className="rounded-lg border border-blue-100 bg-blue-50/70 p-3">
                <button
                  type="button"
                  onClick={() => setFactOpen((open) => !open)}
                  className="w-full flex items-center justify-between gap-3 text-left text-sm text-blue-700"
                >
                  <span className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    {factOpen ? "Skrýt fakta a souvislosti" : "Zobrazit fakta k otázce"}
                  </span>
                  {factOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {factOpen && (
                  <div className="mt-3 text-sm text-blue-900 leading-relaxed">
                    {currentThesisData.contextFact}
                  </div>
                )}
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6 md:space-y-8">
            <div className="space-y-4">
              <Label className="text-base font-medium">Jak moc s tímto výrokem souhlasíte?</Label>
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
                      key={label}
                      className={`text-center w-16 sm:w-20 leading-tight ${
                        sliderPositions[index] === currentValue ? "font-semibold text-blue-600" : ""
                      }`}
                    >
                      {label}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickChoices.map(({ label, value }) => (
                    <Button
                      key={label}
                      variant={value === currentValue ? "default" : "outline"}
                      onClick={() => handleQuickAnswer(value)}
                      className="flex-1 min-w-[140px] h-auto min-h-[3rem] whitespace-normal break-words text-center leading-snug px-4 py-3"
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Jak důležité je pro vás toto téma?</Label>
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
                      key={label}
                      className={`text-center leading-tight ${
                        index + 1 === currentWeight ? "font-semibold text-green-600" : ""
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
              onClick={() => handleAnswer()}
              className="flex items-center justify-center gap-2 flex-1 sm:flex-none min-h-[44px] touch-manipulation"
            >
              {currentThesis === totalTheses - 1 ? "Dokončit" : "Další"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 grid gap-4 sm:grid-cols-2">
          <div className="bg-gray-100 rounded-full p-2 sm:p-3 text-center text-sm sm:text-base text-gray-600">
            <strong>Zodpovězeno: {answeredCount} z {totalTheses} otázek</strong>
            <div className="mt-1 w-full bg-gray-300 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalTheses > 0 ? (answeredCount / totalTheses) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="bg-white/80 border border-gray-200 rounded-xl p-3 text-sm text-gray-600 flex items-center gap-3">
            <Keyboard className="w-4 h-4 text-gray-500" />
            <div>
              Klávesy 1–5 nastaví hodnotu, ➡ nebo Enter posune dál, ⬅ vrátí zpět, mezerník přeskočí otázku.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

export default function CalculatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center"><div className="text-lg">Načítám dotazník...</div></div>}>
      <CalculatorContent />
    </Suspense>
  );
}



import { PartyPosition, UserAnswer } from '@/lib/types';

export type { UserAnswer };

export interface ScoreResult {
  partyId: string;
  partyName: string;
  totalScore: number; // 0-100 procent shody
  maxPossibleScore: number;
  agreementPercentage: number;
  confidenceScore: number;
  thesisResults: ThesisResult[];
}

export interface ThesisResult {
  thesisId: string;
  userValue: number;
  partyValue: number;
  difference: number;
  weight: number;
  confidence: number;
  contribution: number; // příspěvek k celkovému skóre
}

/**
 * Hlavní funkce pro výpočet politických shod
 * @param answers Odpovědi uživatele
 * @param partyPositions Pozice všech stran k tezím
 * @param parties Základní informace o stranách
 * @returns Seřazené výsledky podle shody
 */
export function calculateScores(
  answers: Record<string, UserAnswer>,
  partyPositions: PartyPosition[],
  parties: Array<{ id: string; name: string }>
): ScoreResult[] {
  const results: ScoreResult[] = [];

  // Projdi každou stranu
  for (const party of parties) {
    const partyResults = calculatePartyScore(answers, partyPositions, party.id, party.name);
    results.push(partyResults);
  }

  // Seřaď podle celkového skóre (sestupně)
  return results.sort((a, b) => b.agreementPercentage - a.agreementPercentage);
}

/**
 * Výpočet skóre pro jednu konkrétní stranu
 */
function calculatePartyScore(
  answers: Record<string, UserAnswer>,
  partyPositions: PartyPosition[],
  partyId: string,
  partyName: string
): ScoreResult {
  const thesisResults: ThesisResult[] = [];
  let totalWeightedScore = 0;
  let maxPossibleWeightedScore = 0;
  let totalConfidence = 0;
  let answeredTheses = 0;

  // Najdi pozice této strany
  const partyTheses = partyPositions.filter(p => p.partyId === partyId);

  // Projdi všechny odpovědi uživatele
  Object.entries(answers).forEach(([thesisId, userAnswer]) => {
    const partyPosition = partyTheses.find(p => p.thesisId === thesisId);
    
    if (!partyPosition) {
      // Strana nemá pozici k této tezi - přeskoč
      return;
    }

    // Vypočti rozdíl mezi uživatelem a stranou
    const difference = Math.abs(userAnswer.value - partyPosition.value);
    
    // Maximální možný rozdíl je 4 (-2 až +2)
    const maxDifference = 4;
    
    // Převeď rozdíl na skóre (čím menší rozdíl, tím vyšší skóre)
    const agreementScore = (maxDifference - difference) / maxDifference;
    
    // Aplikuj váhu uživatele
    const weightedScore = agreementScore * userAnswer.weight;
    const maxWeightedScore = userAnswer.weight;
    
    // Přidej k celkovému skóre
    totalWeightedScore += weightedScore;
    maxPossibleWeightedScore += maxWeightedScore;
    totalConfidence += partyPosition.confidence;
    answeredTheses++;

    // Ulož výsledek pro tuto tezi
    thesisResults.push({
      thesisId,
      userValue: userAnswer.value,
      partyValue: partyPosition.value,
      difference,
      weight: userAnswer.weight,
      confidence: partyPosition.confidence,
      contribution: weightedScore
    });
  });

  // Vypočti finální metriky
  const agreementPercentage = maxPossibleWeightedScore > 0 
    ? (totalWeightedScore / maxPossibleWeightedScore) * 100 
    : 0;
    
  const averageConfidence = answeredTheses > 0 
    ? totalConfidence / answeredTheses 
    : 0;

  return {
    partyId,
    partyName,
    totalScore: totalWeightedScore,
    maxPossibleScore: maxPossibleWeightedScore,
    agreementPercentage: Math.round(agreementPercentage * 100) / 100,
    confidenceScore: Math.round(averageConfidence * 100) / 100,
    thesisResults
  };
}

/**
 * Pomocná funkce pro identifikaci "red-line" odpovědí
 * Tyto odpovědi můžou výrazně snížit shodu se stranou
 */
export function applyRedLinePolicy(
  results: ScoreResult[],
  redLineTheses: string[] = []
): ScoreResult[] {
  if (redLineTheses.length === 0) return results;

  return results.map(result => {
    let penalty = 0;
    
    // Zkontroluj red-line teze
    result.thesisResults.forEach(thesis => {
      if (redLineTheses.includes(thesis.thesisId) && thesis.difference > 2) {
        // Velký nesouhlas v klíčové otázce = penalizace
        penalty += 20; // -20% za každou red-line disagreement
      }
    });

    const penalizedScore = Math.max(0, result.agreementPercentage - penalty);

    return {
      ...result,
      agreementPercentage: Math.round(penalizedScore * 100) / 100
    };
  });
}

/**
 * Vytvoří detailní report pro porovnání uživatele se stranou
 */
export function generateDetailedComparison(
  userAnswers: Record<string, UserAnswer>,
  partyResults: ScoreResult
): {
  strongAgreements: ThesisResult[];
  strongDisagreements: ThesisResult[];
  partialAgreements: ThesisResult[];
} {
  const strongAgreements = partyResults.thesisResults.filter(t => t.difference <= 1);
  const strongDisagreements = partyResults.thesisResults.filter(t => t.difference >= 3);
  const partialAgreements = partyResults.thesisResults.filter(t => t.difference === 2);

  return {
    strongAgreements: strongAgreements.sort((a, b) => b.contribution - a.contribution),
    strongDisagreements: strongDisagreements.sort((a, b) => b.weight - a.weight),
    partialAgreements: partialAgreements.sort((a, b) => b.contribution - a.contribution)
  };
}
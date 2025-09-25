export const partyKnowledgeMap: Record<string, string> = {
  ano: "KB-P-ANO",
  ods: "KB-P-SPOLU",
  spolu: "KB-P-SPOLU",
  stan: "KB-P-STAN",
  pirati: "KB-P-PIR",
  spd: "KB-P-SPD",
  stacilo: "KB-P-STACILO",
  motoriste: "KB-P-MOT",
  volt: "KB-P-VOLT",
  hnutigenerace: "KB-P-GEN",
  prisaha: "KB-P-PRIS",
};

export const getPartyKnowledgeId = (partyId: string): string | null => {
  return partyKnowledgeMap[partyId] ?? null;
};

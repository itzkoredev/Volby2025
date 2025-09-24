import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';
import {
  PartiesDataSchema,
  ThesesDataSchema,
  PartyPositionsDataSchema,
  FAQDataSchema,
  IssuesDataSchema,
  SourcesDataSchema,
  Party,
  Thesis,
  PartyPosition
} from '../schemas';

const dataPath = join(process.cwd(), 'public', 'data');

async function validateFile(filePath: string, schema: z.ZodSchema<any>): Promise<z.ZodError | undefined> {
  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    schema.parse(data);
    return undefined; // Žádné chyby
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error;
    }
    return new z.ZodError([{ message: (error as Error).message, path: [] }]);
  }
}

describe('Data Validation', () => {
  it('should validate all JSON data files correctly', async () => {
    const filesToValidate = [
      { name: 'parties.json', schema: PartiesDataSchema },
      { name: 'theses.json', schema: ThesesDataSchema },
      { name: 'party_positions.json', schema: PartyPositionsDataSchema },
      { name: 'faq.json', schema: FAQDataSchema, optional: true },
      { name: 'issues.json', schema: IssuesDataSchema, optional: true },
      { name: 'sources.json', schema: SourcesDataSchema, optional: true },
    ];

    let allFilesValid = true;
    for (const f of filesToValidate) {
      const filePath = join(dataPath, f.name);
      try {
        readFileSync(filePath); // Zkusíme přečíst, zda soubor existuje
        const error = await validateFile(filePath, f.schema);
        if (error) {
          console.error(`❌ CHYBA ve souboru ${f.name}:`, error.issues);
          allFilesValid = false;
        }
      } catch (error: any) {
        if (!f.optional) {
          console.error(`❌ CHYBA: Povinný soubor ${f.name} chybí.`);
          allFilesValid = false;
        }
      }
    }
    expect(allFilesValid).toBe(true);
  });

  it('should check referential integrity of party_positions.json', () => {
    const parties: Party[] = JSON.parse(readFileSync(join(dataPath, 'parties.json'), 'utf-8'));
    const theses: Thesis[] = JSON.parse(readFileSync(join(dataPath, 'theses.json'), 'utf-8'));
    const positions: PartyPosition[] = JSON.parse(readFileSync(join(dataPath, 'party_positions.json'), 'utf-8'));

    const partyIds = new Set(parties.map(p => p.id));
    const thesisIds = new Set(theses.map(t => t.id));

    let errorsFound = false;

    positions.forEach(pos => {
        if (!partyIds.has(pos.partyId)) {
            console.error(`❌ Chyba integrity: V party_positions.json nalezeno neexistující partyId: ${pos.partyId}`);
            errorsFound = true;
        }
        if (!thesisIds.has(pos.thesisId)) {
            console.error(`❌ Chyba integrity: V party_positions.json nalezeno neexistující thesisId: ${pos.thesisId}`);
            errorsFound = true;
        }
    });
    expect(errorsFound).toBe(false);
  });
});

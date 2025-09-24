#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  PartiesDataSchema,
  ThesesDataSchema,
  PartyPositionsDataSchema,
  FAQDataSchema,
  IssuesDataSchema,
  SourcesDataSchema
} from '../src/lib/schemas';
import { z } from 'zod';

// ES Module ekvivalent __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const dataPath = path.join(projectRoot, 'public', 'data');

type ValidationResult = {
  file: string;
  status: 'OK' | 'ERROR';
  errors?: z.ZodError | { message: string };
};

async function validateFile(filePath: string, schema: z.ZodSchema<any>): Promise<ValidationResult> {
  const fileName = path.basename(filePath);
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    schema.parse(data);
    return { file: fileName, status: 'OK' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { file: fileName, status: 'ERROR', errors: error };
    }
    // @ts-ignore
    return { file: fileName, status: 'ERROR', errors: { message: error.message } };
  }
}

async function checkReferentialIntegrity() {
    console.log('\\n--- Kontrola referenční integrity ---');
    const parties = JSON.parse(await fs.readFile(path.join(dataPath, 'parties.json'), 'utf-8'));
    const theses = JSON.parse(await fs.readFile(path.join(dataPath, 'theses.json'), 'utf-8'));
    const positions = JSON.parse(await fs.readFile(path.join(dataPath, 'party_positions.json'), 'utf-8'));

    const partyIds = new Set(parties.map((p: any) => p.id));
    const thesisIds = new Set(theses.map((t: any) => t.id));

    let errorsFound = false;

    positions.forEach((pos: any) => {
        if (!partyIds.has(pos.partyId)) {
            console.error(`❌ Chyba: V party_positions.json nalezeno neexistující partyId: ${pos.partyId}`);
            errorsFound = true;
        }
        if (!thesisIds.has(pos.thesisId)) {
            console.error(`❌ Chyba: V party_positions.json nalezeno neexistující thesisId: ${pos.thesisId}`);
            errorsFound = true;
        }
    });

    if (!errorsFound) {
        console.log('✅ Referenční integrita je v pořádku.');
    }
    return errorsFound;
}


async function main() {
  console.log('--- Spouštím validaci datových souborů ---');
  const filesToValidate = [
    { name: 'parties.json', schema: PartiesDataSchema },
    { name: 'theses.json', schema: ThesesDataSchema },
    { name: 'party_positions.json', schema: PartyPositionsDataSchema },
    // Následující soubory mohou chybět, validujeme je, jen pokud existují
    { name: 'faq.json', schema: FAQDataSchema, optional: true },
    { name: 'issues.json', schema: IssuesDataSchema, optional: true },
    { name: 'sources.json', schema: SourcesDataSchema, optional: true },
  ];

  const results: ValidationResult[] = [];
  for (const f of filesToValidate) {
      const filePath = path.join(dataPath, f.name);
      try {
          await fs.access(filePath);
          results.push(await validateFile(filePath, f.schema));
      } catch (error) {
          if (!f.optional) {
              results.push({ file: f.name, status: 'ERROR', errors: { message: 'Soubor chybí, ale je povinný.' } });
          }
      }
  }

  let hasErrors = false;
  results.forEach(result => {
    if (result.status === 'OK') {
      console.log(`✅ ${result.file} - OK`);
    } else {
      console.error(`❌ ${result.file} - CHYBA`);
      console.error(result.errors);
      hasErrors = true;
    }
  });

  if (hasErrors) {
    console.log('\\nValidace selhala. Byly nalezeny chyby ve formátu souborů.');
    process.exit(1);
  } else {
    console.log('\\nValidace formátu byla úspěšná.');
    const integrityErrors = await checkReferentialIntegrity();
    if (integrityErrors) {
        console.log('\\nValidace selhala. Byly nalezeny chyby v referenční integritě.');
        process.exit(1);
    }
  }
  
  console.log('\\n🎉 Všechna data jsou v pořádku!');
}

main();
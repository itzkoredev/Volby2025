#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join } from 'path';
import { z } from 'zod';

// Lokální definice schémat (kvůli problémům s importy)
const PartySchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().min(1),
  website: z.string().url().optional(),
  logo: z.string().optional(),
  description: z.string().optional(),
  sources: z.array(z.string()).default([]),
  lastUpdated: z.string().datetime().optional(),
});

const IssueSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  order: z.number().int().min(0).default(0),
});

const ThesisSchema = z.object({
  id: z.string().min(1),
  issueId: z.string().min(1),
  text: z.string().min(1),
  scaleMin: z.number().int().min(-3).max(0).default(-2),
  scaleMax: z.number().int().min(0).max(3).default(2),
  evidencePolicy: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

const PartyPositionSchema = z.object({
  partyId: z.string().min(1),
  thesisId: z.string().min(1),
  value: z.number().min(-2).max(2),
  confidence: z.number().min(0).max(1),
  source: z.object({
    url: z.string().url(),
    date: z.string().datetime(),
    type: z.enum(['program', 'hlasovani', 'prohlaseni', 'rozhovor', 'finance']),
    title: z.string().optional(),
  }),
  lastUpdated: z.string().datetime().optional(),
});

const FAQSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string().min(1),
  sources: z.array(z.string()).default([]),
  category: z.string().optional(),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

const SourceSchema = z.object({
  id: z.string().min(1),
  url: z.string().url(),
  title: z.string().min(1),
  date: z.string().datetime(),
  type: z.enum(['program', 'hlasovani', 'prohlaseni', 'rozhovor', 'finance']),
  partyId: z.string().optional(),
  description: z.string().optional(),
});

const PartiesDataSchema = z.array(PartySchema);
const IssuesDataSchema = z.array(IssueSchema);
const ThesesDataSchema = z.array(ThesisSchema);
const PartyPositionsDataSchema = z.array(PartyPositionSchema);
const FAQDataSchema = z.array(FAQSchema);
const SourcesDataSchema = z.array(SourceSchema);

interface ValidationResult {
  file: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

class DataValidator {
  private dataDir: string;
  private results: ValidationResult[] = [];

  constructor() {
    this.dataDir = join(process.cwd(), 'public', 'data');
  }

  private readJsonFile(filename: string): unknown {
    try {
      const filepath = join(this.dataDir, filename);
      const content = readFileSync(filepath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Chyba při čtení souboru ${filename}: ${error}`);
    }
  }

  private validateFile(filename: string, schema: z.ZodSchema, description: string): ValidationResult {
    const result: ValidationResult = {
      file: filename,
      valid: true,
      errors: [],
      warnings: [],
    };

    try {
      console.log(`🔍 Validuji ${description} (${filename})...`);
      
      const data = this.readJsonFile(filename);
      const validationResult = schema.safeParse(data);

      if (!validationResult.success) {
        result.valid = false;
        result.errors = validationResult.error.issues.map(
          (err) => `${err.path.join('.')}: ${err.message}`
        );
      } else {
        console.log(`✅ ${description} je validní`);
      }
    } catch (error) {
      result.valid = false;
      result.errors.push(`Fatální chyba: ${error}`);
    }

    return result;
  }

  async validate(): Promise<boolean> {
    console.log('🚀 Spouštím validaci dat...\n');

    // Validace jednotlivých souborů
    this.results.push(
      this.validateFile('parties.json', PartiesDataSchema, 'data stran')
    );
    this.results.push(
      this.validateFile('issues.json', IssuesDataSchema, 'data témat')
    );
    this.results.push(
      this.validateFile('theses.json', ThesesDataSchema, 'data tezí')
    );
    this.results.push(
      this.validateFile('party_positions.json', PartyPositionsDataSchema, 'pozice stran')
    );
    this.results.push(
      this.validateFile('faq.json', FAQDataSchema, 'FAQ data')
    );
    this.results.push(
      this.validateFile('sources.json', SourcesDataSchema, 'data zdrojů')
    );

    this.printResults();
    return this.results.every(r => r.valid);
  }

  private printResults(): void {
    console.log('\n📊 Výsledky validace:\n');

    let totalErrors = 0;
    let totalWarnings = 0;

    for (const result of this.results) {
      if (result.errors.length > 0) {
        console.log(`❌ ${result.file}:`);
        for (const error of result.errors) {
          console.log(`   • ${error}`);
          totalErrors++;
        }
        console.log();
      }

      if (result.warnings.length > 0) {
        console.log(`⚠️  ${result.file} (varování):`);
        for (const warning of result.warnings) {
          console.log(`   • ${warning}`);
          totalWarnings++;
        }
        console.log();
      }
    }

    if (totalErrors === 0 && totalWarnings === 0) {
      console.log('🎉 Všechna data jsou validní a kompletní!');
    } else {
      console.log(`📈 Souhrn: ${totalErrors} chyb, ${totalWarnings} varování`);
      
      if (totalErrors > 0) {
        console.log('\n❗ Před pokračováním opravte všechny chyby.');
        process.exit(1);
      }
    }
  }
}

// Spuštění validátoru
const validator = new DataValidator();
validator.validate().catch((error) => {
  console.error('💥 Neočekávaná chyba při validaci:', error);
  process.exit(1);
});
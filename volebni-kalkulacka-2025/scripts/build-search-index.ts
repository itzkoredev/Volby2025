// Tento skript se spouští v Node.js prostředí, nikoli v prohlížeči
import fs from 'fs/promises';
import path from 'path';
import { Document } from 'flexsearch';
import { fileURLToPath } from 'url';

// ES Module ekvivalent __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Definice typů pro naše data
interface Party {
  id: string;
  name: string;
  description?: string;
  pros?: string[];
  cons?: string[];
}

interface Thesis {
  id: string;
  text: string;
  issueId: string;
}

interface PartyPosition {
  partyId: string;
  thesisId: string;
  justification?: string;
}

interface Passage {
  id: string;
  content: string;
  metadata: {
    type: 'party' | 'thesis' | 'position';
    partyName?: string;
    issueId?: string;
  };
}

// Cesty odvozené od polohy skriptu, nikoli od pracovního adresáře
const projectRoot = path.resolve(__dirname, '..'); // O úroveň výš než /scripts
const publicDataPath = path.join(projectRoot, 'public', 'data');
const outputIndexPath = path.join(publicDataPath, 'search-index.json');

async function buildSearchIndex() {
  console.log('Spouštím generování vyhledávacího indexu...');

  // 1. Načtení dat
  const parties: Party[] = JSON.parse(await fs.readFile(path.join(publicDataPath, 'parties.json'), 'utf-8'));
  const theses: Thesis[] = JSON.parse(await fs.readFile(path.join(publicDataPath, 'theses.json'), 'utf-8'));
  const positions: PartyPosition[] = JSON.parse(await fs.readFile(path.join(publicDataPath, 'party_positions.json'), 'utf-8'));

  const passages: Passage[] = [];
  let passageId = 0;

  // 2. Zpracování dat do pasáží
  // Strany
  for (const party of parties) {
    if (party.description) {
      passages.push({
        id: `party_${passageId++}`,
        content: `Profil strany ${party.name}: ${party.description}`,
        metadata: { type: 'party', partyName: party.name },
      });
    }
    party.pros?.forEach(pro => passages.push({
      id: `party_${passageId++}`,
      content: `Pro stranu ${party.name} hovoří: ${pro}`,
      metadata: { type: 'party', partyName: party.name },
    }));
    party.cons?.forEach(con => passages.push({
      id: `party_${passageId++}`,
      content: `Proti straně ${party.name} hovoří: ${con}`,
      metadata: { type: 'party', partyName: party.name },
    }));
  }

  // Teze a postoje
  const thesesById = new Map(theses.map(t => [t.id, t]));
  const partiesById = new Map(parties.map(p => [p.id, p]));

  for (const position of positions) {
    const thesis = thesesById.get(position.thesisId);
    const party = partiesById.get(position.partyId);
    if (thesis && party && position.justification) {
      passages.push({
        id: `pos_${passageId++}`,
        content: `Postoj strany ${party.name} k tezi "${thesis.text}": ${position.justification}`,
        metadata: { type: 'position', partyName: party.name, issueId: thesis.issueId },
      });
    }
  }

  console.log(`Zpracováno ${passages.length} pasáží.`);

  // 3. Vytvoření a export indexu
  const index = new Document({
    tokenize: 'full',
    document: {
      id: 'id',
      index: ['content'],
      // Uložíme i metadata, abychom je mohli použít při vyhledávání
      store: ['metadata'],
    },
  });

  passages.forEach(p => {
    // Přidáváme objekt, který přesně odpovídá struktuře definované v Document
    index.add({
      id: p.id,
      content: p.content,
      metadata: p.metadata,
    });
  });

  const exportedData: { [key: string]: any } = {};
  // @ts-ignore - Flexsearch typy pro export jsou nekompletní
  index.export((key, data) => {
    exportedData[key] = data;
  });

  // Uložíme index a pasáže do jednoho souboru
  const outputData = {
    index: exportedData,
    passages: passages,
  };

  await fs.writeFile(outputIndexPath, JSON.stringify(outputData));

  console.log(`Vyhledávací index byl úspěšně vygenerován a uložen do ${outputIndexPath}`);
}

buildSearchIndex().catch(err => {
  console.error('Došlo k chybě při generování indexu:', err);
  process.exit(1);
});

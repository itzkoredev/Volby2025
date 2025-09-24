const fs = require('fs');
const path = require('path');

const INPUT_PATH = path.resolve(__dirname, '..', 'data', 'kompletni_volebni_pruzkumy_2025.csv');
const OUTPUT_PATH = path.resolve(__dirname, '..', 'volebni-kalkulacka-2025', 'public', 'data', 'complete-polls.json');

const monthMap = {
  'ledna': '01',
  'února': '02',
  'března': '03',
  'dubna': '04',
  'května': '05',
  'června': '06',
  'července': '07',
  'srpna': '08',
  'září': '09',
  'října': '10',
  'listopadu': '11',
  'prosince': '12'
};

const partyMap = {
  'ANO': 'ano',
  'SPOLU': 'spolu',
  'SPD': 'spd',
  'STAN': 'stan',
  'Piráti': 'pirati',
  'Stačilo!': 'stacilo',
  'Motoristé': 'motoriste',
  'Přísaha': 'prisaha'
};

const slugify = (value) => {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
};

const parseDate = (value) => {
  const [dayPart, rest] = value.split('. ');
  if (!rest) {
    throw new Error(`Invalid date: ${value}`);
  }

  const day = parseInt(dayPart, 10);
  const [monthName, yearStr] = rest.split(' ');
  const month = monthMap[monthName.toLowerCase()];
  if (!month) {
    throw new Error(`Unknown month "${monthName}" in value "${value}"`);
  }

  const year = parseInt(yearStr, 10);
  const iso = `${year}-${month}-${String(day).padStart(2, '0')}`;

  return { iso, label: value.trim() };
};

function convertCsvToJson() {
  const raw = fs.readFileSync(INPUT_PATH, 'utf8').trim();
  const lines = raw.split(/\r?\n/);
  const header = lines.shift().split(',');

  const polls = lines
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(',');
      const dateRaw = parts[0].trim();
      const agencyRaw = parts[1].trim();
      const { iso: dateIso, label: dateLabel } = parseDate(dateRaw);

      const agencyMatch = agencyRaw.match(/^([^()]+?)(?:\s*\(([^)]+)\))?$/);
      const agency = agencyMatch ? agencyMatch[1].trim() : agencyRaw;
      const client = agencyMatch && agencyMatch[2] ? agencyMatch[2].trim() : null;

      const results = header.slice(2).map((partyName, idx) => {
        const rawValue = (parts[2 + idx] || '').trim();
        const partyId = partyMap[partyName];

        if (!partyId) {
          throw new Error(`Unknown party column: ${partyName}`);
        }

        let percentage = null;
        let note = null;

        if (rawValue === '-' || rawValue === '') {
          percentage = null;
        } else if (/^pod\s+3%$/i.test(rawValue)) {
          percentage = 2.9;
          note = 'pod 3%';
        } else {
          const normalized = rawValue.replace(',', '.').replace('%', '');
          const parsed = parseFloat(normalized);
          if (!Number.isFinite(parsed)) {
            throw new Error(`Could not parse value "${rawValue}" for column ${partyName}`);
          }
          percentage = parsed;
        }

        return {
          partyId,
          percentage,
          originalValue: rawValue,
          note
        };
      });

      const pollId = [agency, client, dateIso].filter(Boolean).join('-');

      return {
        id: slugify(pollId),
        date: dateIso,
        dateLabel,
        agency,
        client,
        source: agencyRaw,
        results
      };
    });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(polls, null, 2), 'utf8');
  console.log(`Wrote ${polls.length} polls to ${OUTPUT_PATH}`);
}

convertCsvToJson();

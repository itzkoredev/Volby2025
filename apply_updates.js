const fs = require('fs');
const path = 'c:/Volby2025/volebni-kalkulacka-2025/public/data/parties.json';
const raw = fs.readFileSync(path);
const content = raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf ? raw.slice(3).toString('utf8') : raw.toString('utf8');
const data = JSON.parse(content);
const updates = JSON.parse(fs.readFileSync('c:/Volby2025/tmp_updates.json', 'utf8'));
const result = data.map((party) => {
  const patch = updates[party.id] || {};
  return {
    ...party,
    ...patch,
    pros: patch.pros ?? party.pros ?? [],
    cons: patch.cons ?? party.cons ?? [],
    historicalAchievements: patch.historicalAchievements ?? party.historicalAchievements ?? [],
    controversies: patch.controversies ?? party.controversies ?? [],
    representatives: patch.representatives ?? party.representatives ?? [],
    sources: patch.sources ?? party.sources ?? [],
  };
});
fs.writeFileSync(path, JSON.stringify(result, null, 2) + '\n', 'utf8');

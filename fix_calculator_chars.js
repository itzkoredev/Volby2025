const fs = require("fs");

const path = "volebni-kalkulacka-2025/src/app/calculator/page.tsx";
let text = fs.readFileSync(path, "utf8");

const replacements = new Map([
  ["            <div className=\"text-sm text-gray-600\">{answeredCount} / {totalTheses} ot��zek</div>", "            <div className=\"text-sm text-gray-600\">{answeredCount} / {totalTheses} otázek</div>"],
  ["              <span>Ot��zka {currentThesis + 1} z {totalTheses}</span>", "              <span>Otázka {currentThesis + 1} z {totalTheses}</span>"],
  ["              <span>{progress}% dokon��eno</span>", "              <span>{progress}% dokončeno</span>"],
  ["                T�cma: {currentThesisData.issueId}", "                Téma: {currentThesisData.issueId}"],
  ["                    {factOpen ? \"Skr�t fakta a souvislosti\" : \"Zobrazit fakta k ot��zce\"}", "                    {factOpen ? \"Skrýt fakta a souvislosti\" : \"Zobrazit fakta k otázce\"}"],
  ["              <Label className=\"text-base font-medium\">Jak moc s t��mto v��rokem souhlas��te?</Label>", "              <Label className=\"text-base font-medium\">Jak moc s tímto výrokem souhlasíte?</Label>"],
  ["              <Label className=\"text-base font-medium\">Jak d��le��it�c je pro v��s toto t�cma?</Label>", "              <Label className=\"text-base font-medium\">Jak důležité je pro vás toto téma?</Label>"],
  ["            P�tedchoz��", "            Předchozí"],
  ["              P�tesko��it", "              Přeskočit"],
  ["            <strong>Zodpov�>zeno: {answeredCount} z {totalTheses} ot��zek</strong>", "            <strong>Zodpovězeno: {answeredCount} z {totalTheses} otázek</strong>"],
  ["              Kl�vesy 1-5 nastav� hodnotu, ➡ nebo Enter posune d��l, ⬅ vr�t�� zp�t, mezern��k přesko�� ot��zku.", "              Klávesy 1–5 nastaví hodnotu, ➡ nebo Enter posune dál, ⬅ vrátí zpět, mezerník přeskočí otázku."]
]);

for (const [bad, good] of replacements) {
  if (!text.includes(bad)) {
    console.error("Missing string:", bad);
  }
  text = text.replace(bad, good);
}

fs.writeFileSync(path, text, "utf8");

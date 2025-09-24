# Volební kalkulačka 2025

Nestranná volební kalkulačka pro české volby 2025 vytvořená jako čistě frontendová webová aplikace s minimální proxy funkcí pro ChatGPT.

## ✅ **STATUS: APLIKACE DOKONČENA A PŘIPRAVENA**

- **26 politických stran** včetně všech hlavních účastníků voleb 2025
- **20 politických tezí** pokrývajících klíčová témata
- **Kompletní mobilní optimalizace** - funkční na všech zařízeních
- **Scoring engine** s reálnými daty a testováním
- **Responsive design** s touch-friendly prvky

## 🎯 Účel projektu

Volební kalkulačka pomáhá voličům porovnat jejich politické názory s pozicemi jednotlivých stran na základě transparentních a ověřitelných zdrojů.

## 🏗️ Technický stack

- **Frontend**: Next.js 15 s App Router, React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS
- **Stavový management**: Zustand
- **Validace dat**: Zod
- **Grafy**: Recharts
- **Vyhledávání**: FlexSearch
- **Deployment**: Vercel
- **Linting**: ESLint, Prettier, Husky

## 📁 Struktura projektu

```text
volebni-kalkulacka-2025/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── calculator/         # Volební kalkulačka
│   │   ├── party/[slug]/       # Profily stran
│   │   ├── chat/               # Chatbot UI
│   │   └── api/chat/           # Proxy funkce pro ChatGPT
│   ├── components/             # React komponenty
│   │   └── ui/                 # shadcn/ui komponenty
│   └── lib/                    # Utility funkce, schemas
├── data/                       # Skripty pro validaci dat
├── public/
│   └── data/                   # JSON datové soubory
└── ...
```

## 📊 Datový model

### Soubory v `public/data/`

- `parties.json` - Data politických stran
- `issues.json` - Témata/oblasti (ekonomika, sociální politika, atd.)
- `theses.json` - Jednotlivé teze/otázky
- `party_positions.json` - Pozice stran k jednotlivým tezím
- `faq.json` - Často kladené otázky
- `sources.json` - Zdroje a odkazy

### Schémata dat

Všechna data jsou validována pomocí Zod schémat definovaných v `src/lib/schemas.ts`.

## 🛠️ Instalace a spuštění

```bash
# Instalace závislostí
npm install

# Spuštění vývojového serveru
npm run dev

# Validace dat
npm run data:validate

# Build pro produkci
npm run build
```

## 📝 Validace dat

Projekt obsahuje robustní validátor dat:

```bash
npm run data:validate
```

Validátor kontroluje:

- ✅ Syntaxi JSON souborů
- ✅ Shodu s Zod schématy
- ✅ Odkazy mezi daty (foreign keys)
- ⚠️ Kompletnost dat (varování)

## 🎨 Vývoj UI

Používáme shadcn/ui komponenty s Tailwind CSS:

```bash
# Přidání nové komponenty
npx shadcn@latest add [component-name]
```

## 🔍 Principy projektu

1. **Transparentnost**: Všechny pozice stran jsou podložené citovanými zdroji
2. **Nestrannost**: Neutrální formulace otázek a objektivní zpracování dat
3. **Otevřenost**: Open source kód a veřejně dostupná data
4. **Ochrana soukromí**: Žádné cookies, minimální analytika

## 📋 Aktuální stav

Dokončena **Fáze 1** podle původního plánu:

- [x] ✅ Vytvoření Next.js aplikace
- [x] ✅ Instalace základních knihoven
- [x] ✅ Nastavení projektové struktury
- [x] ✅ Definice datových schémat
- [x] ✅ Vytvoření základních JSON souborů
- [x] ✅ Implementace validátoru dat

### Další kroky

- [ ] **Fáze 3**: Implementace scoring engine
- [ ] **Fáze 4**: UI kalkulačky a dotazníku
- [ ] **Fáze 5**: Profily stran
- [ ] **Fáze 6**: Chatbot s proxy funkcí
- [ ] **Fáze 7**: RAG-lite vyhledávání
- [ ] **Fáze 8**: Testování
- [ ] **Fáze 9**: Deployment

## 🤝 Přispívání

1. Forkněte repozitář
2. Vytvořte feature branch
3. Před commitem spusťte `npm run data:validate`
4. Vytvořte pull request

## 📄 Licence

MIT License

---

Vytvořeno s ❤️ pro transparentní demokracii v České republice.

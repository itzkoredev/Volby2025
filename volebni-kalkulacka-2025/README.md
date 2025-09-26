# Volební kalkulačka 2025

Nestranná volební kalkulačka pro české volby 2025 vytvořená jako čistě frontendová webová aplikace s klientskou AI asistencí přes Puter SDK.

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
- **AI**: Puter SDK (client-only, bez vlastního proxy)
- **Deployment**: Vercel / vlastní hosting (subpath `/volby2025`)
- **Linting**: ESLint, Prettier, Husky

## 📁 Struktura projektu

```text
volebni-kalkulacka-2025/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── calculator/         # Volební kalkulačka
│   │   ├── party/[slug]/       # Profily stran
│   │   └── chat/               # Chatbot UI (volá Puter SDK přímo z prohlížeče)
│   ├── components/             # React komponenty
│   │   └── ui/                 # shadcn/ui komponenty
│   └── lib/                    # Utility funkce, schemas
├── data/                       # Skripty pro validaci dat
├── public/
│   └── data/                   # JSON datové soubory
└── ...

> ⚠️ Od verze září 2025 již projekt neobsahuje žádnou serverovou proxy k OpenAI; chatbot komunikuje přímo přes Puter SDK načtené na klientovi.
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

## � Nasazení na `www.itzkore.cz/volby2025`

1. **Nastavte base path**
   - V produkci udržujte proměnnou `NEXT_PUBLIC_BASE_PATH=/volby2025`.
   - Netřeba měnit kód – `next.config.mjs` automaticky převezme hodnotu a nastaví `basePath` i `assetPrefix`.

2. **Build aplikace**

   ```bash
   npm install
   NEXT_PUBLIC_BASE_PATH=/volby2025 npm run build
   ```

3. **Nasazení**
   - Pro Vercel: použijte stejnou proměnnou prostředí na projektu a běžný `vercel deploy`.
   - Pro vlastní hosting (např. itzkore.cz):
     - Zkopírujte adresář `.next`, `public`, `package.json`, `next.config.mjs` a `node_modules` na server.
     - Spusťte `npm run start` za reverzní proxy, která servíruje aplikaci na subcestě `/volby2025`.
     - Aktualizujte webserver (NGINX/Apache) tak, aby přesměroval požadavky na zvolený port Next.js (např. 3000) a zachoval prefix `/volby2025`.

4. **Statická data**
   - Všechna JSON data žijí v `public/data`; díky helperu `withBasePath` se načítají relativně k subcestě.
   - Při přidávání nových souborů stačí je uložit do stejného adresáře.
   - Helper nyní detekuje absolutní URL i speciální protokoly (`mailto:`, `tel:`) a v produkci bezpečně přidává prefix jen pro relativní cesty.
   - Jednotkové testy (`src/lib/__tests__/utils.test.ts`) hlídají konzistenci chování ve vývojovém i produkčním režimu.

5. **AI Chatbot (Puter)**
   - Chat page dynamicky načítá skript `https://js.puter.com/v2/` a volá `puter.ai.chat`.
   - Ujistěte se, že doména `www.itzkore.cz` je autorizována v Puter dashboardu a že případné limity API jsou nastaveny podle očekávaného provozu.

## 🔗 Reference k nasazení na subcestě a načítání dat

- [Next.js docs – `basePath`](https://nextjs.org/docs/app/api-reference/config/next-config-js/basePath): oficiální popis konfigurace pro běh na subcestě včetně požadavku ručního prefixování cest u obrázků.
- [Next.js docs – Fetching Data](https://nextjs.org/docs/app/getting-started/fetching-data): doporučení pro práci s `fetch` v App Routeru a cachováním odpovědí.
- [GitHub Discussion #25681](https://github.com/vercel/next.js/discussions/25681): shrnutí problémů s `_next/data` při nasazení více aplikací pod jednou doménou a potřeba vlastního „data path prefixu“.

## ✅ Aktuální stav

- [x] Produkční build bez chyb (`npm run build`)
- [x] Chatbot funguje přes Puter SDK bez serverové proxy
- [x] Všechny stránky a fetch dotazy respektují base path `/volby2025`
- [x] Viewport je definován přes oficiální Next `viewport` export (žádné varování v konzoli)

## 🤝 Přispívání

1. Forkněte repozitář
2. Vytvořte feature branch
3. Před commitem spusťte `npm run data:validate`
4. Vytvořte pull request

## 📄 Licence

MIT License

---

Vytvořeno s ❤️ pro transparentní demokracii v České republice.

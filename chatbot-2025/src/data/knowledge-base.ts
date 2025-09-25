export type KnowledgeSource = {
  label: string;
  url: string;
  accessed: string;
};

export type KnowledgeEntry = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  highlights: string[];
  content: string;
  sources: KnowledgeSource[];
};

export const knowledgeEntries: KnowledgeEntry[] = [
  {
    id: "KB-1",
    title: "Občanská demokratická strana (ODS)",
    summary:
      "Liberálně-konzervativní strana založená v roce 1991. Vede ji premiér Petr Fiala. Prosazuje fiskální disciplínu, podporu podnikání a prozápadní orientaci.",
    tags: ["ods", "pravice", "fiala", "program", "historie"],
    highlights: [
      "1996: první vítězství ve sněmovních volbách pod vedením Václava Klause",
      "2006–2013: období vládní dominance, následné oslabení po kauze Nagyová",
      "2021: lídr koalice SPOLU, vítěz sněmovních voleb a jmenování Petra Fialy premiérem",
    ],
    content:
      "ODS je hlavní česká pravicová strana. Akcentuje nízké daně, reformu vzdělávání, modernizaci obrany a těsnou vazbu na EU a NATO. V programu pro volby 2025 zdůrazňuje odpovědné hospodaření státu, digitalizaci a podporu rodin. Ve vedení jsou mimo premiéra Fialu i 1. místopředseda Zbyněk Stanjura a předseda Senátu Miloš Vystrčil.",
    sources: [
      {
        label: "ODS – Volební program 2025",
        url: "https://www.ods.cz/docs/volby-2025-program.pdf",
        accessed: "2025-09-20",
      },
      {
        label: "ČSÚ – Volby do PS PČR 2021",
        url: "https://www.volby.cz/pls/ps2021/ps3?xjazyk=CZ",
        accessed: "2025-09-10",
      },
    ],
  },
  {
    id: "KB-2",
    title: "Hnutí ANO 2011",
    summary:
      "Centristicko-populistické hnutí bývalého premiéra Andreje Babiše. Klade důraz na sociální jistoty, slevy na jízdném, a investice do infrastruktury.",
    tags: ["ano", "babiš", "sociální program", "investice", "historie"],
    highlights: [
      "2013: Vstup do Poslanecké sněmovny, druhý nejvyšší počet hlasů",
      "2017: Vítězství v parlamentních volbách a vláda Andreje Babiše",
      "2021: Přechod do opozice po vzniku vlády SPOLU + PirSTAN",
    ],
    content:
      "ANO vzniklo jako protikorupční projekt, postupně se profilovalo pragmaticky. V programu pro rok 2025 slibuje zvyšování důchodů, investice do dálnic a energetickou bezpečnost. Kritizuje vládu za rozpočtové škrty. Výraznými osobnostmi jsou vedle Babiše i Alena Schillerová a Karel Havlíček.",
    sources: [
      {
        label: "ANO – Volební program 2025",
        url: "https://hnutiano.cz/volby2025-program",
        accessed: "2025-09-18",
      },
      {
        label: "Demagog.cz – Sledování slibů vlády ANO",
        url: "https://demagog.cz/vlada",
        accessed: "2025-08-30",
      },
    ],
  },
  {
    id: "KB-3",
    title: "Piráti a Starostové (PirSTAN)",
    summary:
      "Koalice zaměřená na transparentnost, digitalizaci a posílení samospráv. Čelní představitelé Ivan Bartoš a Vít Rakušan.",
    tags: ["piráti", "starostové", "digitalizace", "transparentnost", "koalice"],
    highlights: [
      "2021: Koaliční zisk 37 mandátů, Piráti obsadili resorty pro místní rozvoj, legislativu a digitalizaci",
      "2023: Přijetí plánu Digitální Česko 2030",
      "2024: Reforma zákona o obcích pro posílení participace občanů",
    ],
    content:
      "PirSTAN staví na otevřenosti státní správy, dostupném bydlení a decentralizaci. Program pro 2025 slibuje lepší ochranu nájemníků, zelené investice a ochranu dat. Koalice zdůrazňuje spolupráci s obcemi a evropskou koordinaci digitálních projektů.",
    sources: [
      {
        label: "Program PirSTAN 2025",
        url: "https://www.pirstan.cz/program2025",
        accessed: "2025-09-14",
      },
      {
        label: "Digitální Česko 2030",
        url: "https://portal.gov.cz/digitalni-cesko-2030",
        accessed: "2025-07-02",
      },
    ],
  },
  {
    id: "KB-4",
    title: "Volební kalendář a procedury 2025",
    summary:
      "Klíčové termíny a postupy pro prezidentské a parlamentní volby v ČR v roce 2025.",
    tags: ["kalendář", "procedury", "prezidentské volby", "sněmovní volby"],
    highlights: [
      "Leden–únor 2025: registrace kandidátů pro prezidentskou volbu",
      "Duben 2025: první kolo prezidentské volby",
      "Říjen 2025: termín řádných voleb do Poslanecké sněmovny",
    ],
    content:
      "Prezidentská volba 2025 se koná dvoukolově. Kandidáti musí nasbírat 50 000 podpisů občanů nebo nominaci zákonodárců. Sněmovní volby probíhají podle poměrného systému v 14 krajích, D'Hondtovou metodou. Okrskové komise je třeba obsadit do 50 dnů před volbou. Ministerstvo vnitra zveřejňuje oficiální instrukce pro kandidátní listiny a finanční limity kampaní.",
    sources: [
      {
        label: "Ministerstvo vnitra – Harmonogram voleb 2025",
        url: "https://www.mvcr.cz/volby/clanek/harmonogram-voleb-2025.aspx",
        accessed: "2025-09-05",
      },
      {
        label: "Zákon č. 275/2012 Sb. o volbě prezidenta republiky",
        url: "https://www.zakonyprolidi.cz/cs/2012-275",
        accessed: "2025-08-22",
      },
    ],
  },
  {
    id: "KB-5",
    title: "Historický vývoj české stranické scény",
    summary:
      "Přehled hlavních milníků od 1989: vznik ODS a ČSSD, nástup hnutí ANO, růst populistických subjektů.",
    tags: ["historie", "stranický systém", "transformace", "volby"],
    highlights: [
      "1990: Federální volby, dominance Občanského fóra a VPN",
      "1998: Stabilizace duopolu ČSSD – ODS, opoziční smlouva",
      "2013–2021: fragmentace a nástup hnutí (ANO, SPD, Piráti)",
    ],
    content:
      "Po roce 1989 prošla česká politika transformací od hnutí k programovým stranám. ODS a ČSSD dominovaly první dekády, ale finanční skandály a globalizační tlaky otevřely prostor pro hnutí ANO a SPD. Volební účast klesala z 85 % (1990) na ~65 % (2021). Zájem voličů se posouvá k tématům bydlení, inflace a bezpečnosti.",
    sources: [
      {
        label: "Parlamentní institut – Stranický systém v ČR",
        url: "https://www.psp.cz/sqw/odborne.sqw?idd=18877",
        accessed: "2025-08-01",
      },
      {
        label: "STEM – Trendy volební účasti",
        url: "https://www.stem.cz/trendy-volbni-ucasti-1990-2024.pdf",
        accessed: "2025-07-20",
      },
    ],
  },
];

import { KnowledgeBase } from "./types";

export const knowledgeBase: KnowledgeBase = [
  {
    id: "KB-P-ANO",
    kind: "party",
    title: "ANO 2011",
    summary:
      "Centristické hnutí Andreje Babiše staví na sociálních jistotách, infrastruktuře a energetické bezpečnosti.",
    tags: ["ano", "sociální politika", "energie", "infrastruktura", "opozice"],
    highlights: [
      {
        bullet:
          "Program 2025 slibuje levnější energie, dostupné zdravotnictví a státem podporovanou výstavbu nájemních bytů.",
        emphasis: "impact",
      },
      {
        bullet:
          "Deklaruje valorizaci důchodů nad inflaci a zachování slev na jízdném pro studenty a seniory.",
        emphasis: "impact",
      },
      {
        bullet:
          "Ve sněmovních volbách 2021 získalo 27,12 % hlasů a zůstává nejsilnější opoziční silou.",
        emphasis: "history",
      },
    ],
    content: `ANO navazuje na vládní zkušenost z let 2014–2021 a opírá kampaň o sociálně-ekonomická témata. Program 2025 klade důraz na dostupnější energie, zdravotnictví a rozsáhlé investice do infrastruktury včetně státem garantované výstavby nájemních bytů. Hnutí zároveň slibuje valorizaci důchodů nad inflaci a pokračování slev na jízdném pro studenty i seniory.
Po volbách 2021 skončilo ANO se ziskem 27,12 % v opozici a profiluje se jako hlavní kritik vládních úspor. Předsedou zůstává Andrej Babiš, který zdůrazňuje pragmatický přístup, hospodářský růst a silnou roli státu při tlumení drahoty.`,
    sources: [
      {
        label: "ANO 2011 – Program 2025",
        url: "https://www.anobudelip.cz/program",
        accessed: "2025-09-24",
      },
      {
        label: "Volby do Poslanecké sněmovny 2021 – výsledky",
        url: "https://www.volby.cz/pls/ps2021/ps3?xjazyk=CZ",
        accessed: "2025-09-24",
      },
      {
        label: "Wikipedia – ANO 2011",
        url: "https://cs.wikipedia.org/wiki/ANO_2011",
        accessed: "2025-09-24",
      },
    ],
  },
  {
    id: "KB-P-SPOLU",
    kind: "party",
    title: "Koalice SPOLU",
    summary:
      "Koalice ODS, KDU-ČSL a TOP 09 spojuje liberálně-konzervativní směr, proevropskou politiku a důraz na modernizaci ekonomiky. ODS kandiduje v roce 2025 výhradně v rámci SPOLU.",
    tags: ["spolu", "koalice", "vláda", "ekonomika", "eu", "ods", "kdu-čsl", "top 09"],
    highlights: [
      {
        bullet:
          "Program 2025 kombinuje rozpočtovou kázeň s investicemi do energetické bezpečnosti a školství.",
        emphasis: "impact",
      },
      {
        bullet:
          "ODS kandiduje výhradně v rámci koalice SPOLU; samostatnou kandidaturu pro rok 2025 neplánuje.",
        emphasis: "history",
      },
      {
        bullet:
          "Koalice prosazuje pevné ukotvení v EU a NATO, podporu Ukrajiny a zelenou transformaci s důrazem na průmysl.",
        emphasis: "impact",
      },
      {
        bullet:
          "Ve volbách 2021 zvítězila s 27,79 % hlasů a sestavila vládu v čele s Petrem Fialou.",
        emphasis: "history",
      },
    ],
    content: `SPOLU reprezentuje středopravicovou odpověď na výzvy inflace, energetiky a bezpečnosti. Program 2025 počítá s pokračováním konsolidace veřejných financí, investicemi do vzdělávání, digitalizace a podpory podniků při přechodu na nízkoemisní ekonomiku.
Koalice zdůrazňuje pevnou proevropskou a proatlantickou orientaci, podporu Ukrajiny a modernizaci obrany. Politika se opírá o tandem ODS, KDU-ČSL a TOP 09, které koordinují kandidátky a společnou komunikaci. ODS proto nevystupuje samostatně a kandiduje výhradně v rámci koalice SPOLU.`,
    sources: [
      {
        label: "SPOLU - Program 2025",
        url: "https://www.spolecne.cz/program",
        accessed: "2025-09-24",
      },
      {
        label: "Wikipedia - SPOLU",
        url: "https://cs.wikipedia.org/wiki/SPOLU",
        accessed: "2025-09-24",
      },
      {
        label: "Volby 2021 - výsledky koalic",
        url: "https://www.volby.cz/pls/ps2021/ps311?xjazyk=CZ",
        accessed: "2025-09-24",
      },
    ],
  },
  {
    id: "KB-P-STAN",
    kind: "party",
    title: "Starostové a nezávislí (STAN)",
    summary:
      "Hnutí starostů se opírá o komunální zkušenosti, decentralizaci a podporu regionů, digitalizaci a vzdělávání.",
    tags: ["stan", "regiony", "decentralizace", "digitalizace", "vláda"],
    highlights: [
      {
        bullet:
          "Program prosazuje silné obce, investice do regionálních služeb a transparentní rozpočty.",
        emphasis: "impact",
      },
      {
        bullet: "Chce dokončit digitalizaci státní správy a podporovat dostupné bydlení ve městech i na venkově.",
        emphasis: "impact",
      },
      {
        bullet:
          "STAN zůstává součástí vládní koalice a vede resorty vnitra, místního rozvoje i evropské agendy.",
        emphasis: "history",
      },
    ],
    content: `STAN vnáší do celostátní politiky důraz na komunální praxi. V programu 2025 klade důraz na posílení pravomocí obcí, férové financování regionálních služeb a digitalizaci státní správy. Zaměřuje se také na dostupné bydlení, podporu vzdělávání a komunitních projektů.
Hnutí vedené Vítem Rakušanem přebírá odpovědnost za vnitro, evropské záležitosti a regionální rozvoj. Prosazuje transparentnost, otevřená data a participaci občanů na rozhodování.`,
    sources: [
      {
        label: "STAN – Program",
        url: "https://www.starostove-nezavisli.cz/program",
        accessed: "2025-09-24",
      },
      {
        label: "Wikipedia – Starostové a nezávislí",
        url: "https://cs.wikipedia.org/wiki/Starostov%C3%A9_a_nez%C3%A1visl%C3%AD",
        accessed: "2025-09-24",
      },
    ],
  },
  {
    id: "KB-P-PIR",
    kind: "party",
    title: "Česká pirátská strana",
    summary:
      "Piráti prosazují transparentnost, ochranu svobod na internetu, dostupné bydlení a zelenou transformaci.",
    tags: ["Piráti", "transparentnost", "digitalizace", "sociální bydlení", "koalice"],
    highlights: [
      {
        bullet:
          "Program 2025 zahrnuje národní plán dostupného bydlení a posílení práv nájemníků.",
        emphasis: "impact",
      },
      {
        bullet: "Prosazuje ochranu digitálních práv, otevřená data a modernizaci státní správy.",
        emphasis: "impact",
      },
      {
        bullet: "V koalici PirSTAN drží resorty pro místní rozvoj, legislativu i digitalizaci.",
        emphasis: "history",
      },
    ],
    content: `Piráti vstupují do voleb s důrazem na dostupnost bydlení, digitalizaci a klimatickou politiku. Program slibuje silnější postavení nájemníků, podporu družstevní výstavby a ochranu osobních dat. Strana prosazuje otevřený stát, whistleblowing a přísnější kontrolu veřejných zakázek.
V rámci koalice PirSTAN se soustředí na digitalizaci, legislativu a evropské projekty. Předseda Ivan Bartoš akcentuje sociálně liberální hodnoty, udržitelnou ekonomiku a participaci občanů.`,
    sources: [
      {
        label: "Piráti – Program 2025",
        url: "https://www.pirati.cz/program",
        accessed: "2025-09-24",
      },
      {
        label: "Wikipedia – Česká pirátská strana",
        url: "https://cs.wikipedia.org/wiki/%C4%8Cesk%C3%A1_pir%C3%A1tsk%C3%A1_strana",
        accessed: "2025-09-24",
      },
    ],
  },
  {
    id: "KB-P-SPD",
    kind: "party",
    title: "Svoboda a přímá demokracie (SPD)",
    summary:
      "SPD Tomia Okamury spojuje nacionalistické prvky, požadavek přímé demokracie a odpor k povinným kvótám EU.",
    tags: ["spd", "přímá demokracie", "suverenita", "konzervatismus", "migrace"],
    highlights: [
      {
        bullet:
          "Program klade důraz na referenda, posílení prvků přímé demokracie a odvolatelnost politiků.",
        emphasis: "impact",
      },
      {
        bullet:
          "Odmítá přijímání migrantů, Green Deal EU a podporuje energetiku založenou na jádru a uhlí.",
        emphasis: "risk",
      },
      {
        bullet:
          "Ve volbách 2021 získala SPD 9,56 % a drží 20 mandátů ve Sněmovně.",
        emphasis: "history",
      },
    ],
    content: `SPD staví kampaň na odmítání povinných kvót EU, požadavku referend o zásadních otázkách a hájení „tradičních hodnot". Program zdůrazňuje energetiku založenou na jádru a uhlí, podporu rodin a odpor vůči Green Dealu či euru. Okamura prosazuje odvolatelnost politiků a tresty za „zneužívání dávek".
Hnutí se profiluje jako protestní síla zaměřená proti „vládě Bruselu" a požaduje posílení bezpečnostních složek. V Poslanecké sněmovně působí jako opoziční strana s 20 mandáty.`,
    sources: [
      {
        label: "SPD – Volební program",
        url: "https://www.spd.cz/program",
        accessed: "2025-09-24",
      },
      {
        label: "Wikipedia – SPD",
        url: "https://cs.wikipedia.org/wiki/Svoboda_a_p%C5%99%C3%ADm%C3%A1_demokracie",
        accessed: "2025-09-24",
      },
      {
        label: "Volby 2021 – výsledky SPD",
        url: "https://www.volby.cz/pls/ps2021/ps311?xjazyk=CZ",
        accessed: "2025-09-24",
      },
    ],
  },
  {
    id: "KB-P-STACILO",
    kind: "party",
    title: "Koalice STAČILO!",
    summary:
      "Levicový blok kolem KSČM, SD-SN a dalších iniciativ prosazuje sociální stát, dostupné bydlení a kritiku privatizace.",
    tags: ["stacilo", "levice", "sociální stát", "bydlení", "KSČM"],
    highlights: [
      {
        bullet:
          "Program slibuje nulové DPH na základní potraviny a masivní podporu družstevního a obecního bydlení.",
        emphasis: "impact",
      },
      {
        bullet:
          "Požaduje bankovní daň pro velké finanční domy a progresivní zdanění velkých korporací.",
        emphasis: "impact",
      },
      {
        bullet: "Odmítá privatizaci strategických podniků a volá po znárodnění klíčových energetických firem.",
        emphasis: "risk",
      },
    ],
    content: `STAČILO! spojuje levicové strany a odborářské iniciativy kolem lídryně Kateřiny Konečné. Program zdůrazňuje sociální jistoty: nulovou DPH na základní potraviny, výstavbu obecních a družstevních bytů a bankovní daň na financování veřejných služeb. Prosazuje progresivní daňový systém a vyšší minimální mzdu.
Koalice požaduje návrat strategických podniků do rukou státu, regulaci cen energií a kritizuje zahraniční vojenské mise. Profiluje se jako hlas „umlčované většiny" proti „drahotě" a vládním škrtům.`,
    sources: [
      {
        label: "STAČILO! – Program",
        url: "https://www.stacilo.cz/#program",
        accessed: "2025-09-24",
      },
      {
        label: "Wikipedia – STAČILO!",
        url: "https://cs.wikipedia.org/wiki/Sta%C4%8Dilo!",
        accessed: "2025-09-24",
      },
    ],
  },
  {
    id: "KB-P-MOT",
    kind: "party",
    title: "Motoristé sobě",
    summary:
      "Hnutí Motoristé sobě hájí zájmy řidičů, kritizuje regulace dopravy a prosazuje investice do infrastruktury.",
    tags: ["motoristé", "doprava", "nízké daně", "infrastruktura"],
    highlights: [
      {
        bullet: "Požaduje levnější pohonné hmoty, přehledný systém dálnic a ochranu individuální mobility.",
        emphasis: "impact",
      },
      {
        bullet:
          "Odmítá plošné zavádění nízkoemisních zón a preferuje cílené modernizace dopravy.",
        emphasis: "risk",
      },
      {
        bullet: "Prosazuje přesun části spotřební daně z pohonných hmot do oprav silnic II. a III. třídy.",
        emphasis: "impact",
      },
    ],
    content: `Motoristé sobě se profilují jako hlas řidičů proti restrikcím a zdražování dopravy. Program slibuje snížení daní na pohonné hmoty, revizi mýtného a investice do oprav krajských silnic. Hnutí chce chránit individuální mobilitu a zpochybňuje plošné zavádění nízkoemisních zón bez náhradních tras.
Zároveň navrhuje podporu elektromobility formou dobrovolných pobídek, nikoli povinných zákazů. Prosazuje také bezpečnější infrastrukturu pro motocyklisty a profesionální řidiče.`,
    sources: [
      {
        label: "Motoristé sobě – Program 2025",
        url: "https://www.motoristesobe.cz/program2025",
        accessed: "2025-09-24",
      },
      {
        label: "Wikipedia – Motoristé sobě",
        url: "https://cs.wikipedia.org/wiki/Motorist%C3%A9_sob%C4%9B",
        accessed: "2025-09-24",
      },
    ],
  },
  {
    id: "KB-P-VOLT",
    kind: "party",
    title: "Volt Česká republika",
    summary:
      "Proevropské hnutí Volt prosazuje jednotnou evropskou politiku, klimatická opatření a digitální transformaci.",
    tags: ["volt", "evropa", "klima", "digitalizace", "mladí"],
    highlights: [
      {
        bullet: "Chce společnou evropskou energetickou politiku a rychlejší přechod k obnovitelným zdrojům.",
        emphasis: "impact",
      },
      {
        bullet: "Navrhuje celoevropské standardy digitální gramotnosti a podporu start-upů přes InvestEU.",
        emphasis: "impact",
      },
      {
        bullet: "Volt staví na participaci mladých voličů a navazuje na Volt Europa, která má svého europoslance v Evropském parlamentu.",
        emphasis: "history",
      },
    ],
    content: `Volt ČR přináší do kampaně celoevropská témata: jednotnou klimatickou politiku, digitální práva a sociálně odpovědný kapitalismus. Program podporuje rychlejší rozvoj obnovitelných zdrojů, přeshraniční energetické projekty a investice do technologických inovací.
Hnutí se inspiruje evropskou organizací Volt Europa a cílí na mladé voliče, kteří chtějí aktivní účast Česka v EU. Prosazuje transparentní financování kampaní a moderní participativní nástroje.`,
    sources: [
      {
        label: "Volt Europa – Policies",
        url: "https://www.volteuropa.org/policies",
        accessed: "2025-09-24",
      },
      {
        label: "Wikipedia – Volt Česká republika",
        url: "https://cs.wikipedia.org/wiki/Volt_%C4%8Cesk%C3%A1_republika",
        accessed: "2025-09-24",
      },
    ],
  },
  {
    id: "KB-P-GEN",
    kind: "party",
    title: "Hnutí Generace",
    summary:
      "Mladé středové hnutí akcentuje dostupné bydlení, klimatickou odpovědnost a digitalizaci veřejných služeb.",
    tags: ["hnutigenerace", "mladí", "bydlení", "klima", "digitalizace"],
    highlights: [
      {
        bullet: "Prosazuje státní garance pro startovací bydlení mladých a podporu družstevních projektů.",
        emphasis: "impact",
      },
      {
        bullet: "Chce investovat do klimatické adaptace měst – modrozelené infrastruktury a komunitní energetiky.",
        emphasis: "impact",
      },
      {
        bullet: "Požaduje digitalizaci služeb státu s důrazem na UX a otevřená data.",
        emphasis: "impact",
      },
    ],
    content: `Hnutí Generace vzniklo s cílem oslovit první voliče a mladé rodiny. Program staví na dostupném bydlení, sdílené ekonomice a klimatické resilienci. Navrhuje státní garance pro startovací hypotéky, podporu družstev a komunitní energetiku.
Hnutí zdůrazňuje participaci občanů, digitální služby a transparentní politiku. Chce také silnější zastoupení mladých lidí v poradních orgánech státu.`,
    sources: [
      {
        label: "Hnutí Generace – Program",
        url: "https://www.hnutigenerace.cz/program/",
        accessed: "2025-09-24",
      },
      {
        label: "Wikipedia – Hnutí Generace",
        url: "https://cs.wikipedia.org/wiki/Hnut%C3%AD_Generace",
        accessed: "2025-09-24",
      },
    ],
  },
  {
    id: "KB-P-PRIS",
    kind: "party",
    title: "Přísaha",
    summary:
      "Hnutí bývalého policisty Roberta Šlachty zdůrazňuje boj s korupcí, pořádek a posílení bezpečnostních složek.",
    tags: ["přísaha", "bezpečnost", "korupce", "justiční reforma"],
    highlights: [
      {
        bullet: "Program požaduje speciální protikorupční státní zastupitelství a přísnější tresty za hospodářskou kriminalitu.",
        emphasis: "impact",
      },
      {
        bullet: "Chce posílit policii, hasiče a investice do vybavení IZS.",
        emphasis: "impact",
      },
      {
        bullet: "Prosazuje majetková přiznání politiků a transparentní financování kampaní.",
        emphasis: "impact",
      },
    ],
    content: `Přísaha navazuje na bezpečnostní zkušenost Roberta Šlachty a klade důraz na pořádek a transparentnost. Program požaduje zavedení speciálního protikorupčního státního zastupitelství, přísnější tresty za hospodářskou kriminalitu a majetková přiznání politiků.
Hnutí zdůrazňuje podporu policie, hasičů a IZS včetně moderní techniky a lepšího odměňování. V sociální oblasti upozorňuje na potřebu ochrany obětí kriminality a dostupné zdravotnictví.`,
    sources: [
      {
        label: "Přísaha – Program",
        url: "https://www.prisaha.cz/program",
        accessed: "2025-09-24",
      },
      {
        label: "Wikipedia – Přísaha",
        url: "https://cs.wikipedia.org/wiki/P%C5%99%C3%ADsaha",
        accessed: "2025-09-24",
      },
    ],
  },
  {
    id: "KB-T-VK",
    kind: "process",
    title: "Volební kalendář 2025",
    summary:
      "Rok 2025 přinese na jaře prezidentské volby a na podzim řádné volby do Poslanecké sněmovny.",
    tags: ["kalendář", "procedury", "prezidentské volby", "parlamentní volby"],
    highlights: [
      {
        bullet: "Registrace kandidátů na prezidenta proběhne v lednu a únoru 2025.",
        emphasis: "history",
      },
      {
        bullet: "První kolo prezidentské volby je plánováno na duben 2025.",
        emphasis: "impact",
      },
      {
        bullet: "Řádné volby do Poslanecké sněmovny se očekávají v říjnu 2025.",
        emphasis: "history",
      },
    ],
    content: `Prezidentská volba v roce 2025 proběhne dvoukolově, kandidáti potřebují 50 tisíc podpisů občanů nebo podporu zákonodárců. Ministerstvo vnitra stanoví lhůty pro registraci i finanční limity kampaní.
Poslanecké volby se konají ve 14 krajích poměrným systémem s pětiprocentní klauzulí. Okrskové komise musí být jmenovány minimálně 50 dnů před volbami, hlasování probíhá v pátek a sobotu.`,
    sources: [
      {
        label: "Ministerstvo vnitra – Harmonogram voleb 2025",
        url: "https://www.mvcr.cz/volby/clanek/harmonogram-voleb-2025.aspx",
        accessed: "2025-09-24",
      },
      {
        label: "Zákon č. 275/2012 Sb.",
        url: "https://www.zakonyprolidi.cz/cs/2012-275",
        accessed: "2025-09-24",
      },
    ],
  },
  {
    id: "KB-T-HIST",
    kind: "topic",
    title: "Historie české stranické scény",
    summary:
      "Český stranický systém prošel od roku 1989 transformací od duopolu ODS–ČSSD k fragmentované scéně hnutí.",
    tags: ["historie", "strany", "volby", "trendy"],
    highlights: [
      {
        bullet: "90. léta dominovala dvojice ODS a ČSSD; opoziční smlouva 1998 stabilizovala duopol.",
        emphasis: "history",
      },
      {
        bullet: "Po roce 2013 nastoupila hnutí ANO a SPD, volební účast osciluje kolem 60–65 %.",
        emphasis: "history",
      },
      {
        bullet: "Rostou témata bydlení, inflace a bezpečnosti – důležitá pro volby 2025.",
        emphasis: "impact",
      },
    ],
    content: `Od roku 1989 se český stranický systém vyvíjel od hnutí Občanské fórum k etablovaným stranám. Devadesátá léta dominovala dvojice ODS a ČSSD, které uzavřely opoziční smlouvu v roce 1998. Po korupčních kauzách a ekonomických změnách nastoupila nová hnutí jako ANO, SPD či Piráti.
Volební účast klesla z 85 % (1990) na zhruba 65 % v posledních volbách. Průzkumy ukazují, že voliči sledují zejména inflaci, bydlení, energetiku a bezpečnost.`,
    sources: [
      {
        label: "Parlamentní institut – Stranický systém v ČR",
        url: "https://www.psp.cz/sqw/odborne.sqw?idd=18877",
        accessed: "2025-09-24",
      },
      {
        label: "STEM – Trendy volební účasti",
        url: "https://www.stem.cz/trendy-volbni-ucasti-1990-2024.pdf",
        accessed: "2025-09-24",
      },
    ],
  },
];

export default knowledgeBase;





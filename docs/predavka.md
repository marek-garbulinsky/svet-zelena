# Svět zelená – předávka

Zábavná mapa světa: kolik elektřiny země vyrábějí z čistých zdrojů (OZE + jádro) a kolik z uhlí, 2000 → 2025.
Živý prototyp: https://claude.ai/artifact/3UuS7oUDLCtk7D2owSKaGY
Nápady a plán: https://claude.ai/artifact/7tCEK3kvPQ7wQ93FN9fEW8

## Soubory

| Soubor | Co to je |
| --- | --- |
| `template.html` | Zdroj stránky (HTML + CSS + JS v jednom). Obsahuje značky `__TOPO__`, `__DATA__`, `__CONT__`. |
| `index.html` | Sestavená stránka, dá se rovnou otevřít v prohlížeči nebo nasadit. |
| `kviz.html` | Prototyp denního kvízu „Kdo je čistší?“ (zatím s ručně zadanými přibližnými daty). |
| `data/countries-110m.json` | Hranice zemí (world-atlas 2.0.2, Natural Earth, volné dílo). ID zemí = ISO 3166 numeric. |
| `data/countries.json` | Data po zemích a letech. **Teď z OWID energy-data, je potřeba přepnout na Ember.** |
| `data/continents.json` | Data po kontinentech (regiony Emberu převzaté přes OWID). |
| `data/iso.json` | Převodník ISO alpha-3 → [numeric, alpha-2, český název]. |
| `scripts/build.py` | `python3 scripts/build.py` → vloží data do šablony a vytvoří `index.html`. |
| `scripts/ember_to_json.py` | `python3 scripts/ember_to_json.py ember.csv` → přepíše `countries.json` a `continents.json` z dat Emberu. |

Knihovny se načítají z CDN: d3 7.8.5 a topojson 3.0.2 z cdnjs.

## Úkol 1: přepnout data na Ember (kvůli licenci)

Dataset OWID obsahuje i čísla Energy Institute, která nemají čistou licenci pro rozsáhlé přebírání.
Ember je celý pod CC BY 4.0 (komerční použití povoleno s uvedením zdroje).

1. Stáhnout roční dataset: https://ember-energy.org/data/yearly-electricity-data/
2. `python3 scripts/ember_to_json.py <stažený.csv>`
   - Skript zvládá starý „long“ formát (Variable/Unit/Value) i nový formát z 7/2026 (sloupec „Electricity source“, metriky jako sloupce). Otestováno jen na umělých CSV v obou formátech, na skutečném souboru Emberu ne. Pokud se názvy sloupců nebo hodnot liší, uprav `read()` ve skriptu.
   - Na konci vypíše kontrolu: svět 2025 by měl vyjít zhruba 43 % čisté, 33 % uhlí, kolem 460 g CO₂/kWh, kolem 10 500 TWh z uhlí. Česko zhruba 59 % čisté, 35 % uhlí.
3. `python3 scripts/build.py`
4. V `template.html` upravit poznámku o zdroji dat dole na stránce na: „Data: Ember (ember-energy.org), licence CC BY 4.0“ s odkazem.

## Úkol 2: nasazení

- Statický web: GitHub Pages nebo Cloudflare Pages, zdarma.
- Měsíční aktualizace: GitHub Action, která stáhne CSV z Emberu, spustí `ember_to_json.py` a `build.py` a commitne výsledek. (Ember nabízí i API s klíčem zdarma.)
- Doména: .com nebo .org pro světovou verzi, .cz jako česká verze.

## Jak funguje stránka (pro úpravy)

- Mapa: d3 `geoNaturalEarth1`, zoom přes `d3.zoom`. Na mobilu (šířka ≤ 700 px) jiný viewBox 600×680 a výchozí přiblížení na Evropu.
- `render(rok)` překreslí vše podle roku (barvy zemí, komíny, větrníky, karty, zápas, kontinenty). Rok je desetinné číslo, mezi roky se interpoluje.
- Barva = podíl čisté elektřiny, komín při uhlí ≥ 30 %, větrník při čisté ≥ 85 % a uhlí < 10 %.
- Přepočty: vlaky (1 TWh ≈ 400 000 t uhlí, vlak 50 × 60 t, 800 m), km autem (150 g CO₂/km), telefon vs. Norsko podle g CO₂/kWh.
- Sluneční čtverec 630 × 630 km: náhrada fosilních paliv (asi 520 EJ) ≈ 60 000 TWh elektřiny, 150 kWh/m² pozemku a rok.
- Sluneční počítadlo: 89 000 TW na povrch, Česko asi 1,6 EJ primární energie ročně.

## Další nápady (viz dokument s plánem)

Režim videa 9:16 pro TikTok (Puppeteer → MP4), anglická verze, napojení kvízu na skutečná data, vložitelná mapa pro weby a školy.

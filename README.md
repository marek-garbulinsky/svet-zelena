# Svět zelená

Hravá mapa světa: kolik elektřiny země vyrábějí z čistých zdrojů (obnovitelné + jádro)
a kolik z uhlí, od roku 2000 do posledního roku, který Ember vydal. Mapa se dá přehrát
jako film, země u toho zelenají a komíny nad nimi mizí.

Odborné stránky na tohle téma existují (Electricity Maps, Ember, Our World in Data).
Mezera, do které míří tenhle projekt, je hravá verze pro běžné lidi a krátká svislá videa.

Stránka je obyčejný statický web: HTML, CSS a kousek JavaScriptu, data jako jeden JSON.
Žádný server, žádný build krok.

## Co v tom je

| Cesta | Co to je |
| --- | --- |
| `web/` | Celá stránka. To, co se nasazuje. |
| `web/index.html`, `styl.css`, `app.js`, `texty.js` | Stránka, vzhled, logika, všechny texty česky i anglicky. |
| `web/data/elektrina.json` | Data po zemích, kontinentech a letech. Vyrábí se z dat Emberu. |
| `web/data/zeme.json` | Převodník ISO alpha‑3 → číselný kód mapy, název česky a anglicky, vlajka. |
| `web/data/svet-110m.json` | Hranice zemí (world‑atlas 2.0.2, Natural Earth, volné dílo). |
| `tools/stahni-data.mjs` | Stáhne data Emberu a přepočítá `elektrina.json`. |
| `tools/ember-na-json.mjs` | Samotný převod CSV → JSON, včetně kontrol. |
| `tools/zeme.mjs` | Postaví `zeme.json`. Pouští se jen když přibude země. |
| `tools/natoc-video.mjs` | Natočí svislé video 9:16 pro TikTok a Shorts. |
| `tools/server.mjs` | Malý statický server pro vývoj. |
| `web/kviz.html`, `kviz.css`, `kviz.js` | Denní kvíz „Kdo je čistší?“ — osm soubojů na den, pro všechny stejných, ze skutečných dat. |

## Spuštění

```sh
npm install        # jen pro natáčení videa, samotná stránka nic nepotřebuje
npm run server     # http://localhost:8123/
```

Jazyk se bere z prohlížeče, přepíná tlačítkem a jde vynutit adresou: `?lang=cs`, `?lang=en`.
Volba se pamatuje a přenáší se i mezi mapou a kvízem.

Kvíz je na `/kviz.html`. Souboje se losují z data, ne náhodně, takže je celý svět má
na daný den stejné a výsledek se dá sdílet čtverečky jako u Wordle. Hraje se jen
s padesáti největšími výrobci elektřiny, kteří mají data za poslední rok — o zemích
bez letošních čísel by kvíz tvrdil něco, co neví.

## Data

Zdroj je [Ember – Yearly electricity data](https://ember-energy.org/data/yearly-electricity-data/),
licence **CC BY 4.0**, komerční použití povolené s uvedením zdroje.

Záměrně to **není** dataset Our World in Data: ten do sebe míchá i čísla Energy Institute,
která takhle volnou licenci nemají.

```sh
npm run data       # stáhne CSV a přepočítá web/data/elektrina.json
```

Převod si na konci sám zkontroluje několik čísel, u kterých víme, jak mají zhruba vyjít
(čistá a uhelná elektřina ve světě, intenzita, TWh z uhlí, Česko). Když Ember změní formát
CSV, skript spadne s chybou, místo aby tiše vyrobil nesmysly.

Ember už jednou soubor přestěhoval a na staré adrese nechal dvouřádkové CSV s novou adresou.
Stahovací skript tenhle případ pozná a jde za odkazem.

Z každé země a roku se berou čtyři čísla: podíl čisté elektřiny, podíl uhlí, emisní intenzita
v g CO₂e/kWh a podíly slunce a větru. Roky, za které země data nemá, se dotahují poslední
známou hodnotou a u země se pamatuje, kterým rokem její skutečná data končí — stránka to
u takové země napíše.

## Video pro TikTok

```sh
npm run video -- --sekundy 16 --lang cs
```

Otevře stránku s `?video=1` v rozlišení 1080 × 1920 (bez ovládání, velký letopočet, mapa,
závod kontinentů, skóre světa dole), projede roky **po snímcích** a složí z nich MP4.
Nic se nepřehrává v reálném čase, takže video vypadá stejně i na pomalém počítači.

Volby: `--od`, `--do`, `--sekundy`, `--fps`, `--lang cs|en`, `--kam svet|eu`, `--ven cesta.mp4`.

Potřebuje Chrome (hledá ho na obvyklých místech, jinde se dá určit `CHROME_PATH`).
ffmpeg se použije systémový, a když žádný není, ten z balíčku `ffmpeg-static`.

## Nasazení

`.github/workflows/pages.yml` nasadí obsah `web/` na GitHub Pages při každém pushnutí
do větve `main`. V nastavení repozitáře je potřeba jednou přepnout **Settings → Pages →
Source** na **GitHub Actions**.

`.github/workflows/data.yml` jednou měsíčně stáhne nová data a commitne je, pokud se
změnila. Dá se spustit i ručně přes **Actions → data → Run workflow**.

## Licence

Kód je tenhle repozitář. Data jsou Emberu pod CC BY 4.0, hranice zemí z Natural Earth
jsou volné dílo. Při přebírání uvádějte zdroj dat.

// Z ročního datasetu Emberu vyrobí jeden malý JSON pro web.
//
// Proč Ember a ne Our World in Data: data OWID míchají dovnitř i čísla Energy
// Institute, která nemají licenci na rozsáhlé přebírání. Ember je celý pod
// CC BY 4.0 včetně komerčního užití, stačí uvést zdroj.
//
// Pouštět: node tools/ember-na-json.mjs data/zdroj/ember-yearly.csv web/data/zeme.json web/data/elektrina.json
//
// Pro každou zemi a rok si bereme pět čísel:
//   čistá % (obnovitelné + jádro), uhlí %, g CO₂e/kWh, slunce %, vítr %
// Roky bez dat se dotahují poslední známou hodnotou a u země se pamatuje,
// kterým rokem její data končí — část zemí má poslední rok 2024, ne 2025,
// a bez té značky by stránka tvrdila, že o nich ví něco, co neví.
import { readFileSync, writeFileSync } from 'node:fs';
import { tabulka } from './csv.mjs';

const [, , cestaCsv, cestaZeme, cestaVen] = process.argv;
const ROK0 = 2000;

const zeme = JSON.parse(readFileSync(cestaZeme, 'utf8'));
const { hlavicka: h, data } = tabulka(readFileSync(cestaCsv, 'utf8'));

const S = (n) => {
	if (!(n in h)) throw new Error('v CSV chybí sloupec „' + n + '“ — Ember nejspíš změnil formát');
	return h[n];
};
const iOblast = S('Area');
const iIso = S('ISO 3 code');
const iRok = S('Year');
const iTyp = S('Area type');
const iZdroj = S('Electricity source');
const iPodil = S('Share of generation (%)');
const iTwh = S('Generation (TWh)');
const iIntenzita = S('Emissions intensity (gCO2e/kWh)');

const cis = (r, i) => {
	const v = r[i];
	return v === '' || v === undefined ? null : Number(v);
};

// ---------- posbírej ----------
// sber[oblast] = { rok: {cista, uhli, intenzita, slunce, vitr, uhliTwh, celkemTwh} }
const sber = new Map();
const isoOblasti = new Map();
let maxRok = ROK0;
for (const r of data) {
	if (r.length < 8) continue;
	const rok = Number(r[iRok]);
	if (!Number.isFinite(rok) || rok < ROK0) continue;
	const oblast = r[iOblast];
	if (!sber.has(oblast)) sber.set(oblast, new Map());
	const podleRoku = sber.get(oblast);
	if (!podleRoku.has(rok)) podleRoku.set(rok, {});
	const z = podleRoku.get(rok);
	if (r[iIso]) isoOblasti.set(oblast, r[iIso]);

	switch (r[iZdroj]) {
		case 'Clean': z.cista = cis(r, iPodil); break;
		case 'Coal': z.uhli = cis(r, iPodil); z.uhliTwh = cis(r, iTwh); break;
		case 'Solar': z.slunce = cis(r, iPodil); break;
		case 'Wind': z.vitr = cis(r, iPodil); break;
		case 'Total generation':
			z.intenzita = cis(r, iIntenzita);
			z.celkemTwh = cis(r, iTwh);
			if (oblast === 'World' && z.intenzita !== null) maxRok = Math.max(maxRok, rok);
			break;
		default: break;
	}
	if (r[iTyp] !== 'Region' && r[iTyp] !== 'Country or economy') continue;
}

const ROK1 = maxRok;
const roky = [];
for (let y = ROK0; y <= ROK1; y++) roky.push(y);

const z1 = (v) => (v === null || v === undefined ? null : Math.round(v * 10) / 10);
const z0 = (v) => (v === null || v === undefined ? null : Math.round(v));

/// Plná řada od ROK0 do ROK1: chybějící roky dotáhne poslední známou hodnotou,
/// chybějící začátek první známou. Vrátí i poslední rok se skutečnými daty.
function rada(podleRoku, polozky, zaokrouhli) {
	const out = [];
	let posledni = null;
	let posledniRok = null;
	for (const y of roky) {
		const z = podleRoku.get(y);
		const ma = z && polozky.every((p) => z[p] !== null && z[p] !== undefined);
		if (ma) {
			posledni = polozky.map((p, i) => zaokrouhli[i](z[p]));
			posledniRok = y;
		}
		out.push(posledni ? posledni.slice() : null);
	}
	const prvni = out.find((v) => v !== null);
	if (!prvni) return null;
	for (let i = 0; i < out.length && out[i] === null; i++) out[i] = prvni.slice();
	return { rada: out, do: posledniRok };
}

// ---------- země ----------
const POL = ['cista', 'uhli', 'intenzita', 'slunce', 'vitr'];
const ZAOKR = [z1, z1, z0, z1, z1];
const vystupZeme = {};
let bezKodu = 0;
for (const [oblast, podleRoku] of sber) {
	const iso3 = isoOblasti.get(oblast);
	if (!iso3) continue; // regiony a agregáty řešíme zvlášť
	const meta = zeme[iso3];
	if (!meta || !meta.kod || meta.kod === '000') { bezKodu++; continue; }
	const r = rada(podleRoku, POL, ZAOKR);
	if (!r) continue;
	// Kolik země vyrobí elektřiny, poslední známý rok. Řada po letech by soubor
	// zbytečně nafoukla; tohle jedno číslo stačí kvízu na to, aby nestavěl
	// souboje mezi mikrostáty, o kterých nikdo nic neví.
	const velikost = rada(podleRoku, ['celkemTwh'], [z0]);
	vystupZeme[meta.kod] = {
		cs: meta.cs,
		en: meta.en,
		vlajka: meta.vlajka,
		do: r.do,
		twh: velikost ? velikost.rada.at(-1)[0] : 0,
		r: r.rada,
	};
}

// ---------- svět ----------
const svetSur = sber.get('World');
if (!svetSur) throw new Error('v CSV není řádek za celý svět');
const svet = rada(svetSur, ['cista', 'uhli', 'intenzita', 'uhliTwh', 'celkemTwh'], [z1, z1, z0, z0, z0]);

// ---------- kontinenty ----------
// Regiony Emberu: Latinská Amerika je včetně Karibiku, Blízký východ vede Ember
// zvlášť, takže v „Asii“ není.
const KONTINENTY = [
	['eu', 'Evropa', 'Europe', '🏰', 'Europe'],
	['as', 'Asie', 'Asia', '🐉', 'Asia'],
	['na', 'Severní Amerika', 'North America', '🦅', 'North America'],
	['la', 'Latinská Amerika', 'Latin America', '🦜', 'Latin America and Caribbean'],
	['af', 'Afrika', 'Africa', '🦁', 'Africa'],
	['oc', 'Oceánie', 'Oceania', '🦘', 'Oceania'],
	['me', 'Blízký východ', 'Middle East', '🕌', 'Middle East'],
];
const vystupKont = {};
for (const [klic, cs, en, emoji, nazev] of KONTINENTY) {
	const sur = sber.get(nazev);
	if (!sur) { console.warn('chybí region', nazev); continue; }
	const r = rada(sur, ['cista', 'uhli'], [z1, z1]);
	if (r) vystupKont[klic] = { cs, en, emoji, r: r.rada };
}

/// Datum znamená „kdy se data naposledy změnila“, ne „kdy jsme to pustili“.
/// Kdyby se přepisovalo při každém běhu, měsíční Action by commitovala pokaždé
/// jediný změněný řádek s datumem, i když Ember nevydal nic nového.
function datumZmeny(novy) {
	try {
		const stary = JSON.parse(readFileSync(cestaVen, 'utf8'));
		const { vyrobeno, ...zbytekStary } = stary;
		const { vyrobeno: _, ...zbytekNovy } = novy;
		if (JSON.stringify(zbytekStary) === JSON.stringify(zbytekNovy)) return vyrobeno;
	} catch (e) { /* soubor ještě není nebo je rozbitý */ }
	return new Date().toISOString().slice(0, 10);
}

const vystup = {
	rok0: ROK0,
	rok1: ROK1,
	vyrobeno: null,
	zdroj: 'Ember – Yearly electricity data, CC BY 4.0',
	zdrojOdkaz: 'https://ember-energy.org/data/yearly-electricity-data/',
	polozky: POL,
	zeme: vystupZeme,
	svet: svet.rada,
	kontinenty: vystupKont,
};
vystup.vyrobeno = datumZmeny(vystup);
writeFileSync(cestaVen, JSON.stringify(vystup) + '\n');

// ---------- kontrola ----------
// Čísla, u kterých víme, jak mají zhruba vyjít. Když se Ember přeformátuje
// nebo se mapování zdrojů rozbije, pozná se to tady, ne až na stránce.
const kB = (readFileSync(cestaVen).length / 1024).toFixed(0);
const posledni = svet.rada.at(-1);
const cesko = vystupZeme['203'];
console.log(`roky ${ROK0}–${ROK1} · zemí ${Object.keys(vystupZeme).length} · kontinentů ${Object.keys(vystupKont).length} · ${kB} kB`);
console.log(`svět ${ROK1}: čistá ${posledni[0]} %, uhlí ${posledni[1]} %, ${posledni[2]} g CO₂e/kWh, ${posledni[3]} TWh z uhlí`);
if (cesko) console.log(`Česko ${cesko.do}: čistá ${cesko.r.at(-1)[0]} %, uhlí ${cesko.r.at(-1)[1]} %`);

const cekani = [
	['čistá ve světě', posledni[0], 38, 48],
	['uhlí ve světě', posledni[1], 28, 38],
	['intenzita světa', posledni[2], 400, 520],
	['TWh z uhlí', posledni[3], 9000, 12000],
	['čistá v Česku', cesko && cesko.r.at(-1)[0], 50, 70],
];
let spatne = 0;
for (const [co, v, od, do_] of cekani) {
	if (v === null || v === undefined || v < od || v > do_) {
		console.error(`  POZOR: ${co} = ${v}, čekal jsem ${od}–${do_}`);
		spatne++;
	}
}
if (spatne) {
	console.error(`${spatne} kontrol neprošlo — Ember nejspíš změnil formát, mrkni na mapování zdrojů nahoře.`);
	process.exit(1);
}
console.log('kontroly prošly');

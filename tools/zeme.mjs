// Postaví tabulku zemí: trojmístný kód (ten má Ember) → číselný kód (ten mají
// mapová data), plus český a anglický název a vlajka.
//
// České názvy jsou ručně projité v tools/iso.json, anglické se berou z běžného
// seznamu ISO. Pouští se jen když se změní seznam zemí, výsledek
// (web/data/zeme.json) leží v repozitáři.
//
// Pouštět: node tools/zeme.mjs data/zdroj/country-codes.csv tools/iso.json web/data/zeme.json
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { tabulka } from './csv.mjs';

const KODY_ZDROJ = 'https://raw.githubusercontent.com/datasets/country-codes/master/data/country-codes.csv';

const [, , cestaKody, cestaIso, cestaVen] = process.argv;
// Surová CSV v repozitáři nejsou, tak si je v případě potřeby stáhneme.
if (!existsSync(cestaKody)) {
	console.log('stahuji', KODY_ZDROJ);
	const o = await fetch(KODY_ZDROJ);
	if (!o.ok) throw new Error('stažení selhalo: ' + o.status);
	mkdirSync(dirname(cestaKody), { recursive: true });
	writeFileSync(cestaKody, await o.text());
}
const { hlavicka: h, data } = tabulka(readFileSync(cestaKody, 'utf8'));
const iso = JSON.parse(readFileSync(cestaIso, 'utf8')); // alpha3 → [numeric, alpha2, český název]

const i3 = h['ISO3166-1-Alpha-3'];
const iEn = h['CLDR display name'];
const iOf = h['official_name_en'];

const anglicky = {};
for (const r of data) {
	const a3 = (r[i3] || '').trim();
	if (a3) anglicky[a3] = (r[iEn] || r[iOf] || a3).trim();
}

/// Vlajka z dvoumístného kódu: dvě písmena přepsaná na regionální indikátory.
function vlajka(a2) {
	if (!a2 || a2.length !== 2) return '';
	return String.fromCodePoint(...[...a2.toUpperCase()].map((z) => 0x1f1e6 + z.charCodeAt(0) - 65));
}

const zeme = {};
for (const [a3, [num, a2, cs]] of Object.entries(iso)) {
	zeme[a3] = {
		kod: String(num).padStart(3, '0'),
		cs,
		en: anglicky[a3] || cs,
		vlajka: vlajka(a2),
	};
}

writeFileSync(cestaVen, JSON.stringify(zeme) + '\n');
console.log('zemí v tabulce:', Object.keys(zeme).length);

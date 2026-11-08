// Stáhne roční data Emberu a přepočítá web/data/elektrina.json.
// Tohle pouští i GitHub Action jednou měsíčně; žádný server k tomu není potřeba.
//
// Pouštět: node tools/stahni-data.mjs
import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const KOREN = resolve(new URL('..', import.meta.url).pathname);
const ZDROJ = 'https://files.ember-energy.org/public-downloads/generation/outputs/release_generation_yearly_global.csv';
const CSV = resolve(KOREN, 'data/zdroj/ember-yearly.csv');

/// Ember už jednou soubor přestěhoval a na staré adrese nechal dvouřádkové CSV
/// se sloupcem new_url. Když to udělá znovu, jdeme za odkazem místo toho,
/// abychom přepsali data dvěma řádky.
async function stahni(adresa, skok = 0) {
	if (skok > 3) throw new Error('příliš mnoho přesměrování na nový soubor');
	console.log('stahuji', adresa);
	const o = await fetch(adresa);
	if (!o.ok) throw new Error('stažení selhalo: ' + o.status + ' ' + o.statusText);
	const text = await o.text();
	const prvni = text.slice(0, 200).split('\n')[0];
	if (prvni.includes('new_url')) {
		const nova = (text.split('\n')[1] || '').split(',').pop().trim();
		if (!nova.startsWith('https://')) throw new Error('soubor se přestěhoval, ale novou adresu nečtu: ' + nova);
		console.log('soubor se přestěhoval');
		return stahni(nova, skok + 1);
	}
	return text;
}

await mkdir(resolve(KOREN, 'data/zdroj'), { recursive: true });
const text = await stahni(ZDROJ);
if (text.length < 1_000_000) throw new Error('soubor je podezřele malý (' + text.length + ' B), nic nepřepisuji');
if (!text.startsWith('Area,')) throw new Error('soubor nezačíná sloupcem Area, nic nepřepisuji');
await writeFile(CSV, text);
console.log('staženo', (text.length / 1024 / 1024).toFixed(1), 'MB');

const r = spawnSync(process.execPath, [
	resolve(KOREN, 'tools/ember-na-json.mjs'),
	CSV,
	resolve(KOREN, 'web/data/zeme.json'),
	resolve(KOREN, 'web/data/elektrina.json'),
], { stdio: 'inherit' });
process.exit(r.status ?? 1);

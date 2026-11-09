// Kdo je čistší? — denní kvíz o osmi soubojích.
//
// Souboje jsou pro všechny na světě stejné: losují se z data, ne náhodně, takže
// si je lidé můžou porovnat jako u Wordle. Hraje se jen s padesáti největšími
// výrobci elektřiny, a jen s těmi, kdo mají data za poslední rok — o Lesothu
// nikdo tipovat nebude a stará čísla by kvíz dělala nepoctivým.
import { TK, JAZYKY, vyberJazyk, f, cislo } from './texty.js';

const KOL = 8;
const $ = (id) => document.getElementById(id);

const DATA = await fetch('data/elektrina.json').then((r) => r.json());

let jazyk = vyberJazyk();
let t = TK[jazyk];

/// Padesát největších výrobců, kteří mají data za poslední rok.
const ZEME = Object.entries(DATA.zeme)
	.map(([kod, z]) => {
		const posledni = z.r.at(-1);
		return { kod, cs: z.cs, en: z.en, vlajka: z.vlajka, twh: z.twh, cista: posledni[0], uhli: posledni[1], g: posledni[2] };
	})
	.filter((z) => DATA.zeme[z.kod].do === DATA.rok1 && z.twh > 0)
	.sort((a, b) => b.twh - a.twh)
	.slice(0, 50);

const nazev = (z) => (jazyk === 'cs' ? z.cs : z.en);

// ---------- losování ----------
/// Generátor náhody z jednoho čísla (mulberry32), aby všichni dostali tytéž
/// souboje ze stejného dne.
function nahoda(seed) {
	let a = seed | 0;
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let x = Math.imul(a ^ (a >>> 15), 1 | a);
		x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
		return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
	};
}

const dnes = new Date();
const denniKlic = dnes.getFullYear() * 10000 + (dnes.getMonth() + 1) * 100 + dnes.getDate();

/// Souboj má smysl jen tehdy, když mezi zeměmi je vidět rozdíl. U uhlí navíc
/// aspoň jedna z nich musí uhlí doopravdy pálit, jinak by otázka zněla
/// „kdo pálí víc uhlí, Norsko s 0 %, nebo Francie s 0,3 %?“.
function udelejKola(seed) {
	const r = nahoda(seed);
	const out = [];
	let pokusy = 0;
	while (out.length < KOL && pokusy < 2000) {
		pokusy++;
		const a = ZEME[Math.floor(r() * ZEME.length)];
		const b = ZEME[Math.floor(r() * ZEME.length)];
		if (a === b) continue;
		if (out.some((o) => o.p.includes(a) || o.p.includes(b))) continue;
		const typ = r() < 0.7 ? 'cista' : 'uhli';
		if (typ === 'uhli' && Math.max(a.uhli, b.uhli) < 10) continue;
		if (Math.abs(a[typ] - b[typ]) < 8) continue;
		out.push({ p: [a, b], typ });
	}
	return out;
}

// ---------- postavička ----------
function tvar(z, velikost = 110, animace = true) {
	const cista = z.cista;
	const uhli = z.uhli;
	const odstin = Math.round(cista * 1.2); // 0 = červená, 120 = zelená
	const telo = `hsl(${odstin},${uhli > 40 ? 35 : 60}%,${uhli > 40 ? 52 : 58}%)`;
	const nalada = cista >= 80 ? 'veselo' : cista >= 55 ? 'ok' : uhli >= 40 ? 'kasle' : 'nic';
	let usta;
	let oci;
	let navic = '';
	if (nalada === 'veselo') {
		usta = '<path d="M38 62 Q50 76 62 62" stroke="#1c2b22" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
		oci = cista >= 95
			? '<rect x="27" y="40" width="20" height="11" rx="4" fill="#1c2b22"/><rect x="53" y="40" width="20" height="11" rx="4" fill="#1c2b22"/><path d="M47 44h6" stroke="#1c2b22" stroke-width="3"/>'
			: '<circle cx="38" cy="45" r="4" fill="#1c2b22"/><circle cx="62" cy="45" r="4" fill="#1c2b22"/>';
		navic = '<circle cx="29" cy="58" r="5" fill="#ff8a8a" opacity=".5"/><circle cx="71" cy="58" r="5" fill="#ff8a8a" opacity=".5"/>';
	} else if (nalada === 'ok') {
		usta = '<path d="M40 64 Q50 69 60 64" stroke="#1c2b22" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
		oci = '<circle cx="38" cy="45" r="4" fill="#1c2b22"/><circle cx="62" cy="45" r="4" fill="#1c2b22"/>';
	} else if (nalada === 'nic') {
		usta = '<path d="M40 66 L60 66" stroke="#1c2b22" stroke-width="3.5" stroke-linecap="round"/>';
		oci = '<path d="M33 45h10M57 45h10" stroke="#1c2b22" stroke-width="3.5" stroke-linecap="round"/>';
	} else {
		usta = '<ellipse cx="50" cy="66" rx="7" ry="6" fill="#1c2b22"/>';
		oci = '<path d="M33 41l9 6M42 41l-9 6M58 41l9 6M67 41l-9 6" stroke="#1c2b22" stroke-width="3" stroke-linecap="round"/>';
		navic = '<path d="M74 36 q4 6 0 9 q-4-3 0-9z" fill="#7cc4f0"/>';
	}
	const kolik = uhli >= 10 ? Math.min(3, Math.ceil(uhli / 20)) : 0;
	let kour = '';
	if (kolik) {
		kour = '<g class="smoke" fill="#7a7a7a">';
		for (let i = 0; i < kolik; i++) {
			kour += `<circle cx="${50 + (i - 1) * 14}" cy="14" r="${7 + uhli / 12}" ${animace ? '' : 'style="animation:none;opacity:.6"'}/>`;
		}
		kour += '</g>';
	}
	const list = cista >= 85 ? '<path d="M50 12 q14 -6 16 6 q-12 6 -16 -6z" fill="#3fae5f"/><path d="M50 12 v8" stroke="#2c7a43" stroke-width="2"/>' : '';
	const trida = animace ? (nalada === 'kasle' ? 'coughing' : nalada === 'veselo' ? 'happy' : '') : '';
	return `<svg width="${velikost}" height="${velikost * 1.05}" viewBox="0 -8 100 105" class="${trida}">${kour}${list}
    <circle cx="50" cy="54" r="34" fill="${telo}"/>${oci}${usta}${navic}</svg>`;
}

const zahada = '<svg width="110" height="115" viewBox="0 -8 100 105"><circle cx="50" cy="54" r="34" fill="var(--line)"/><text x="50" y="68" text-anchor="middle" font-size="40" font-weight="800" fill="var(--mut)">?</text></svg>';

function pruh(z) {
	const jine = Math.max(0, 100 - z.cista - z.uhli);
	return `<div class="bar"><span style="width:${z.cista}%;background:var(--ok)"></span><span style="width:${z.uhli}%;background:var(--uhli)"></span><span style="width:${jine}%;background:var(--plyn)"></span></div>`;
}

// ---------- hláška po tipu ----------
// Emisní intenzita je skutečná, z Emberu, ne odhad z podílů.
function hlaska(a, b) {
	const [cista, spinava] = a.cista >= b.cista ? [a, b] : [b, a];
	const gc = Math.max(1, cista.g);
	const gs = spinava.g;
	const kg = (g) => Math.round(g * 50 / 1000); // nabití 50 kWh
	const km = (kilo) => cislo(Math.round(kilo * 1000 / 150), jazyk); // benzín 150 g CO₂/km
	const pomer = Math.round(gs / gc);
	const kazda = spinava.uhli >= 50 ? t.zarovkaKazdaDruha
		: spinava.uhli >= 30 ? t.zarovkaKazdaTreti
			: f(t.zarovkaKazda, Math.round(100 / Math.max(spinava.uhli, 1)));
	const moznosti = [
		f(t.fakta[0], nazev(spinava), kg(gs), km(kg(gs)), nazev(cista), kg(gc)),
		pomer >= 3
			? f(t.fakta[1], pomer, nazev(spinava), nazev(cista))
			: f(t.fakta[2], gs, nazev(spinava), gc, nazev(cista)),
		spinava.uhli >= 10 ? f(t.fakta[3], nazev(spinava), kazda) : f(t.fakta[4], nazev(cista), Math.round(cista.cista)),
	];
	return moznosti[(a.kod.length + b.kod.length + a.twh) % moznosti.length];
}

// ---------- hra ----------
let kola;
let idx;
let vysledky;
let zamceno;
let tipl;

function start(seed) {
	kola = udelejKola(seed);
	idx = 0;
	vysledky = [];
	tipl = null;
	$('game').classList.remove('hidden');
	$('end').classList.add('hidden');
	ukaz();
}

function ukaz() {
	zamceno = false;
	tipl = null;
	const K = kola[idx];
	$('prog').innerHTML = kola.map((_, i) => `<i class="${i < vysledky.length ? (vysledky[i] ? 'ok' : 'bad') : i === idx ? 'cur' : ''}"></i>`).join('');
	$('q').textContent = K.typ === 'cista' ? t.otazkaCista : t.otazkaUhli;
	K.p.forEach((z, i) => {
		const e = $('c' + i);
		e.className = 'cty';
		e.innerHTML = `<div class="flag">${z.vlajka}</div><div class="name">${nazev(z)}</div><div class="av">${zahada}</div><div class="stats">&nbsp;</div>`;
		e.onclick = () => odpovez(i);
	});
	$('fact').className = 'fact';
	$('next').classList.add('hidden');
}

function odpovez(i) {
	if (zamceno) return;
	zamceno = true;
	tipl = i;
	const K = kola[idx];
	const [a, b] = K.p;
	const spravne = K.typ === 'cista' ? (a.cista > b.cista ? 0 : 1) : (a.uhli > b.uhli ? 0 : 1);
	vysledky.push(i === spravne);
	odhal(spravne);
	$('next').textContent = idx === KOL - 1 ? t.vysledek : t.dalsi;
	$('next').classList.remove('hidden');
}

/// Odkryje obě země i s čísly — volá se po tipu a znovu při přepnutí jazyka.
function odhal(spravne) {
	const K = kola[idx];
	const [a, b] = K.p;
	if (spravne === undefined) spravne = K.typ === 'cista' ? (a.cista > b.cista ? 0 : 1) : (a.uhli > b.uhli ? 0 : 1);
	$('q').textContent = K.typ === 'cista' ? t.otazkaCista : t.otazkaUhli;
	K.p.forEach((z, j) => {
		const e = $('c' + j);
		e.className = 'cty locked' + (j === spravne ? ' right' : j === tipl ? ' wrong' : '');
		e.innerHTML = `<div class="flag">${z.vlajka}</div><div class="name">${nazev(z)}</div>`
			+ `<div class="av">${tvar(z)}</div>`
			+ `<div class="stats">${f(t.statistika, z.cista, z.uhli)}${pruh(z)}</div>`;
		e.onclick = null;
	});
	const ok = tipl === spravne;
	$('fact').innerHTML = (ok ? t.spravne : t.vedle) + hlaska(a, b);
	$('fact').className = 'fact show';
	$('prog').innerHTML = kola.map((_, k) => `<i class="${k < vysledky.length ? (vysledky[k] ? 'ok' : 'bad') : ''}"></i>`).join('');
}

$('next').onclick = () => { if (++idx < KOL) ukaz(); else konec(); };

function konec() {
	$('game').classList.add('hidden');
	$('end').classList.remove('hidden');
	nakresliKonec();
	// Série se počítá jen za denní hru, ne za opakování s náhodnými otázkami.
	try {
		const st = JSON.parse(localStorage.getItem('kdoJeCistsi') || '{}');
		if (st.den !== denniKlic) {
			st.serie = (st.den === denniKlic - 1 ? st.serie || 0 : 0) + 1;
			st.den = denniKlic;
			localStorage.setItem('kdoJeCistsi', JSON.stringify(st));
		}
		$('streak').textContent = f(t.serie, st.serie || 1);
	} catch (e) { /* soukromé okno, série se prostě nepamatuje */ }
}

function nakresliKonec() {
	const s = vysledky.filter(Boolean).length;
	$('score').textContent = `${s}/${KOL}`;
	$('emo').textContent = vysledky.map((r) => (r ? '🟩' : '🟥')).join('');
	const stupen = s === KOL ? 3 : s >= 6 ? 2 : s >= 4 ? 1 : 0;
	$('verdict').textContent = t.verdikt[stupen];
	$('rank').innerHTML = [...ZEME].sort((x, y) => x.g - y.g).map((z) => `<div class="rk">`
		+ `<div class="mini">${tvar(z, 30, false)}</div><div>${z.vlajka}</div><div>${nazev(z)}</div>`
		+ `<div class="cis">${z.cista} %</div><div class="cis">${z.g} g</div></div>`).join('');
}

$('copy').onclick = async () => {
	const datum = dnes.toLocaleDateString(jazyk === 'cs' ? 'cs-CZ' : 'en-GB');
	const txt = f(t.sdileni, datum, $('score').textContent, $('emo').textContent, location.href.split('?')[0]);
	try {
		await navigator.clipboard.writeText(txt);
		$('copy').textContent = t.zkopirovano;
	} catch (e) {
		$('copy').textContent = f(t.kopirovaniNejde, $('score').textContent);
	}
	setTimeout(() => { $('copy').textContent = t.zkopirovat; }, 2000);
};
$('again').onclick = () => start(Math.floor(Math.random() * 1e9));

// ---------- texty a jazyk ----------
function nasazTexty() {
	t = TK[jazyk];
	document.documentElement.lang = jazyk;
	document.title = t.nazev.replace(/^\S+\s/, '');
	$('nazev').textContent = t.nazev;
	$('naMapu').textContent = t.naMapu;
	$('naMapu').href = './?lang=' + jazyk;
	$('jaz').textContent = t.prepniJazyk;
	$('dnesni').textContent = t.dnesniVysledek;
	$('copy').textContent = t.zkopirovat;
	$('again').textContent = t.znovu;
	$('zebricekNadpis').textContent = t.zebricek;
	$('legenda').innerHTML = `<span><i style="background:var(--ok)"></i>${t.legendaCista}</span>`
		+ `<span><i style="background:var(--uhli)"></i>${t.legendaUhli}</span>`
		+ `<span><i style="background:var(--plyn)"></i>${t.legendaPlyn}</span>`;
	$('pozn').innerHTML = f(t.pozn, DATA.rok1);
	try {
		const st = JSON.parse(localStorage.getItem('kdoJeCistsi') || '{}');
		$('streak').textContent = f(t.serie, st.serie || 0);
	} catch (e) { $('streak').textContent = f(t.serie, 0); }
}

$('jaz').onclick = () => {
	jazyk = JAZYKY[(JAZYKY.indexOf(jazyk) + 1) % JAZYKY.length];
	try { localStorage.setItem('jazyk', jazyk); } catch (e) { /* nevadí */ }
	nasazTexty();
	// Překresli, na čem zrovna hráč stojí, ať se jazyk nepropíše až za kolo.
	if (!$('end').classList.contains('hidden')) nakresliKonec();
	else if (zamceno) { odhal(); $('next').textContent = idx === KOL - 1 ? t.vysledek : t.dalsi; }
	else ukaz();
};

nasazTexty();
start(denniKlic);

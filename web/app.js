// Svět zelená — mapa toho, odkud se bere elektřina, od roku 2000 do dneška.
//
// Data přicházejí hotová z data/elektrina.json (vyrábí je tools/zpracuj-data.mjs
// z ročního CSV od Our World in Data). Stránka sama nic nepočítá z surových dat,
// jen z řad hodnot po letech plynule interpoluje a kreslí.
import { T, UDALOSTI, f, roky, cislo, vyberJazyk, JAZYKY } from './texty.js';

const P = new URLSearchParams(location.search);
const VIDEO = P.has('video');
const MOBILE = window.matchMedia('(max-width:700px)').matches;
const SVISLE = MOBILE || VIDEO;

let jazyk = vyberJazyk();
let t = T[jazyk];

const el = (id) => document.getElementById(id);

const [DATA, TOPO] = await Promise.all([
	fetch('data/elektrina.json').then((r) => r.json()),
	fetch('data/svet-110m.json').then((r) => r.json()),
]);

const Y0 = DATA.rok0;
const Y1 = DATA.rok1;
const Z = DATA.zeme;
const KONT = DATA.kontinenty;
const NORSKO = '578';

// ---------- hodnoty v čase ----------
// Řada má jednu položku na rok; mezi roky se táhne přímka, aby přehrávání
// neposkakovalo po celých letech.
function interp(rada, y, i) {
	const tt = Math.min(Math.max(y, Y0), Y1) - Y0;
	const a = Math.floor(tt);
	const b = Math.min(a + 1, rada.length - 1);
	const fr = tt - a;
	const va = rada[a] && rada[a][i];
	const vb = rada[b] && rada[b][i];
	if (va == null) return vb == null ? 0 : vb;
	if (vb == null) return va;
	return va + (vb - va) * fr;
}
const cl = (kod, y) => interp(Z[kod].r, y, 0);
const co = (kod, y) => interp(Z[kod].r, y, 1);
const ci = (kod, y) => interp(Z[kod].r, y, 2);
const sol = (kod, y) => interp(Z[kod].r, y, 3);
const vit = (kod, y) => interp(Z[kod].r, y, 4);
const wv = (y, i) => interp(DATA.svet, y, i);
const kv = (k, y, i) => interp(KONT[k].r, y, i);

const barva = d3.scaleLinear().domain([0, 50, 100]).range(['#b5482f', '#e0b44a', '#3fae5f']).clamp(true);
const nazev = (o) => (jazyk === 'cs' ? o.cs : o.en);

// ---------- mapa ----------
const svg = d3.select('#map');
// Ve videu se mapa vejde na šířku a pod ni se vejde závod kontinentů; na mobilu
// je naopak mapa na výšku, protože se do ní dá přibližovat.
const Wd = SVISLE ? 600 : 960;
const Ht = VIDEO ? 320 : (SVISLE ? 680 : 500);
svg.attr('viewBox', `0 0 ${Wd} ${Ht}`);
const zemePole = topojson.feature(TOPO, TOPO.objects.countries).features
	.filter((x) => x.properties.name !== 'Antarctica');
const proj = d3.geoNaturalEarth1().fitExtent([[6, 6], [Wd - 6, Ht - 6]], { type: 'FeatureCollection', features: zemePole });
const path = d3.geoPath(proj);
const g = svg.append('g');
const paths = g.selectAll('path').data(zemePole).join('path')
	.attr('d', path).attr('class', (d) => 'country' + (Z[d.id] ? '' : ' nodata'));

/// U ostrovních států bere těžiště největšího kusu, ne průměr všech ostrovů —
/// jinak by komín Indonésie plaval v moři.
function teziste(x) {
	if (x.geometry.type === 'MultiPolygon') {
		let nej = null;
		let np = -1;
		for (const c of x.geometry.coordinates) {
			const p = { type: 'Polygon', coordinates: c };
			const a = d3.geoArea(p);
			if (a > np) { np = a; nej = p; }
		}
		return path.centroid(nej);
	}
	return path.centroid(x);
}

const ikonyData = zemePole.filter((x) => Z[x.id]).map((x) => ({ kod: x.id, c: teziste(x) }));
const ig = g.append('g').selectAll('g').data(ikonyData).join('g').attr('class', 'icon');
ig.append('g').attr('class', 'chim').html(`
  <rect x="-3" y="-9" width="6" height="11" fill="#5b5f63" stroke="#2b2e30" stroke-width=".6"/>
  <rect x="-3.5" y="-10" width="7" height="2" fill="#7a3a2a"/>
  <circle class="smoke" cx="0" cy="-13" r="3" fill="#9aa0a6"/>
  <circle class="smoke" cx="1" cy="-13" r="3" fill="#9aa0a6" style="animation-delay:.7s"/>
  <circle class="smoke" cx="-1" cy="-13" r="3" fill="#9aa0a6" style="animation-delay:1.4s"/>`);
ig.append('g').attr('class', 'wind').html(`
  <path d="M0 2 L0 -9" stroke="#e8eef2" stroke-width="1.2"/>
  <g class="blades"><path d="M0 -9 L0 -16 M0 -9 L6 -5.5 M0 -9 L-6 -5.5" stroke="#e8eef2" stroke-width="1.3" stroke-linecap="round"/><circle cx="0" cy="-9" r="1" fill="#e8eef2"/></g>`);

let k = 1;
function umistiIkony() {
	ig.attr('transform', (d) => `translate(${d.c[0]},${d.c[1]}) scale(${(1 / Math.sqrt(k)) * (SVISLE ? 1.25 : 0.9)})`);
}
umistiIkony();

const zoom = d3.zoom().scaleExtent([1, 8]).translateExtent([[0, 0], [Wd, Ht]]).on('zoom', (e) => {
	k = e.transform.k; g.attr('transform', e.transform); umistiIkony(); skryjPopis();
});
if (!VIDEO) svg.call(zoom);

function priblizNa(kam, hned = false) {
	document.querySelectorAll('.zoom button').forEach((b) => b.classList.toggle('on', b.dataset.z === kam));
	if (kam === 'world') {
		const c = hned ? svg : svg.transition().duration(800);
		c.call(zoom.transform, d3.zoomIdentity);
		return;
	}
	const [x0, y0] = SVISLE ? proj([-11, 62]) : proj([-12, 71]);
	const [x1, y1] = SVISLE ? proj([33, 35]) : proj([40, 35]);
	const s = Math.min(8, (SVISLE ? 0.8 : 0.9) / Math.max((x1 - x0) / Wd, (y1 - y0) / Ht));
	const tr = d3.zoomIdentity.translate(Wd / 2, Ht / 2).scale(s).translate(-(x0 + x1) / 2, -(y0 + y1) / 2);
	const c = hned ? svg : svg.transition().duration(800);
	c.call(zoom.transform, tr);
}
document.querySelectorAll('.zoom button').forEach((b) => { b.onclick = () => priblizNa(b.dataset.z); });

// ---------- postavička ----------
/// Obličej země: barva podle čisté elektřiny, nálada podle toho, jak moc pálí.
function tvar(c1, c2, velikost = 46) {
	const telo = barva(c1);
	const nalada = c1 >= 80 ? 'veselo' : c1 >= 55 ? 'ok' : c2 >= 40 ? 'kasle' : 'nic';
	let oci = '<circle cx="38" cy="45" r="4" fill="#1c2b22"/><circle cx="62" cy="45" r="4" fill="#1c2b22"/>';
	let usta;
	if (nalada === 'veselo') {
		usta = '<path d="M38 62 Q50 76 62 62" stroke="#1c2b22" stroke-width="4" fill="none" stroke-linecap="round"/>';
		if (c1 >= 95) oci = '<rect x="27" y="40" width="20" height="11" rx="4" fill="#1c2b22"/><rect x="53" y="40" width="20" height="11" rx="4" fill="#1c2b22"/><path d="M47 44h6" stroke="#1c2b22" stroke-width="3"/>';
	} else if (nalada === 'ok') {
		usta = '<path d="M40 64 Q50 69 60 64" stroke="#1c2b22" stroke-width="4" fill="none" stroke-linecap="round"/>';
	} else if (nalada === 'nic') {
		usta = '<path d="M40 66 L60 66" stroke="#1c2b22" stroke-width="4" stroke-linecap="round"/>';
		oci = '<path d="M33 45h10M57 45h10" stroke="#1c2b22" stroke-width="4" stroke-linecap="round"/>';
	} else {
		usta = '<ellipse cx="50" cy="66" rx="7" ry="6" fill="#1c2b22"/>';
		oci = '<path d="M33 41l9 6M42 41l-9 6M58 41l9 6M67 41l-9 6" stroke="#1c2b22" stroke-width="3.5" stroke-linecap="round"/>';
	}
	const kour = c2 >= 25 ? '<circle cx="38" cy="12" r="8" fill="#8a8f94" opacity=".8"/><circle cx="55" cy="8" r="10" fill="#8a8f94" opacity=".7"/>' : '';
	return `<svg width="${velikost}" height="${velikost}" viewBox="0 0 100 100">${kour}<circle cx="50" cy="56" r="34" fill="${telo}"/>${oci}${usta}</svg>`;
}

// ---------- detail země ----------
const pop = el('pop');
const box = el('box');
let popKod = null;
let popXY = [0, 0];
function ukazPopis(kod, ev) {
	popKod = kod;
	const r = box.getBoundingClientRect();
	popXY = [ev.clientX - r.left, ev.clientY - r.top];
	nakresliPopis();
}
function nakresliPopis() {
	if (!popKod || VIDEO) return;
	const d = Z[popKod];
	const c1 = cl(popKod, yr);
	const c2 = co(popKod, yr);
	const jine = Math.max(0, 100 - c1 - c2);
	const I = ci(popKod, yr) || 0;
	const N = Math.max(15, ci(NORSKO, yr) || 25);
	const x = Math.round(I / N);
	const radek = popKod === NORSKO ? t.detailNorskoSamo
		: (x >= 2 ? f(t.detailNorsko, x) : t.detailNorskoStejne);
	const stara = Math.round(yr) > d.do ? `<div class="mut" style="font-size:12px">${f(t.detailStara, d.do)}</div>` : '';
	const km = (kwh) => cislo(Math.round(I * kwh / 1000 / 0.15), jazyk);
	const i = (parseInt(popKod, 10) + Math.floor(yr)) % t.prepocty.length;
	pop.innerHTML = `<div class="hd">${tvar(c1, c2)}<div><div class="nm">${d.vlajka} ${nazev(d)}</div><div class="mut">${Math.round(yr)}</div></div></div>
    <div class="bar"><span style="width:${c1}%;background:#3fae5f"></span><span style="width:${c2}%;background:#6b6b6b"></span><span style="width:${jine}%;background:#c9a24a"></span></div>
    <div><b>${Math.round(c1)} %</b> ${t.detailCiste} · <b>${Math.round(c2)} %</b> ${t.detailUhli} · ${Math.round(jine)} % ${t.detailOstatni}</div>${stara}
    <div style="margin-top:6px">${radek}</div>
    <div style="margin-top:4px">${f(t.prepocty[i], km([50, 150, 10, 100][i]))}</div>
    <div style="margin-top:5px;font-size:12px" class="mut">${f(t.detailSlunceVitr, Math.round(sol(popKod, yr)), Math.round(vit(popKod, yr)))}</div>
    <div style="margin-top:4px;font-size:11px" class="mut">${f(t.detailStouraly, Math.round(I))}</div>`;
	const r = box.getBoundingClientRect();
	let px = popXY[0] + 12;
	let py = popXY[1] + 12;
	if (px + 250 > r.width) px = popXY[0] - 252;
	if (py + 190 > r.height) py = Math.max(4, popXY[1] - 192);
	if (MOBILE) { pop.style.left = ''; pop.style.top = ''; } else { pop.style.left = px + 'px'; pop.style.top = py + 'px'; }
	pop.classList.add('show');
}
function skryjPopis() { popKod = null; pop.classList.remove('show'); }
paths.filter((d) => Z[d.id])
	.on('mousemove', (e, d) => { if (!MOBILE) ukazPopis(d.id, e); })
	.on('mouseleave', () => { if (!MOBILE) skryjPopis(); })
	.on('click', (e, d) => { e.stopPropagation(); ukazPopis(d.id, e); });
svg.on('click', skryjPopis);

// ---------- sluneční čtverec ----------
svg.insert('defs', ':first-child').html(`<pattern id="panels" width="4" height="4" patternUnits="userSpaceOnUse">
  <rect width="4" height="4" fill="#1d3f73"/><path d="M0 0H4V4" fill="none" stroke="#7fb2ff" stroke-width=".35"/></pattern>`);
let sqStred = [9, 23.5];
let sqZap = false;
const sqPath = g.append('path').attr('class', 'sq').style('display', 'none');
/// Čtverec 630 × 630 km na kouli: body po okraji hustěji, ať se v projekci ohne.
function sqGeo(c) {
	const dLat = 315 / 111;
	const dLon = 315 / (111 * Math.cos(c[1] * Math.PI / 180));
	const N = 12;
	const p = [];
	for (let i = 0; i <= N; i++) p.push([c[0] - dLon + 2 * dLon * i / N, c[1] + dLat]);
	for (let i = 0; i <= N; i++) p.push([c[0] + dLon, c[1] + dLat - 2 * dLat * i / N]);
	for (let i = 0; i <= N; i++) p.push([c[0] + dLon - 2 * dLon * i / N, c[1] - dLat]);
	for (let i = 0; i <= N; i++) p.push([c[0] - dLon, c[1] - dLat + 2 * dLat * i / N]);
	return { type: 'Polygon', coordinates: [p] };
}
const sqlab = el('sqlab');
function umistiStitek() {
	if (!sqZap) return;
	const tr = d3.zoomTransform(svg.node());
	const p = proj([sqStred[0] + 4, sqStred[1] + 3]);
	const sv = svg.node().getBoundingClientRect();
	const bx = box.getBoundingClientRect();
	const sc = sv.width / Wd;
	let x = tr.applyX(p[0]) * sc + sv.left - bx.left + 8;
	let y = tr.applyY(p[1]) * sc + sv.top - bx.top - 10;
	x = Math.min(x, bx.width - 250);
	y = Math.max(8, y);
	if (MOBILE) { sqlab.style.left = ''; sqlab.style.top = ''; return; }
	sqlab.style.left = x + 'px';
	sqlab.style.top = y + 'px';
}
function nakresliSq() {
	sqPath.attr('d', path(sqGeo(sqStred)));
	const host = zemePole.find((x) => d3.geoContains(x, sqStred));
	const nm = host && Z[host.id] ? nazev(Z[host.id]) : (host ? host.properties.name : t.ctverecMore);
	sqlab.innerHTML = f(t.ctverecPopis, nm);
	umistiStitek();
}
sqPath.call(d3.drag().on('start', (e) => e.sourceEvent.stopPropagation()).on('drag', (e) => {
	const [x, y] = d3.pointer(e.sourceEvent, g.node());
	const ll = proj.invert([x, y]);
	if (ll && Math.abs(ll[1]) < 75) { sqStred = ll; nakresliSq(); }
}));
el('sunbtn').onclick = () => {
	sqZap = !sqZap;
	const b = el('sunbtn');
	b.classList.toggle('on', sqZap);
	b.textContent = sqZap ? t.ctverecSchovat : t.ctverecTlacitko;
	sqPath.style('display', sqZap ? null : 'none');
	sqlab.style.display = sqZap ? 'block' : 'none';
	if (sqZap) {
		skryjPopis();
		nakresliSq();
		const p = proj(sqStred);
		document.querySelectorAll('.zoom button').forEach((x) => x.classList.remove('on'));
		svg.transition().duration(800).call(zoom.transform, d3.zoomIdentity.translate(Wd / 2, Ht / 2).scale(3).translate(-p[0], -p[1]));
	}
};
zoom.on('zoom.sq', () => umistiStitek());
window.addEventListener('resize', umistiStitek);

// ---------- sluneční počítadlo ----------
const SLUNCE_W = 8.9e16;
const CESKO_J = 1.6e18;
const t0 = performance.now();
(function tik() {
	if (!VIDEO) {
		const let_ = (performance.now() - t0) / 1000 * SLUNCE_W / CESKO_J;
		el('sunCount').textContent = let_ < 10
			? cislo(let_, jazyk, 1) + (jazyk === 'cs' ? ' roku' : ' years')
			: roky(Math.floor(let_), jazyk);
	}
	requestAnimationFrame(tik);
})();

// ---------- zápas čistá vs. špinavá ----------
const TR = { w: 600, h: 170, l: 34, r: 10, t: 10, b: 22 };
const tsv = d3.select('#trend');
const tx = d3.scaleLinear().domain([Y0, Y1]).range([TR.l, TR.w - TR.r]);
const ty = d3.scaleLinear().domain([25, 75]).range([TR.h - TR.b, TR.t]);
const vsechnyRoky = d3.range(Y0, Y1 + 1);
tsv.append('g').selectAll('line').data([30, 40, 50, 60, 70]).join('line')
	.attr('x1', TR.l).attr('x2', TR.w - TR.r).attr('y1', ty).attr('y2', ty)
	.attr('stroke', (d) => (d === 50 ? '#8ea3b3' : '#24384a')).attr('stroke-dasharray', (d) => (d === 50 ? '4 4' : null));
tsv.append('g').selectAll('text').data([30, 50, 70]).join('text').attr('x', TR.l - 6).attr('y', (d) => ty(d) + 4)
	.attr('text-anchor', 'end').attr('font-size', 11).attr('fill', '#8ea3b3').text((d) => d + ' %');
tsv.append('g').selectAll('text').data([2000, 2005, 2010, 2015, 2020, 2025].filter((y) => y <= Y1)).join('text')
	.attr('x', tx).attr('y', TR.h - 5).attr('text-anchor', (d) => (d === Y1 ? 'end' : 'middle')).attr('font-size', 11).attr('fill', '#8ea3b3').text((d) => d);
const popisHranice = tsv.append('text').attr('x', TR.l + 6).attr('y', ty(50) - 5).attr('font-size', 11).attr('fill', '#8ea3b3');
const linkaC = d3.line().x((y) => tx(y)).y((y) => ty(DATA.svet[y - Y0][0])).curve(d3.curveMonotoneX);
const linkaD = d3.line().x((y) => tx(y)).y((y) => ty(100 - DATA.svet[y - Y0][0])).curve(d3.curveMonotoneX);
tsv.append('path').attr('d', linkaD(vsechnyRoky)).attr('fill', 'none').attr('stroke', '#c46a3a').attr('stroke-width', 3).attr('opacity', 0.35);
tsv.append('path').attr('d', linkaC(vsechnyRoky)).attr('fill', 'none').attr('stroke', '#3fae5f').attr('stroke-width', 3).attr('opacity', 0.35);
const clipW = tsv.append('defs').append('clipPath').attr('id', 'tclip').append('rect').attr('x', 0).attr('y', 0).attr('height', TR.h);
const ziva = tsv.append('g').attr('clip-path', 'url(#tclip)');
ziva.append('path').attr('d', linkaD(vsechnyRoky)).attr('fill', 'none').attr('stroke', '#c46a3a').attr('stroke-width', 3.5);
ziva.append('path').attr('d', linkaC(vsechnyRoky)).attr('fill', 'none').attr('stroke', '#3fae5f').attr('stroke-width', 3.5);
const bodC = tsv.append('text').attr('font-size', 18).attr('text-anchor', 'middle').text('🌞');
const bodD = tsv.append('text').attr('font-size', 18).attr('text-anchor', 'middle').text('🏭');

function nakresliTip() {
	const a = DATA.svet[Y1 - 5 - Y0][0];
	const b = DATA.svet[Y1 - Y0][0];
	const sklon = (b - a) / 5;
	const rokX = sklon > 0 ? Math.round(Y1 + (50 - b) / sklon) : null;
	el('mPredict').innerHTML = rokX ? f(t.zapasTip, Y1 - 5, Y1, cislo(sklon, jazyk, 1), rokX) : '';
}

function nakresliZapas(y) {
	const c = wv(y, 0);
	const d = 100 - c;
	el('mClean').textContent = Math.round(c) + ' %';
	el('mDirty').textContent = Math.round(d) + ' %';
	el('tClean').classList.toggle('lead', c >= d);
	el('tDirty').classList.toggle('lead', d > c);
	el('knot').style.left = Math.max(4, Math.min(96, 50 + (d - c) * 1.2)) + '%';
	const zad = Math.max(Y0, y - 5);
	const delta = c - wv(zad, 0);
	const rozdil = d - c;
	let txt = rozdil > 30 ? t.zapasDrti : rozdil > 18 ? t.zapasVede : rozdil > 0 ? t.zapasNapinave : t.zapasCistaVede;
	if (y - zad >= 1) {
		const kolik = roky(Math.round(y - zad), jazyk);
		txt += delta > 0.3 ? f(t.zapasPolepsila, kolik, cislo(delta, jazyk, 1))
			: delta < -0.3 ? f(t.zapasZtraci, kolik, cislo(delta, jazyk, 1))
				: t.zapasKlid;
	}
	el('mComment').innerHTML = '🎙️ ' + txt;
	clipW.attr('width', tx(Math.min(y, Y1)));
	bodC.attr('x', tx(y)).attr('y', ty(c) + 6);
	bodD.attr('x', tx(y)).attr('y', ty(d) + 6);
}

// ---------- souboje kontinentů ----------
const kklice = Object.keys(KONT);
const KROK = VIDEO ? 72 : 38; // výška jednoho řádku závodu
const DUELY = [['eu', 'as'], ['eu', 'na'], ['la', 'af'], ['oc', 'as'], ['na', 'as'], ['af', 'eu'], ['me', 'eu']]
	.filter(([a, b]) => KONT[a] && KONT[b]);
let duel = 0;
const race = el('race');
function postavKontinenty() {
	race.innerHTML = '';
	kklice.forEach((kk) => {
		const r = document.createElement('div');
		r.className = 'rrow';
		r.id = 'r-' + kk;
		r.innerHTML = `<div class="rk"></div><div class="em">${KONT[kk].emoji}</div><div class="barw"><div class="bar2"></div><div class="lbl">${nazev(KONT[kk])}</div></div><div class="val"></div>`;
		race.appendChild(r);
	});
	race.style.height = kklice.length * KROK + 'px';
	const dp = el('duelpick');
	dp.innerHTML = '';
	DUELY.forEach((d, i) => {
		const b = document.createElement('button');
		b.textContent = `${KONT[d[0]].emoji} ${nazev(KONT[d[0]])} vs. ${KONT[d[1]].emoji} ${nazev(KONT[d[1]])}`;
		b.onclick = () => { duel = i; [...dp.children].forEach((x, j) => x.classList.toggle('on', j === i)); nakresliKontinenty(yr); };
		dp.appendChild(b);
	});
	dp.children[duel].classList.add('on');
}

function nakresliKontinenty(y) {
	const hod = kklice.map((kk) => [kk, kv(kk, y, 0)]).sort((a, b) => b[1] - a[1]);
	const medaile = ['🥇', '🥈', '🥉', '4.', '5.', '6.', '7.'];
	hod.forEach(([kk, v], i) => {
		const r = el('r-' + kk);
		r.style.transform = `translateY(${i * KROK}px)`;
		r.querySelector('.rk').textContent = medaile[i];
		const b = r.querySelector('.bar2');
		b.style.width = v + '%';
		b.style.background = barva(v);
		r.querySelector('.val').textContent = Math.round(v) + ' %';
	});
	const [a, b] = DUELY[duel];
	const va = kv(a, y, 0);
	const vb = kv(b, y, 0);
	const ca = kv(a, y, 1);
	const cb = kv(b, y, 1);
	const strana = (kk, v, c, vyhrava) => `<div class="side ${vyhrava ? 'win' : ''}">${vyhrava ? '<div class="crown">👑</div>' : ''}<div class="em">${KONT[kk].emoji}</div><div class="nm">${nazev(KONT[kk])}</div><div class="pc">${Math.round(v)} %</div><div class="sub">${f(t.kontCisteUhli, Math.round(c))}</div></div>`;
	el('cduel').innerHTML = strana(a, va, ca, va >= vb) + '<div class="vs">VS</div>' + strana(b, vb, cb, vb > va);
	const vede = va >= vb ? a : b;
	const mezera = Math.abs(va - vb);
	const da = va - kv(a, Y0, 0);
	const db = vb - kv(b, Y0, 0);
	const rychlejsi = da > db ? a : b;
	let txt = mezera < 2 ? f(t.kontVyrovnane, nazev(KONT[a]), nazev(KONT[b]))
		: f(t.kontVede, nazev(KONT[vede]), Math.round(mezera));
	if (y > Y0 + 1) {
		const fd = Math.max(da, db);
		txt += f(t.kontZlepsila, Y0, nazev(KONT[rychlejsi]), (fd >= 0 ? '+' : '') + Math.round(fd));
		const ca0 = kv(a, Y0, 1);
		const cb0 = kv(b, Y0, 1);
		if (ca > ca0 + 2) txt += f(t.kontVicUhli, nazev(KONT[a]), Y0, Math.round(ca0), Math.round(ca));
		else if (cb > cb0 + 2) txt += f(t.kontVicUhli, nazev(KONT[b]), Y0, Math.round(cb0), Math.round(cb));
	}
	el('cComment').innerHTML = '🎙️ ' + txt;
}

// ---------- jeden snímek ----------
let yr = Y0;
function nakresli(y) {
	yr = y;
	el('year').textContent = Math.floor(y);
	paths.filter((d) => Z[d.id]).attr('fill', (d) => barva(cl(d.id, y)));
	ig.select('.chim').attr('opacity', (d) => {
		const c = co(d.kod, y);
		return c >= 30 ? Math.min(1, (c - 30) / 15 + 0.35) : 0;
	}).attr('transform', (d) => `scale(${0.8 + co(d.kod, y) / 100})`);
	ig.select('.wind').attr('opacity', (d) => ((cl(d.kod, y) >= 85 && co(d.kod, y) < 10) ? 1 : 0));

	const twh = wv(y, 3);
	const vlakyRok = twh * 400000 / 3000;
	const denne = vlakyRok / 365;
	el('cTrains').textContent = f(t.kartaVlaky, cislo(Math.round(denne), jazyk));
	el('cTrainRow').textContent = '🚂' + '🚃'.repeat(Math.max(1, Math.round(denne / 250)));
	el('cEarth').textContent = (vlakyRok * 0.8 / 40075).toFixed(0) + '×';
	el('cEarthSub').textContent = f(t.kartaZemeSub, cislo(Math.round(twh), jazyk));
	const wc = wv(y, 0);
	const wk = wv(y, 1);
	el('cClean').textContent = Math.round(wc) + ' %';
	el('cBar').innerHTML = `<span style="width:${wc}%;background:#3fae5f"></span><span style="width:${wk}%;background:#6b6b6b"></span><span style="width:${100 - wc - wk}%;background:#c9a24a"></span>`;
	el('cCleanSub').textContent = f(t.kartaCistaSub, Math.round(wk), Math.round(100 - wc - wk));

	const ev = UDALOSTI.filter((e) => e[0] <= Math.floor(y)).pop();
	el('cap').innerHTML = ev ? `<b>${ev[0]}</b> · ${ev[1][jazyk]}` : '';

	nakresliZapas(y);
	nakresliKontinenty(y);
	nakresliPopis();
	if (VIDEO) nakresliVideoTitulek(y);
}

// ---------- texty na stránce ----------
function nasazTexty() {
	t = T[jazyk];
	document.documentElement.lang = jazyk;
	el('nazev').textContent = t.nazev;
	document.title = t.nazev.replace(/^\S+\s/, '');
	el('podtitul').textContent = f(t.podtitul, Y0, Y1);
	el('jaz').textContent = t.prepniJazyk;
	el('naKviz').textContent = t.naKviz;
	el('naKviz').href = 'kviz.html?lang=' + jazyk;
	el('zWorld').textContent = t.svet;
	el('zEu').textContent = t.evropa;
	el('legend').innerHTML = `<span>${t.legendaUhelna}</span><div class="grad"></div><span>${t.legendaCista}</span>`
		+ `<span style="margin-left:10px">${t.legendaKomin}</span><span>${t.legendaVetrnik}</span><span>${t.legendaSeda}</span>`;
	el('kVlakyK').textContent = t.kartaVlakyK;
	el('kZemeK').textContent = t.kartaZemeK;
	el('kCistaK').textContent = t.kartaCistaK;
	el('zapasNazev').textContent = t.zapasNazev;
	el('nmClean').textContent = t.zapasCista;
	el('nmDirty').textContent = t.zapasSpinava;
	popisHranice.text(t.zapasHranice);
	el('kontNazev').textContent = t.kontNazev;
	el('kontPodtitul').textContent = t.kontPodtitul;
	el('slunceK').textContent = t.slunceK;
	el('slunceSub').textContent = t.slunceSub;
	el('sunbtn').textContent = sqZap ? t.ctverecSchovat : t.ctverecTlacitko;
	el('pozn1').textContent = t.pozn1;
	el('pozn2').textContent = t.pozn2;
	const [rr, mm, dd] = DATA.vyrobeno.split('-');
	el('pozn3').innerHTML = f(t.pozn3, Y1, jazyk === 'cs' ? `${+dd}. ${+mm}. ${rr}` : DATA.vyrobeno);
	nakresliTip();
	postavKontinenty();
}

el('jaz').onclick = () => {
	jazyk = JAZYKY[(JAZYKY.indexOf(jazyk) + 1) % JAZYKY.length];
	try { localStorage.setItem('jazyk', jazyk); } catch (e) { /* nevadí */ }
	nasazTexty();
	nakresli(yr);
};

// ---------- přehrávání ----------
const slider = el('slider');
const playBtn = el('play');
slider.min = Y0;
slider.max = Y1;
slider.value = Y0;
let bezi = false;
let naposled = 0;
const RYCHLOST = 2; // roků za sekundu
slider.oninput = () => { stop(); nakresli(+slider.value); };
function krok(cas) {
	if (!bezi) return;
	if (naposled) {
		let v = +slider.value + (cas - naposled) / 1000 * RYCHLOST;
		if (v >= Y1) { v = Y1; stop(); }
		slider.value = v;
		nakresli(v);
	}
	naposled = cas;
	if (bezi) requestAnimationFrame(krok);
}
function stop() { bezi = false; naposled = 0; playBtn.textContent = '▶'; }
playBtn.onclick = () => {
	if (bezi) { stop(); return; }
	if (+slider.value >= Y1) slider.value = Y0;
	bezi = true;
	playBtn.textContent = '❚❚';
	requestAnimationFrame(krok);
};

// ---------- režim videa ----------
// Natáčí tools/natoc-video.mjs: otevře stránku s ?video=1, po snímcích volá
// window.SZ.rok(y) a každý snímek vyfotí. Nic se nepřehrává samo, aby video
// nezáviselo na tom, jak rychle počítač stíhá.
function nakresliVideoTitulek(y) {
	const wc = wv(y, 0);
	const wk = wv(y, 1);
	// Událost je nahoře v popisku nad mapou, tady je jen skóre světa, ať to
	// divák stihne přečíst jedním pohledem.
	const twh = wv(y, 3);
	const hl = jazyk === 'cs'
		? `Čistá elektřina <span style="color:#6fd79a">${Math.round(wc)} %</span> · uhlí <span style="color:#e08a6a">${Math.round(wk)} %</span>`
		: `Clean electricity <span style="color:#6fd79a">${Math.round(wc)} %</span> · coal <span style="color:#e08a6a">${Math.round(wk)} %</span>`;
	const pod = jazyk === 'cs'
		? `${cislo(Math.round(twh * 400000 / 3000 / 365), jazyk)} vlaků uhlí denně`
		: `${cislo(Math.round(twh * 400000 / 3000 / 365), jazyk)} trainloads of coal a day`;
	el('videotit').innerHTML = hl + `<span class="mut">${pod}</span>`;
}

if (VIDEO) {
	document.body.classList.add('video');
	if (P.get('kam') === 'eu') priblizNa('eu', true);
}

// ---------- rozjezd ----------
nasazTexty();
nakresli(VIDEO ? Number(P.get('rok') || Y0) : Y0);

if (!VIDEO) {
	if (MOBILE) priblizNa('eu', true);
	setTimeout(() => playBtn.click(), 700);
}

window.SZ = {
	rok(y) { nakresli(y); },
	Y0, Y1,
	jazyk,
	pripraveno: true,
};

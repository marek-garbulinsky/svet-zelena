// Natočí svislé video 9:16 z přehrávání mapy — to je podle plánu hlavní formát
// pro TikTok a Shorts.
//
// Stránka se otevře s ?video=1 (bez ovládání, velký rok, titulek dole) a snímky
// se nekreslí v reálném čase, ale po jednom: skript nastaví rok, vyfotí, nastaví
// další. Video tak vypadá stejně hladce i na pomalém počítači.
//
// Pouštět: node tools/natoc-video.mjs [--od 2000] [--do 2025] [--sekundy 16]
//          [--fps 30] [--lang cs] [--kam svet|eu] [--ven build/svet-zelena.mp4]
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import puppeteer from 'puppeteer-core';

const KOREN = resolve(new URL('..', import.meta.url).pathname);

// ---------- volby ----------
const V = {};
for (let i = 2; i < process.argv.length; i += 2) {
	V[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];
}
const OD = Number(V.od ?? 2000);
const DO = Number(V.do ?? 0) || null; // null = poslední rok v datech
const SEKUNDY = Number(V.sekundy ?? 16);
const FPS = Number(V.fps ?? 30);
const LANG = V.lang ?? 'cs';
const KAM = V.kam ?? 'svet';
const PORT = Number(V.port ?? 8599);
const SIRKA = 1080;
const VYSKA = 1920;
const VEN = resolve(KOREN, V.ven ?? `build/svet-zelena-${LANG}.mp4`);
const SNIMKY = resolve(KOREN, 'build/snimky');

/// Chrome, který je na počítači nainstalovaný — puppeteer-core si žádný nestahuje.
function najdiChrome() {
	const moznosti = [
		process.env.CHROME_PATH,
		'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
		'/Applications/Chromium.app/Contents/MacOS/Chromium',
		'/usr/bin/google-chrome',
		'/usr/bin/chromium',
		'/usr/bin/chromium-browser',
	].filter(Boolean);
	const n = moznosti.find((p) => existsSync(p));
	if (!n) throw new Error('nenašel jsem Chrome; nastav CHROME_PATH');
	return n;
}

/// ffmpeg ze systému, jinak ten z balíčku ffmpeg-static.
async function najdiFfmpeg() {
	const systemovy = spawnSync('which', ['ffmpeg'], { encoding: 'utf8' });
	if (systemovy.status === 0) return systemovy.stdout.trim();
	try {
		const m = await import('ffmpeg-static');
		if (m.default && existsSync(m.default)) return m.default;
	} catch (e) { /* není nainstalovaný */ }
	return null;
}

// ---------- server ----------
const server = spawn(process.execPath, [resolve(KOREN, 'tools/server.mjs'), String(PORT)], { stdio: 'ignore' });
const uklid = () => { try { server.kill(); } catch (e) { /* už spadl */ } };
process.on('exit', uklid);
process.on('SIGINT', () => { uklid(); process.exit(1); });
await new Promise((r) => setTimeout(r, 400));

// ---------- prohlížeč ----------
await rm(SNIMKY, { recursive: true, force: true });
await mkdir(SNIMKY, { recursive: true });
await mkdir(dirname(VEN), { recursive: true });

const prohlizec = await puppeteer.launch({
	executablePath: najdiChrome(),
	headless: true,
	args: ['--hide-scrollbars', '--force-device-scale-factor=1', '--font-render-hinting=none'],
});
const stranka = await prohlizec.newPage();
await stranka.setViewport({ width: SIRKA, height: VYSKA, deviceScaleFactor: 1 });
const adresa = `http://localhost:${PORT}/?video=1&lang=${LANG}&kam=${KAM}&rok=${OD}`;
await stranka.goto(adresa, { waitUntil: 'networkidle0' });
await stranka.waitForFunction('window.SZ && window.SZ.pripraveno', { timeout: 20000 });

const Y1 = DO ?? (await stranka.evaluate('window.SZ.Y1'));
const celkem = Math.round(SEKUNDY * FPS);
const drzNaZacatku = Math.round(FPS * 1.0);
const drzNaKonci = Math.round(FPS * 1.8);
const bezi = celkem - drzNaZacatku - drzNaKonci;
console.log(`natáčím ${OD} → ${Y1}, ${celkem} snímků (${SEKUNDY} s při ${FPS} fps), ${SIRKA}×${VYSKA}`);

for (let i = 0; i < celkem; i++) {
	let rok;
	if (i < drzNaZacatku) rok = OD;
	else if (i >= celkem - drzNaKonci) rok = Y1;
	else rok = OD + (Y1 - OD) * ((i - drzNaZacatku) / (bezi - 1));
	await stranka.evaluate((y) => window.SZ.rok(y), rok);
	await stranka.screenshot({ path: `${SNIMKY}/${String(i).padStart(5, '0')}.png` });
	if (i % 30 === 0) process.stdout.write(`\r  snímek ${i}/${celkem}`);
}
process.stdout.write(`\r  snímek ${celkem}/${celkem}\n`);
await prohlizec.close();
uklid();

// ---------- složení videa ----------
const ffmpeg = await najdiFfmpeg();
if (!ffmpeg) {
	const prikaz = `ffmpeg -y -framerate ${FPS} -i ${SNIMKY}/%05d.png -c:v libx264 -pix_fmt yuv420p -crf 18 ${VEN}`;
	await writeFile(resolve(KOREN, 'build/slozit-video.sh'), '#!/bin/sh\n' + prikaz + '\n');
	console.log('\nffmpeg nemám, snímky jsou v', SNIMKY);
	console.log('slož je sám:\n ', prikaz);
	process.exit(0);
}
const r = spawnSync(ffmpeg, [
	'-y', '-framerate', String(FPS), '-i', `${SNIMKY}/%05d.png`,
	'-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-movflags', '+faststart', VEN,
], { stdio: ['ignore', 'ignore', 'inherit'] });
if (r.status !== 0) { console.error('ffmpeg selhal'); process.exit(1); }
console.log('hotovo:', VEN);

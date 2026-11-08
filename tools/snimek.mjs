// Vyfotí stránku do PNG — pro README, náhledy a kontrolu změn.
//
// Pouštět: node tools/snimek.mjs [--lang cs] [--rok 2025] [--sirka 1280] [--vyska 900]
//          [--cela true] [--ven build/snimek.png]
import { mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import puppeteer from 'puppeteer-core';

const KOREN = resolve(new URL('..', import.meta.url).pathname);
const V = {};
for (let i = 2; i < process.argv.length; i += 2) V[process.argv[i].replace(/^--/, '')] = process.argv[i + 1];

const LANG = V.lang ?? 'cs';
const ROK = Number(V.rok ?? 2025);
const SIRKA = Number(V.sirka ?? 1280);
const VYSKA = Number(V.vyska ?? 900);
const CELA = V.cela === 'true';
const PORT = Number(V.port ?? 8601);
const VEN = resolve(KOREN, V.ven ?? `build/snimek-${LANG}.png`);

const chrome = [
	process.env.CHROME_PATH,
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/usr/bin/google-chrome',
	'/usr/bin/chromium',
].filter(Boolean).find((p) => existsSync(p));
if (!chrome) throw new Error('nenašel jsem Chrome; nastav CHROME_PATH');

const server = spawn(process.execPath, [resolve(KOREN, 'tools/server.mjs'), String(PORT)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 400));
await mkdir(dirname(VEN), { recursive: true });

const prohlizec = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--hide-scrollbars'] });
const stranka = await prohlizec.newPage();
await stranka.setViewport({ width: SIRKA, height: VYSKA, deviceScaleFactor: 2 });
await stranka.goto(`http://localhost:${PORT}/?lang=${LANG}`, { waitUntil: 'networkidle0' });
await stranka.waitForFunction('window.SZ && window.SZ.pripraveno', { timeout: 20000 });
// Přehrávání se po načtení rozjede samo, zastavíme ho a ukážeme zvolený rok.
await stranka.evaluate((y) => {
	document.getElementById('slider').value = y;
	document.getElementById('slider').dispatchEvent(new Event('input'));
	window.SZ.rok(y);
}, ROK);
await new Promise((r) => setTimeout(r, 900));
await stranka.screenshot({ path: VEN, fullPage: CELA });
await prohlizec.close();
server.kill();
console.log('hotovo:', VEN);

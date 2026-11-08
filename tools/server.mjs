// Malý statický server nad adresářem web/ — pro vývoj a pro natáčení videa.
// Pouštět: node tools/server.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';

const KOREN = resolve(new URL('../web', import.meta.url).pathname);
const PORT = Number(process.argv[2] || 8123);
const TYPY = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript; charset=utf-8',
	'.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8',
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.ico': 'image/x-icon',
	'.txt': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
	try {
		let cesta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
		if (cesta.endsWith('/')) cesta += 'index.html';
		const soubor = join(KOREN, normalize(cesta).replace(/^(\.\.[/\\])+/, ''));
		if (!soubor.startsWith(KOREN)) { res.writeHead(403).end('ne'); return; }
		await stat(soubor);
		const data = await readFile(soubor);
		res.writeHead(200, {
			'content-type': TYPY[extname(soubor)] || 'application/octet-stream',
			'cache-control': 'no-store',
		}).end(data);
	} catch (e) {
		res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('není: ' + req.url);
	}
}).listen(PORT, () => console.log(`web/ běží na http://localhost:${PORT}/`));

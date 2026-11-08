// Malý čtečka CSV. Zvládne uvozovky a zdvojené uvozovky uvnitř buňky, nic víc
// od ní nechceme — OWID a datasets/country-codes jsou obyčejná RFC 4180 CSV.
export function radky(text) {
	const out = [];
	let bunka = '';
	let radek = [];
	let vUvozovkach = false;
	for (let i = 0; i < text.length; i++) {
		const c = text[i];
		if (vUvozovkach) {
			if (c === '"') {
				if (text[i + 1] === '"') { bunka += '"'; i++; }
				else vUvozovkach = false;
			} else bunka += c;
			continue;
		}
		if (c === '"') { vUvozovkach = true; continue; }
		if (c === ',') { radek.push(bunka); bunka = ''; continue; }
		if (c === '\n') { radek.push(bunka); out.push(radek); radek = []; bunka = ''; continue; }
		if (c === '\r') continue;
		bunka += c;
	}
	if (bunka !== '' || radek.length) { radek.push(bunka); out.push(radek); }
	return out;
}

/// Vrátí { hlavicka: {nazev: index}, data: [[...]] }.
export function tabulka(text) {
	const r = radky(text);
	const hlavicka = {};
	r[0].forEach((n, i) => { hlavicka[n.trim()] = i; });
	return { hlavicka, data: r.slice(1) };
}

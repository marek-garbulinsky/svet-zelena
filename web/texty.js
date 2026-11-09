// Všechny texty stránky na jednom místě, česky a anglicky. Česká verze je pro
// kanál a místní sponzory, anglická pro svět — rozhoduje ?lang= v adrese,
// jinak jazyk prohlížeče.

export const JAZYKY = ['cs', 'en'];

export function vyberJazyk() {
	const p = new URLSearchParams(location.search).get('lang');
	if (JAZYKY.includes(p)) return p;
	try {
		const u = localStorage.getItem('jazyk');
		if (JAZYKY.includes(u)) return u;
	} catch (e) { /* soukromé okno, nevadí */ }
	return (navigator.language || 'en').toLowerCase().startsWith('cs') ? 'cs' : 'en';
}

/// České „1 rok, 2 roky, 5 let“. Angličtina si vystačí s jedním s.
export function roky(n, jazyk) {
	if (jazyk !== 'cs') return n === 1 ? '1 year' : n + ' years';
	const z = n % 100;
	if (z === 1) return n + ' rok';
	if (z >= 2 && z <= 4) return n + ' roky';
	return n + ' let';
}

export function cislo(n, jazyk, des = 0) {
	return n.toLocaleString(jazyk === 'cs' ? 'cs-CZ' : 'en-GB', {
		minimumFractionDigits: des,
		maximumFractionDigits: des,
	});
}

export const UDALOSTI = [
	[2000, { cs: '⚛️ Česko spouští Temelín', en: '⚛️ Czechia starts up the Temelín nuclear plant' }],
	[2008, { cs: '🌬️ Větrníky a solár začínají zlevňovat', en: '🌬️ Wind and solar start getting cheap' }],
	[2011, { cs: '🌊 Fukušima: Japonsko vypíná jaderné elektrárny', en: '🌊 Fukushima: Japan shuts down its reactors' }],
	[2015, { cs: '🤝 Pařížská dohoda o klimatu', en: '🤝 The Paris climate agreement' }],
	[2017, { cs: '🇬🇧 Británie má první den bez uhlí od 19. století', en: '🇬🇧 Britain’s first coal-free day since the 1800s' }],
	[2020, { cs: '🦠 Covid: svět spotřebuje méně elektřiny', en: '🦠 Covid: the world uses less electricity' }],
	[2023, { cs: '🇩🇪 Německo vypíná poslední jaderné elektrárny', en: '🇩🇪 Germany switches off its last reactors' }],
	[2024, { cs: '🏭 Británie zavírá svou poslední uhelnou elektrárnu', en: '🏭 Britain closes its last coal power station' }],
	[2025, { cs: '☀️ Obnovitelné zdroje v 1. pololetí poprvé předběhly uhlí', en: '☀️ Renewables outrun coal for the first half of a year' }],
];

export const T = {
	cs: {
		nazev: '🌍 Svět zelená',
		podtitul: 'Odkud se bere elektřina: čisté zdroje (obnovitelné + jádro) proti uhlí, {0} → {1}',
		svet: 'Svět',
		evropa: 'Evropa',
		legendaUhelna: 'uhelná',
		legendaCista: 'čistá',
		legendaKomin: '🏭 = hodně uhlí',
		legendaVetrnik: '🌀 = skoro bez emisí',
		legendaSeda: 'šedá = bez dat',
		prepniJazyk: 'English',
		naKviz: '🎯 Denní kvíz',

		kartaVlakyK: 'Svět denně spálí uhlí na elektřinu za',
		kartaVlaky: '{0} vlaků',
		kartaZemeK: 'Kdyby se vlaky za rok seřadily za sebe, obtočily by Zemi',
		kartaZemeSub: '{0} TWh elektřiny z uhlí za rok',
		kartaCistaK: 'Čistá elektřina ve světě',
		kartaCistaSub: 'uhlí {0} % · ostatní fosilní {1} %',

		zapasNazev: '⚔️ Zápas století: čistá vs. špinavá elektřina',
		zapasCista: 'čistá (OZE + jádro)',
		zapasSpinava: 'špinavá (uhlí, plyn, ropa)',
		zapasHranice: 'hranice vítězství',
		zapasDrti: 'Špinavá drtí soupeře, čistá se teprve rozcvičuje.',
		zapasVede: 'Špinavá jasně vede, ale čistá se dostává do hry.',
		zapasNapinave: 'Napínavé! Čistá dotahuje.',
		zapasCistaVede: 'Čistá vede!',
		zapasPolepsila: ' Za posledních {0} si čistá polepšila o <b>{1} bodu</b>.',
		zapasZtraci: ' Čistá ztrácí dech: za posledních {0} <b>{1} bodu</b>.',
		zapasKlid: ' Skóre se moc nehýbe.',
		zapasTip: '🎙️ Komentátor tipuje: když čistá elektřina poroste tempem let {0}–{1} (+{2} bodu ročně), převezme vedení kolem roku <b>{3}</b>. Je to jen naivní odhad, ne předpověď.',

		kontNazev: '🏆 Souboje kontinentů',
		kontPodtitul: 'Závod o nejčistší elektřinu. Pořadí se mění s přehráváním mapy.',
		kontCisteUhli: 'čisté · uhlí {0} %',
		kontVyrovnane: 'Vyrovnaný souboj! {0} a {1} jdou skoro nastejno.',
		kontVede: '{0} vede o <b>{1} bodů</b>.',
		kontZlepsila: ' Od roku {0} se víc zlepšila {1} ({2} bodů).',
		kontVicUhli: ' {0} pálí víc uhlí než v roce {1} ({2} → {3} %).',

		usporaNazev: '💨 O kolik míň, než kdybychom nic nezměnili',
		usporaPodtitul: 'Čistá elektřina zatím emise nesnižuje. Brzdí jejich růst — a tohle je o kolik.',
		usporaDnes: 'vypouští světová elektřina · v roce {0} to bylo {1} Mt',
		usporaHlavni: 'Pořád přidáváme: emise od roku {0} vyrostly o {1} %. Čistá energie ten růst brzdí, k zemi ho zatím nesráží.',
		usporaHlavniZap: 'Tehdy čistá energie nestíhala ani brzdit — mix byl špinavější než v roce {0} a emise rostly rychleji než výroba.',
		usporaGrafPopis: 'Horní křivka: kolik by dnešní výroba vypustila s mixem zdrojů z roku {0}. Spodní: kolik vypouští doopravdy. Pod nimi samotný rozdíl.',
		usporaUsetreno: 'tolik CO₂ díky čistším zdrojům nevzniklo',
		usporaNavic: 'navíc proti mixu z roku {0}',
		usporaHorsi: 'Mix je zrovna špinavější než v roce {0}. Uhelný boom v Asii tehdy přebil všechno, co se jinde vyčistilo.',
		usporaMt: '{0} Mt',
		usporaSkutecne: 'skutečné emise',
		usporaKdyby: 'se zdroji z roku {0}',
		usporaOsa: 'Mt CO₂ ročně',
		usporaDole: 'samotný rozdíl mezi křivkami',
		usporaHorsiPozn: 'Mezi lety {0} a {1} byla ta mezera záporná: světový mix byl špinavější než v roce {2} a nejhůř v roce {3}, o {4} Mt.',
		usporaSrovnaniVic: 'Víc, než vypustí z elektřiny celá {0}.',
		usporaSrovnaniAsi: 'Zhruba tolik, kolik vypustí z elektřiny celá {0}.',
		usporaPozn: 'Výpočet drží mix zdrojů z roku {0} a nechává růst jen výrobu. Část toho zlepšení ale neudělaly obnovitelné zdroje a jádro, nýbrž náhrada uhlí plynem.',

		novaNazev: '⚡ Kolik z nové elektřiny pokryly čisté zdroje',
		novaPodtitul: 'Spotřeba každý rok povyroste. Sloupec říká, jakou část toho přírůstku zvládly obnovitelné zdroje a jádro. Nad sto procenty už fosilních elektráren ubývá.',
		novaPopis: 'z letošního přírůstku pokryly čisté zdroje',
		novaVetaNad: 'Čisté zdroje letos přidaly {0} TWh, spotřeba vyrostla o {1} TWh. Na fosilní elektrárny nezbylo nic — ubraly, a emise se nehnuly.',
		novaVetaPod: 'Čisté zdroje letos přidaly {0} TWh, ale spotřeba vyrostla o {1} TWh. Zbytek musely dodat fosilní elektrárny, takže emise stouply.',
		novaRecese: 'Spotřeba ten rok klesla, podíl na přírůstku nedává smysl.',
		novaOsa: '% přírůstku spotřeby',
		novaPozn: 'Přes sto procent se svět dostal i dřív, v letech {0}. Tehdy ale spotřeba vyrostla jen o {1} TWh, kdežto v roce {2} o {3}. Šedé roky ({4}) do srovnání nepatří: spotřeba v nich klesla, protože přišla krize a covid.',

		slunceK: 'Od chvíle, kdy jsi otevřel tuhle stránku, poslalo Slunce na Zemi tolik energie, kolik Česko spotřebuje za',
		slunceSub: 'Celoroční spotřebu celého lidstva Slunce dodá zhruba za 2 hodiny. Využíváme z toho zlomek promile.',
		ctverecTlacitko: '☀️ Kolik Sahary by stačilo?',
		ctverecSchovat: '✕ Schovat čtverec',
		ctverecPopis: '<b>☀️ 630 × 630 km solárních panelů</b><br>by nahradilo všechna fosilní paliva světa. Je to asi 5× Česko nebo 4 % Sahary.<br><span class="mut">Teď nad: {0} · přetáhni mě jinam</span>',
		ctverecMore: 'moře',

		detailCiste: 'čisté',
		detailUhli: 'uhlí',
		detailOstatni: 'ostatní fosilní',
		detailStara: 'poslední data za rok {0}',
		detailNorsko: 'Nabít telefon je tady <b>{0}× špinavější</b> než v Norsku.',
		detailNorskoStejne: 'Nabít telefon je tady skoro stejně čisté jako v Norsku.',
		detailNorskoSamo: 'Nabít telefon tady je skoro bez emisí.',
		detailSlunceVitr: '☀️ slunce {0} % · 🌬️ vítr {1} %',
		detailStouraly: 'Pro šťouraly: {0} g CO₂/kWh',
		prepocty: [
			'🚗 Nabít elektroauto tady znamená stejné emise jako ujet <b>{0} km</b> v benzínovém autě.',
			'🧺 Rok praní v pračce tady odpovídá <b>{0} km</b> autem.',
			'💡 Rok svícení jednou LED žárovkou odpovídá <b>{0} km</b> autem.',
			'☕ Za rok vaření vody v konvici vznikne tolik CO₂ jako při <b>{0} km</b> jízdy autem.',
		],

		pozn1: 'Slunce: na zemský povrch dopadá v průměru asi 89 000 TW. Česko spotřebuje zhruba 1,6 EJ primární energie ročně. Sluneční čtverec: náhrada fosilních paliv (asi 520 EJ) po elektrifikaci odpovídá zhruba 60 000 TWh elektřiny; při 150 kWh/m² pozemku a rok to dá asi 400 000 km², tedy čtverec 630 × 630 km.',
		pozn2: 'Kontinenty podle regionů Emberu, Latinská Amerika včetně Karibiku, Blízký východ zvlášť.',
		pozn3: 'Data: <a href="https://ember-energy.org/data/yearly-electricity-data/">Ember – Yearly electricity data</a>, licence CC BY 4.0. Čisté = obnovitelné zdroje + jádro. U zemí bez dat za poslední rok se drží poslední známá hodnota. Přepočet na vlaky: 1 TWh z černého uhlí ≈ 400 000 t uhlí; vlak má 50 vagónů po 60 t a je dlouhý asi 800 m. Data za {0}, naposledy obnovená {1}.',
	},

	en: {
		nazev: '🌍 The World Turns Green',
		podtitul: 'Where electricity comes from: clean sources (renewables + nuclear) against coal, {0} → {1}',
		svet: 'World',
		evropa: 'Europe',
		legendaUhelna: 'coal-fired',
		legendaCista: 'clean',
		legendaKomin: '🏭 = lots of coal',
		legendaVetrnik: '🌀 = almost no emissions',
		legendaSeda: 'grey = no data',
		prepniJazyk: 'Česky',
		naKviz: '🎯 Daily quiz',

		kartaVlakyK: 'Coal the world burns for electricity every day',
		kartaVlaky: '{0} trainloads',
		kartaZemeK: 'Lined up end to end, a year of those trains would circle the Earth',
		kartaZemeSub: '{0} TWh of coal power a year',
		kartaCistaK: 'Clean electricity worldwide',
		kartaCistaSub: 'coal {0} % · other fossil {1} %',

		zapasNazev: '⚔️ Match of the century: clean vs. dirty electricity',
		zapasCista: 'clean (renewables + nuclear)',
		zapasSpinava: 'dirty (coal, gas, oil)',
		zapasHranice: 'winning line',
		zapasDrti: 'Dirty is crushing it; clean is still warming up.',
		zapasVede: 'Dirty leads clearly, but clean is getting into the game.',
		zapasNapinave: 'Tight! Clean is catching up.',
		zapasCistaVede: 'Clean is ahead!',
		zapasPolepsila: ' Over the last {0} clean gained <b>{1} points</b>.',
		zapasZtraci: ' Clean is losing steam: <b>{1} points</b> over the last {0}.',
		zapasKlid: ' The score is barely moving.',
		zapasTip: '🎙️ The commentator’s guess: at the pace of {0}–{1} (+{2} points a year), clean takes the lead around <b>{3}</b>. A naive extrapolation, not a forecast.',

		kontNazev: '🏆 Continental showdown',
		kontPodtitul: 'A race for the cleanest electricity. The ranking shifts as the map plays.',
		kontCisteUhli: 'clean · coal {0} %',
		kontVyrovnane: 'Neck and neck! {0} and {1} are almost level.',
		kontVede: '{0} leads by <b>{1} points</b>.',
		kontZlepsila: ' Since {0}, {1} improved the most ({2} points).',
		kontVicUhli: ' {0} burns more coal than in {1} ({2} → {3} %).',

		usporaNazev: '💨 How much less than if nothing had changed',
		usporaPodtitul: 'Clean electricity is not cutting emissions yet. It is slowing their growth — this is by how much.',
		usporaDnes: 'the world’s electricity emits · in {0} it was {1} Mt',
		usporaHlavni: 'We are still adding: emissions grew by {1} % since {0}. Clean energy slows that growth, it does not yet pull it down.',
		usporaHlavniZap: 'Back then clean energy could not even slow it down — the mix was dirtier than in {0} and emissions grew faster than generation.',
		usporaGrafPopis: 'Top line: what today’s generation would emit with the {0} mix of sources. Bottom line: what it actually emits. Below: the gap on its own.',
		usporaUsetreno: 'of CO₂ never happened, thanks to cleaner sources',
		usporaNavic: 'extra against the {0} mix',
		usporaHorsi: 'Right now the mix is dirtier than in {0}. Asia’s coal boom outweighed everything that got cleaner elsewhere.',
		usporaMt: '{0} Mt',
		usporaSkutecne: 'actual emissions',
		usporaKdyby: 'with the {0} mix',
		usporaOsa: 'Mt CO₂ a year',
		usporaDole: 'the gap on its own',
		usporaHorsiPozn: 'From {0} to {1} the gap was negative: the world mix was dirtier than in {2}, worst in {3} by {4} Mt.',
		usporaSrovnaniVic: 'More than all of {0} emits from electricity.',
		usporaSrovnaniAsi: 'About as much as all of {0} emits from electricity.',
		usporaPozn: 'The calculation freezes the {0} mix of sources and lets only generation grow. Part of that improvement came from gas replacing coal, not from renewables and nuclear.',

		novaNazev: '⚡ How much of the new electricity clean sources covered',
		novaPodtitul: 'Demand grows every year. The bar shows how much of that growth renewables and nuclear handled. Above one hundred per cent, fossil plants are shrinking.',
		novaPopis: 'of this year’s growth was covered by clean sources',
		novaVetaNad: 'Clean sources added {0} TWh this year, demand grew by {1} TWh. Nothing was left for fossil plants — they shrank, and emissions held still.',
		novaVetaPod: 'Clean sources added {0} TWh this year, but demand grew by {1} TWh. Fossil plants had to supply the rest, so emissions rose.',
		novaRecese: 'Demand fell that year, so a share of growth makes no sense.',
		novaOsa: '% of demand growth',
		novaPozn: 'The world passed one hundred per cent before, in {0}. But demand then grew by only {1} TWh, against {3} in {2}. The grey years ({4}) do not belong in the comparison: demand fell, because of the financial crisis and covid.',

		slunceK: 'Since you opened this page, the Sun has sent the Earth as much energy as Czechia uses in',
		slunceSub: 'The Sun delivers humanity’s entire yearly energy use in about two hours. We capture a tiny fraction of a per mille.',
		ctverecTlacitko: '☀️ How much Sahara would do?',
		ctverecSchovat: '✕ Hide the square',
		ctverecPopis: '<b>☀️ 630 × 630 km of solar panels</b><br>would replace every fossil fuel on Earth. That is about 4 % of the Sahara.<br><span class="mut">Now over: {0} · drag me somewhere else</span>',
		ctverecMore: 'the sea',

		detailCiste: 'clean',
		detailUhli: 'coal',
		detailOstatni: 'other fossil',
		detailStara: 'latest data for {0}',
		detailNorsko: 'Charging a phone here is <b>{0}× dirtier</b> than in Norway.',
		detailNorskoStejne: 'Charging a phone here is about as clean as in Norway.',
		detailNorskoSamo: 'Charging a phone here is almost emission-free.',
		detailSlunceVitr: '☀️ solar {0} % · 🌬️ wind {1} %',
		detailStouraly: 'For the pedants: {0} g CO₂/kWh',
		prepocty: [
			'🚗 Charging an electric car here emits as much as driving <b>{0} km</b> on petrol.',
			'🧺 A year of laundry here is worth <b>{0} km</b> by car.',
			'💡 A year of one LED bulb is worth <b>{0} km</b> by car.',
			'☕ A year of boiling the kettle emits as much CO₂ as <b>{0} km</b> of driving.',
		],

		pozn1: 'The Sun: about 89,000 TW reaches the Earth’s surface on average. Czechia uses roughly 1.6 EJ of primary energy a year. The solar square: replacing fossil fuels (about 520 EJ) after electrification needs some 60,000 TWh of electricity; at 150 kWh per m² of land per year that is about 400,000 km², a square of 630 × 630 km.',
		pozn2: 'Continents follow Ember’s regions: Latin America includes the Caribbean, the Middle East is counted separately.',
		pozn3: 'Data: <a href="https://ember-energy.org/data/yearly-electricity-data/">Ember – Yearly electricity data</a>, CC BY 4.0. Clean = renewables + nuclear. Countries without data for the latest year keep their last known value. Trainloads: 1 TWh of hard coal ≈ 400,000 t; a train has 50 wagons of 60 t and is about 800 m long. Data through {0}, last updated {1}.',
	},
};

/// Doplní {0}, {1} … do textu.
/// Seznam do věty: „2015 a 2019“, „2015, 2017 a 2019“.
export function vyjmenuj(pole, jazyk) {
	const a = pole.map(String);
	if (a.length < 2) return a.join('');
	return a.slice(0, -1).join(', ') + (jazyk === 'cs' ? ' a ' : ' and ') + a.at(-1);
}

export function f(sablona, ...a) {
	return String(sablona).replace(/\{(\d+)\}/g, (_, i) => (a[i] === undefined ? '' : a[i]));
}

// ---------- denní kvíz „Kdo je čistší?“ ----------
// Psané napřed anglicky: kvíz má mířit na svět, česká verze je jazyková mutace.
export const TK = {
	en: {
		nazev: '🌍 Who’s cleaner?',
		naMapu: '← the map',
		prepniJazyk: 'Česky',
		serie: '🔥 {0}',
		otazkaCista: 'Which country has cleaner electricity?',
		otazkaUhli: 'Which country burns more coal?',
		dalsi: 'Next →',
		vysledek: 'Result →',
		spravne: '✅ <b>Right!</b> ',
		vedle: '❌ <b>Nope.</b> ',
		statistika: '<b>{0} %</b> clean · <b>{1} %</b> coal',
		fakta: [
			'Charging an electric car (50 kWh) in {0} emits about <b>{1} kg of CO₂</b> — like driving {2} km on petrol. In {3} it is <b>{4} kg</b>.',
			'The same kilowatt-hour is roughly <b>{0}× dirtier</b> in {1} than in {2}.',
			'A kilowatt-hour emits about <b>{0} g of CO₂</b> in {1} and about <b>{2} g</b> in {3}.',
			'In {0}, roughly <b>{1}</b> light bulb runs on coal.',
			'{0} gets <b>{1} %</b> of its electricity from renewables and nuclear.',
		],
		zarovkaKazdaDruha: 'every second',
		zarovkaKazdaTreti: 'every third',
		zarovkaKazda: 'every {0}th',
		dnesniVysledek: 'Today’s score',
		verdikt: ['Coal got the better of you today. 🏭', 'Not bad, a few countries caught you out. 🌤️', 'Nicely done, you know your grids. 🌱', 'Energy guru! 🌞'],
		zkopirovat: '📋 Copy result',
		zkopirovano: '✅ Copied',
		kopirovaniNejde: 'Copying failed, your score: {0}',
		znovu: 'Play again (random questions)',
		zebricek: 'Countries from cleanest to dirtiest',
		legendaCista: 'clean (renewables + nuclear)',
		legendaUhli: 'coal',
		legendaPlyn: 'gas and oil',
		sdileni: 'Who’s cleaner? {0}\n{1} {2}\n{3}',
		pozn: 'Eight duels a day, the same for everyone. Data: <a href="https://ember-energy.org/data/yearly-electricity-data/">Ember</a>, CC BY 4.0, year {0}. Only the 50 largest electricity producers take part.',
	},

	cs: {
		nazev: '🌍 Kdo je čistší?',
		naMapu: '← na mapu',
		prepniJazyk: 'English',
		serie: '🔥 {0}',
		otazkaCista: 'Která země má čistší elektřinu?',
		otazkaUhli: 'Která země pálí víc uhlí?',
		dalsi: 'Další →',
		vysledek: 'Výsledek →',
		spravne: '✅ <b>Správně!</b> ',
		vedle: '❌ <b>Vedle.</b> ',
		statistika: '<b>{0} %</b> čisté · <b>{1} %</b> uhlí',
		fakta: [
			'Nabití elektroauta (50 kWh) v zemi {0} vypustí asi <b>{1} kg CO₂</b>, což odpovídá {2} km v benzínovém autě. V zemi {3} jen <b>{4} kg</b>.',
			'Stejná kilowatthodina je v zemi {1} zhruba <b>{0}× špinavější</b> než v zemi {2}.',
			'Kilowatthodina vypustí v zemi {1} asi <b>{0} g CO₂</b>, v zemi {3} asi <b>{2} g</b>.',
			'V zemi {0} svítí z uhlí zhruba <b>{1} žárovka</b>.',
			'Země {0} má <b>{1} %</b> elektřiny z obnovitelných zdrojů a jádra.',
		],
		zarovkaKazdaDruha: 'každá druhá',
		zarovkaKazdaTreti: 'každá třetí',
		zarovkaKazda: 'každá {0}.',
		dnesniVysledek: 'Dnešní výsledek',
		verdikt: ['Uhlí tě dneska převezlo. 🏭', 'Slušné, ale pár zemí tě zaskočilo. 🌤️', 'Výborně, máš přehled. 🌱', 'Energetický guru! 🌞'],
		zkopirovat: '📋 Zkopírovat výsledek',
		zkopirovano: '✅ Zkopírováno',
		kopirovaniNejde: 'Kopírování nejde, výsledek: {0}',
		znovu: 'Hrát znovu (náhodné otázky)',
		zebricek: 'Žebříček zemí, od nejčistší po nejšpinavější',
		legendaCista: 'čisté (OZE + jádro)',
		legendaUhli: 'uhlí',
		legendaPlyn: 'plyn a ropa',
		sdileni: 'Kdo je čistší? {0}\n{1} {2}\n{3}',
		pozn: 'Osm soubojů denně, pro všechny stejných. Data: <a href="https://ember-energy.org/data/yearly-electricity-data/">Ember</a>, licence CC BY 4.0, rok {0}. Hraje se jen s padesáti největšími výrobci elektřiny.',
	},
};

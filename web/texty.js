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
		pozn3: 'Data: <a href="https://ember-energy.org/data/yearly-electricity-data/">Ember – Yearly electricity data</a>, licence CC BY 4.0. Čisté = obnovitelné zdroje + jádro. U zemí bez dat za poslední rok se drží poslední známá hodnota. Přepočet na vlaky: 1 TWh z černého uhlí ≈ 400 000 t uhlí; vlak má 50 vagónů po 60 t a je dlouhý asi 800 m. Data za {0}, stažená {1}.',
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
		pozn3: 'Data: <a href="https://ember-energy.org/data/yearly-electricity-data/">Ember – Yearly electricity data</a>, CC BY 4.0. Clean = renewables + nuclear. Countries without data for the latest year keep their last known value. Trainloads: 1 TWh of hard coal ≈ 400,000 t; a train has 50 wagons of 60 t and is about 800 m long. Data through {0}, downloaded {1}.',
	},
};

/// Doplní {0}, {1} … do textu.
export function f(sablona, ...a) {
	return String(sablona).replace(/\{(\d+)\}/g, (_, i) => (a[i] === undefined ? '' : a[i]));
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahParshaTitleRegistry
 * @description
 * The Awtsmoos gives every weekly parsha its true Hebrew name and its proper
 * English companion; Awtsmoos.com never shows a raw database ID or a mechanical
 * letter-transliteration where a real parsha name belongs.
 *
 * English names use standard Chabad/Ashkenazi transliteration as Yaakov requires:
 * Chayei Sarah (not "chyy shrh"), Toldos (not "tvldvt"), Vayeitzei (not "vytz").
 */

const PARSHA_TITLES = Object.freeze({
	// Bereishis
	bereishis: title('בראשית', 'Bereishis'),
	noach: title('נח', 'Noach'),
	lechLecha: title('לך לך', 'Lech Lecha'),
	vayeira: title('וירא', 'Vayeira'),
	chayeiSarah: title('חיי שרה', 'Chayei Sarah'),
	toldos: title('תולדות', 'Toldos'),
	vayeitzei: title('ויצא', 'Vayeitzei'),
	vayishlach: title('וישלח', 'Vayishlach'),
	vayeishev: title('וישב', 'Vayeishev'),
	mikeitz: title('מקץ', 'Mikeitz'),
	vayigash: title('ויגש', 'Vayigash'),
	vayechi: title('ויחי', 'Vayechi'),
	// Shemos
	shemos: title('שמות', 'Shemos'),
	vaera: title('וארא', 'Vaera'),
	bo: title('בא', 'Bo'),
	beshalach: title('בשלח', 'Beshalach'),
	yisro: title('יתרו', 'Yisro'),
	mishpatim: title('משפטים', 'Mishpatim'),
	terumah: title('תרומה', 'Terumah'),
	tetzaveh: title('תצוה', 'Tetzaveh'),
	kiSisa: title('כי תשא', 'Ki Sisa'),
	vayakhel: title('ויקהל', 'Vayakhel'),
	pekudei: title('פקודי', 'Pekudei'),
	// Vayikra
	vayikra: title('ויקרא', 'Vayikra'),
	tzav: title('צו', 'Tzav'),
	shemini: title('שמיני', 'Shemini'),
	tazria: title('תזריע', 'Tazria'),
	metzora: title('מצורע', 'Metzora'),
	acharei: title('אחרי', 'Acharei'),
	kedoshim: title('קדושים', 'Kedoshim'),
	emmor: title('אמור', 'Emor'),
	behar: title('בהר', 'Behar'),
	bechukosai: title('בחקותי', 'Bechukosai'),
	// Bamidbar
	bamidbar: title('במדבר', 'Bamidbar'),
	nasso: title('נשא', 'Nasso'),
	behaloscha: title('בהעלתך', "Behaaloscha"),
	shelach: title('שלח', 'Shelach'),
	korach: title('קרח', 'Korach'),
	chukas: title('חקת', 'Chukas'),
	balak: title('בלק', 'Balak'),
	pinchas: title('פנחס', 'Pinchas'),
	matos: title('מטות', 'Matos'),
	masei: title('מסעי', 'Masei'),
	// Devarim
	devarim: title('דברים', 'Devarim'),
	vaeschanan: title('ואתחנן', 'Vaeschanan'),
	eikev: title('עקב', 'Eikev'),
	reeh: title('ראה', "Re'eh"),
	shoftim: title('שופטים', 'Shoftim'),
	kiSeitzei: title('כי תצא', 'Ki Seitzei'),
	kiSavo: title('כי תבא', 'Ki Savo'),
	nitzavim: title('נצבים', 'Nitzavim'),
	vayeilech: title('וילך', 'Vayeilech'),
	haazinu: title('האזינו', 'Haazinu'),
	vezosHaBerachah: title('וזאת הברכה', 'Vezos HaBerachah')
});

/**
 * Maps common ID fragments to canonical parsha keys.
 * Handles variations like "nch" (Noach), "brsh" (Bereishis), etc.
 */
const ID_FRAGMENTS = Object.freeze({
	nch: 'noach',
	brsh: 'bereishis',
	brshis: 'bereishis',
	lchlch: 'lechLecha',
	vyr: 'vayeira',
	chyy: 'chayeiSarah',
	chayei: 'chayeiSarah',
	srh: 'chayeiSarah',
	tvld: 'toldos',
	tvldvt: 'toldos',
	toldot: 'toldos',
	vytz: 'vayeitzei',
	vayetz: 'vayeitzei',
	vyshlch: 'vayishlach',
	vyshev: 'vayeishev',
	mqtz: 'mikeitz',
	miketz: 'mikeitz',
	vygsh: 'vayigash',
	vychy: 'vayechi',
	shm: 'shemos',
	shmot: 'shemos',
	vara: 'vaera',
	ba: 'bo',
	bshlch: 'beshalach',
	ytrv: 'yisro',
	mshptm: 'mishpatim',
	trumh: 'terumah',
	tztzv: 'tetzaveh',
	kitsa: 'kiSisa',
	kytsa: 'kiSisa',
	vyqhl: 'vayakhel',
	pqdy: 'pekudei',
	vyqr: 'vayikra',
	tzv: 'tzav',
	shmyny: 'shemini',
	tzrya: 'tazria',
	mtzra: 'metzora',
	achry: 'acharei',
	qdshm: 'kedoshim',
	emr: 'emmor',
	bhr: 'behar',
	bchqty: 'bechukosai',
	bmdbr: 'bamidbar',
	nsa: 'nasso',
	bhalotcha: 'behaloscha',
	bhlotcha: 'behaloscha',
	shlch: 'shelach',
	qrch: 'korach',
	chqt: 'chukas',
	blq: 'balak',
	pnchs: 'pinchas',
	mtot: 'matos',
	msay: 'masei',
	dbrm: 'devarim',
	vatchnn: 'vaeschanan',
	vaetchnn: 'vaeschanan',
	aqb: 'eikev',
	rah: 'reeh',
	shftm: 'shoftim',
	kitza2: 'kiSeitzei',
	kitvo: 'kiSavo',
	ntzbm: 'nitzavim',
	vylch: 'vayeilech',
	haznw: 'haazinu',
	vzbrch: 'vezosHaBerachah'
});

/**
 * Returns the canonical title pair for a parsha ID or fragment.
 * @param {string} id Stable parsha ID or fragment.
 * @returns {{he:string,en:string}|null} Canonical pair or null.
 */
export function parshaTitleById(id = '') {
	const key = String(id).trim();
	if (PARSHA_TITLES[key]) return PARSHA_TITLES[key];
	const fragment = ID_FRAGMENTS[key.toLowerCase()];
	if (fragment && PARSHA_TITLES[fragment]) return PARSHA_TITLES[fragment];
	return null;
}

/**
 * Returns the canonical title pair for a Hebrew parsha name.
 * @param {string} hebrew Hebrew parsha name.
 * @returns {{he:string,en:string}|null} Canonical pair or null.
 */
export function parshaTitleByHebrew(hebrew = '') {
	const normalized = String(hebrew).trim();
	for (const pair of Object.values(PARSHA_TITLES)) {
		if (pair.he === normalized) return pair;
	}
	return null;
}

/** Returns all parsha titles for iteration. */
export function allParshaTitles() {
	return PARSHA_TITLES;
}

function title(he, en) {
	return Object.freeze({ he, en });
}

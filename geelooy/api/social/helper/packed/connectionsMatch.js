// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PackedConnectionsMatch
 * @description
 * Heuristic matching of reverse-citation keys against a post's sefer/chapter
 * identity. PRECISION OVER RECALL: a key is only treated as citing a post when
 * ALL of these hold —
 *   1. the key is a sefer: reference (verse:/rambam:/mishnah: keys can never
 *      name a specific sefer chapter, so they are never incoming matches);
 *   2. the post's sefer name appears as a STANDALONE Hebrew token (boundary
 *      aware, so extraction noise like "מדתניא"/"דמדתניא" never matches תניא);
 *   3. the post's number appears with a chapter-ish marker (פרק/סימן/דף/חלק)
 *      or as a standalone numeral token (Hebrew numerals need 2+ letters;
 *      lone א/ב are too noisy — they only count with an explicit marker);
 *   4. for Likkutei Torah posts: the parsha/holiday Hebrew name must also
 *      appear standalone (a bare "לקוטי תורה" citation names no chapter);
 *   5. for halachah siman posts: the section Hebrew name (אורח חיים…)
 *      must also appear standalone.
 * Self-citations (entry.post === postId) are excluded from incoming — they are
 * already reported as outgoing.
 *
 * Honest limitation: the current indexes mostly cite OTHER sefarim (or the
 * same sefer without a chapter marker), so incoming lists are OFTEN EMPTY.
 * That is reported as an empty state, never papered over.
 */

const HEBREW_VALUES = {
	א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9,
	י: 10, כ: 20, ך: 20, ל: 30, מ: 40, ם: 40, נ: 50, ן: 50,
	ס: 60, ע: 70, פ: 80, ף: 80, צ: 90, ץ: 90, ק: 100, ר: 200, ש: 300, ת: 400
};

const PARSHA_HEBREW = {
	'bereshis': 'בראשית', 'noach': 'נח', 'lech-lecha': 'לך לך', 'vayeira': 'וירא',
	'chayei-sarah': 'חיי שרה', 'toldos': 'תולדות', 'vayeitzei': 'ויצא',
	'vayishlach': 'וישלח', 'vayeishev': 'וישב', 'mikeitz': 'מקץ', 'vayigash': 'ויגש',
	'vayechi': 'ויחי', 'shemos': 'שמות', 'vaeira': 'וארא', 'bo': 'בא',
	'beshalach': 'בשלח', 'yisro': 'יתרו', 'mishpatim': 'משפטים', 'terumah': 'תרומה',
	'tetzaveh': 'תצוה', 'ki-sisa': 'כי תשא', 'vayakhel': 'ויקהל', 'pekudei': 'פקודי',
	'vayikra': 'ויקרא', 'tzav': 'צו', 'shemini': 'שמיני', 'tazria': 'תזריע',
	'metzora': 'מצורע', 'acharei': 'אחרי מות', 'kedoshim': 'קדושים', 'emor': 'אמור',
	'behar': 'בהר', 'bechukosai': 'בחקותי', 'bamidbar': 'במדבר', 'naso': 'נשא',
	'behaalotecha': 'בהעלותך', 'shelach': 'שלח לך', 'korach': 'קרח', 'chukas': 'חקת',
	'balak': 'בלק', 'pinchas': 'פינחס', 'matos': 'מטות', 'masei': 'מסעי',
	'devarim': 'דברים', 'vaeschanan': 'ואתחנן', 'eikev': 'עקב', 'reeh': 'ראה',
	'shoftim': 'שופטים', 'ki-seitzei': 'כי תצא', 'ki-savo': 'כי תבוא',
	'nitzavim': 'נצבים', 'vayelech': 'וילך', 'haazinu': 'האזינו',
	'vezos-habracha': 'וזאת הברכה',
	'rosh-hashanah': 'ראש השנה', 'yom-kippur': 'יום כפור', 'sukkot': 'סוכות',
	'shemini-atzeret': 'שמיני עצרת', 'shabbat-shuvah': 'שבת שובה',
	'pesach': 'פסח', 'shavuos': 'שבועות', 'chanukah': 'חנוכה', 'purim': 'פורים'
};

const HALACHAH_SECTIONS = {
	'orachchaim': 'אורח חיים',
	'yorehdeah': 'יורה דעה',
	'evenhaezer': 'אבן העזר',
	'choshenmishpat': 'חושן משפט'
};

const CORPUS_DEFS = {
	'tanya': { names: ['ספר התניא', 'תניא', 'לקוטי אמרים'] },
	'igeres': { names: ['אגרת הקדש', 'אגרות הקדש', 'אגרת הקודש'] },
	'lt': { names: ['לקוטי תורה', 'ליקוטי תורה'], parshaSlugs: PARSHA_HEBREW },
	'halachah-sa': { names: ['שולחן ערוך הרב', 'שולחן ערוך', 'שלחן ערוך'], sections: HALACHAH_SECTIONS },
	'halachah-tur': { names: ['ארבעה טורים', 'טור'], sections: HALACHAH_SECTIONS },
	'halachah-saharav': { names: ['שולחן ערוך הרב', 'שלחן ערוך הרב'], sections: HALACHAH_SECTIONS },
	'mishnah-berurah': { names: ['משנה ברורה'] },
	'biur-halachah': { names: ['ביאור הלכה'] },
	'shaar-hatziyun': { names: ['שער הציון'] }
};

const NUMBER_MARKERS = ['פרק', 'סימן', 'סי', 'דף'];

/** Precompiled standalone-name regex per corpus (built once — hot path). */
const CORPUS_NAME_RES = {};
for (const [corpus, def] of Object.entries(CORPUS_DEFS)) {
	const alt = def.names.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
	CORPUS_NAME_RES[corpus] = new RegExp('(^|[^א-ת])(' + alt + ')([^א-ת]|$)');
}
/** Corpus-specific key exclusions: a key naming a DIFFERENT sefer with a colliding name. */
const CORPUS_KEY_EXCLUDES = {
	// "ספר התניא … חלק אגרת הקדש" is Tanya's own Igeres HaKodesh, not the Rebbe's letters.
	'igeres': [new RegExp('(^|[^א-ת])(ספר התניא|תניא)([^א-ת]|$)')]
};
/** Lazily compiled standalone-phrase regexes (parsha/section names). */
const PHRASE_RE_CACHE = new Map();

/** Tanya part hints: which series an unqualified "תניא פרק N" citation means. */
const TANYA_PART_HINTS = [
	{ series: 'it', names: ['אגרת התשובה'] },
	{ series: 'ka', names: ['קונטרס אחרון'] },
	{ series: 'sh', names: ['שער היחוד והאמונה', 'שער היחוד'] },
	{ series: 'la', names: ['לקוטי אמרים', 'ספר של בינונים'] }
];

/** @description Resolves which Tanya series a citation key means (default 'la'). @param {string} rest Key remainder. @returns {string} Series code. */
function tanyaSeriesHint(rest) {
	for (const hint of TANYA_PART_HINTS) {
		if (hint.names.some((name) => phraseRe(name).test(rest))) return hint.series;
	}
	return 'la'; // Unqualified "תניא פרק N" means Likutei Amarim.
}
/** @description Standalone-phrase regex, cached. @param {string} phrase Hebrew phrase. @returns {RegExp} Regex. */
function phraseRe(phrase) {
	let re = PHRASE_RE_CACHE.get(phrase);
	if (!re) {
		re = new RegExp('(^|[^א-ת])(' + phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')([^א-ת]|$)');
		PHRASE_RE_CACHE.set(phrase, re);
	}
	return re;
}

/** @description Converts a Hebrew-letter token to its gematria value. @param {string} token Token with geresh/gershayim stripped. @returns {number|null} Value or null. */
function hebrewNumeral(token) {
	const clean = String(token).replace(/[׳״'"]/g, '');
	if (!/^[א-תךםןףץ]+$/.test(clean)) return null;
	let value = 0;
	for (const ch of clean) value += HEBREW_VALUES[ch] || 0;
	return value > 0 ? value : null;
}

/** @description Numeric value of a token: Arabic digits or Hebrew numeral. @param {string} token Raw token. @returns {number|null} Value or null. */
function tokenNumber(token) {
	const t = String(token).replace(/[׳״'"]/g, '');
	if (/^\d+$/.test(t)) return parseInt(t, 10);
	return hebrewNumeral(t);
}

/** @description Splits text into word tokens on whitespace/punctuation. @param {string} text Input. @returns {string[]} Tokens. */
function tokenize(text) {
	return String(text).split(/[\s:׃.,;״׳'"()\[\]{}|/\\\-–—־‐\n\r\t]+/).filter(Boolean);
}

/** @description True when phrase appears with Hebrew-letter boundaries. @param {string} text Haystack. @param {string} phrase Hebrew phrase. @returns {boolean} Match. */
function hasStandalone(text, phrase) {
	const esc = String(phrase).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return new RegExp('(^|[^א-ת])' + esc + '([^א-ת]|$)').test(String(text));
}

/** @description True when any sefer name matches standalone. @param {string} rest Key remainder after 'sefer:'. @param {string[]} names Sefer names. @returns {boolean} Match. */
function mentionsSeferName(rest, names) {
	return names.some((name) => hasStandalone(rest, name));
}

/**
 * @description Extracts every number the key remainder cites, strictly.
 * Accepted forms: marker+number bigrams (פרק יב, סימן תרב, דף צו), compact
 * perek abbreviations with gershayim (פי״ב, פ״ב, בפי״ב), standalone Arabic
 * digits, and standalone Hebrew numerals ONLY when they carry gershayim/
 * geresh (י״ב) — a bare word like ספר/הזקן/צח is never treated as its
 * gematria value, no matter what it sums to.
 * @param {string} rest Key remainder after 'sefer:'. @returns {Set<number>} Cited numbers.
 */
function extractNumbers(rest) {
	const text = String(rest);
	const found = new Set();
	const abbrevWords = text.match(/[א-תךםןףץ]*[״׳][א-תךםןףץ]*/g) || [];
	for (const word of abbrevWords) {
		const dePre = word.replace(/^[בכלמש]/, '');
		if (!/^פ/.test(dePre)) continue;
		const numeral = dePre.replace(/^פ/, '').replace(/[״׳'"]/g, '');
		const val = numeral && hebrewNumeral(numeral);
		if (val) found.add(val);
	}
	const tokens = tokenize(text);
	for (let i = 0; i < tokens.length; i++) {
		const tok = tokens[i];
		const bare = tok.replace(/^[בכלמ]/, '');
		const marker = NUMBER_MARKERS.includes(tok) || NUMBER_MARKERS.includes(bare);
		if (marker && i + 1 < tokens.length) {
			const val = tokenNumber(tokens[i + 1]);
			if (val) found.add(val);
			continue;
		}
		const stripped = tok.replace(/[׳״'"]/g, '');
		if (/^\d+$/.test(stripped)) {
			// "הערה 15" is a footnote reference, not a chapter/siman citation.
			const prev = i > 0 ? tokens[i - 1].replace(/^[בכלמ]/, '') : '';
			if (!['הערה', 'הערות'].includes(prev)) found.add(parseInt(stripped, 10));
			continue;
		}
		// Standalone Hebrew numeral only with explicit gershayim/geresh.
		if (/[׳״]/.test(tok)) {
			const prev = i > 0 ? tokens[i - 1].replace(/^[בכלמ]/, '') : '';
			if (['הערה', 'הערות'].includes(prev)) continue; // footnote, not a citation
			const val = hebrewNumeral(stripped);
			if (val) found.add(val);
		}
	}
	return found;
}

/**
 * @description True when the key remainder cites the given number.
 * @param {string} rest Key remainder after 'sefer:'. @param {number} num Target number. @returns {boolean} Match.
 */
function mentionsNumber(rest, num) {
	return extractNumbers(rest).has(num);
}

/**
 * Precomputed per-key matching work: numbers extracted once per index load
 * instead of once per (post, key) pair. Cached weakly on the reverse Map so a
 * reload (new Map) rebuilds it automatically.
 * @type {WeakMap<Map, Array<{key: string, rest: string, entries: Array, numbers: Set<number>}>>}
 */
const WORKLIST_CACHE = new WeakMap();

/** @description Builds the sefer-key worklist for a reverse map. @param {Map} reverse Reverse key map. @returns {Array} Worklist. */
function reverseWorklist(reverse) {
	let list = WORKLIST_CACHE.get(reverse);
	if (list) return list;
	list = [];
	for (const [key, entries] of reverse) {
		if (!key.startsWith('sefer:')) continue;
		const rest = key.slice('sefer:'.length);
		list.push({ key, rest, entries, numbers: extractNumbers(rest) });
	}
	WORKLIST_CACHE.set(reverse, list);
	return list;
}

/**
 * @description Parses a postId into its corpus identity.
 * @param {string} postId Post identifier.
 * @returns {{corpus: string, num: number|null, slug: string|null, section: string|null, series: string|null}|null} Identity or null.
 */
function parsePostIdentity(postId) {
	const id = String(postId || '').trim();
	let m;
	if ((m = id.match(/^tanya-he-([a-z]+)-(\d+)$/))) {
		return { corpus: 'tanya', series: m[1], num: parseInt(m[2], 10), slug: null, section: null };
	}
	if ((m = id.match(/^igeres-he-v(\d+)-(\d+)$/))) {
		return { corpus: 'igeres', series: 'v' + m[1], num: parseInt(m[2], 10), slug: null, section: null };
	}
	if ((m = id.match(/^lt-([a-z-]+)-ch(\d+)$/))) {
		return { corpus: 'lt', series: null, num: parseInt(m[2], 10), slug: m[1], section: null };
	}
	if ((m = id.match(/^halachah-(sa|tur|saharav)-([a-z]+)(?:-[a-z0-9-]+)?-(\d+)$/))) {
		return { corpus: 'halachah-' + m[1], series: null, num: parseInt(m[3], 10), slug: null, section: m[2] };
	}
	if ((m = id.match(/^(mishnah-berurah|biur-halachah|shaar-hatziyun)(?:-[a-z]+)?-([a-z]+)-(\d+)$/))) {
		return { corpus: m[1], series: null, num: parseInt(m[3], 10), slug: null, section: null };
	}
	return null;
}

/**
 * @description Finds reverse-index keys that cite the given post (incoming).
 * @param {string} postId Post identifier. @param {Map} reverse Reverse key map.
 * @returns {Array<{key: string, post: string, para: number|null, raw: string}>} Matching citations.
 */
function findIncomingCitations(postId, reverse) {
	const ident = parsePostIdentity(postId);
	if (!ident || !ident.num) return [];
	const def = CORPUS_DEFS[ident.corpus];
	if (!def) return [];
	const nameRe = CORPUS_NAME_RES[ident.corpus];
	const excludes = CORPUS_KEY_EXCLUDES[ident.corpus] || [];
	const parshaHeb = def.parshaSlugs && ident.slug ? def.parshaSlugs[ident.slug] : null;
	const parshaRe = parshaHeb ? phraseRe(parshaHeb) : null;
	const sectionHeb = def.sections && ident.section ? def.sections[ident.section] : null;
	const sectionRe = sectionHeb ? phraseRe(sectionHeb) : null;
	const out = [];
	for (const item of reverseWorklist(reverse)) {
		if (!nameRe.test(item.rest)) continue;
		if (excludes.some((re) => re.test(item.rest))) continue;
		if (ident.corpus === 'tanya' && ident.series !== tanyaSeriesHint(item.rest)) continue;
		if (parshaRe && !parshaRe.test(item.rest)) continue;
		if (sectionRe && !sectionRe.test(item.rest)) continue;
		if (!item.numbers.has(ident.num)) continue;
		for (const entry of item.entries) {
			if (entry.post === postId) continue;
			out.push({ key: item.key, post: entry.post, para: entry.para, raw: entry.raw });
		}
	}
	return out;
}

module.exports = {
	parsePostIdentity,
	findIncomingCitations,
	hebrewNumeral,
	tokenNumber,
	hasStandalone,
	mentionsNumber,
	extractNumbers,
	CORPUS_DEFS
};

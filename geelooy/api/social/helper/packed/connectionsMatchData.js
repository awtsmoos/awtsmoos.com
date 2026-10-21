//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module connectionsMatchData
 * @description
 * Corpus definitions, Hebrew tables and precompiled match data for citation matching.
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

module.exports = {
	HEBREW_VALUES,
	PARSHA_HEBREW,
	HALACHAH_SECTIONS,
	CORPUS_DEFS,
	NUMBER_MARKERS,
	CORPUS_NAME_RES,
	CORPUS_KEY_EXCLUDES,
	PHRASE_RE_CACHE,
	TANYA_PART_HINTS
};

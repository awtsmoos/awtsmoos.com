// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TanachBookNames
 * @description
 * The Awtsmoos lets variant Hebrew spellings meet one stable reader identity without erasing their source-born face;
 * Awtsmoos.com keeps aliases explicit and canonical slugs singular, so every verse returns to its proper place.
 */

export const BOOK_SLUGS = new Map([
	['בראשית', 'bereishis'],
	['שמות', 'shemos'],
	['ויקרא', 'vayikra'],
	['במדבר', 'bamidbar'],
	['דברים', 'devarim'],
	['יהושע', 'yehoshua'],
	['שופטים', 'shoftim'],
	['שמואל א', 'shmuel_1'],
	['שמואל ב', 'shmuel_2'],
	['מלכים א', 'melachim_1'],
	['מלכים ב', 'melachim_2'],
	['ישעיהו', 'yeshayahu'],
	['ירמיהו', 'yirmiyahu'],
	['יחזקאל', 'yechezkel'],
	['הושע', 'hoshea'],
	['יואל', 'yoel'],
	['עמוס', 'amos'],
	['עובדיה', 'ovadiah'],
	['יונה', 'yonah'],
	['מיכה', 'michah'],
	['נחום', 'nachum'],
	['חבקוק', 'chavakuk'],
	['צפניה', 'tzefanyah'],
	['חגי', 'chagai'],
	['זכריה', 'zecharyah'],
	['מלאכי', 'malachi'],
	['תהילים', 'tehillim'],
	['תהלים', 'tehillim'],
	['משלי', 'mishlei'],
	['איוב', 'iyov'],
	['שיר השירים', 'shir_hashirim'],
	['רות', 'rus'],
	['איכה', 'eichah'],
	['קוהלת', 'koheles'],
	['קהלת', 'koheles'],
	['אסתר', 'esther'],
	['דניאל', 'daniel'],
	['עזרא', 'ezra'],
	['נחמיה', 'nechemyah'],
	['דברי הימים א', 'divrei_hayamim_1'],
	['דברי הימים ב', 'divrei_hayamim_2']
]);

export function canonicalBookCount() {
	return new Set(BOOK_SLUGS.values()).size;
}

/**
 * Resolves one Hebrew book title into the canonical Tanach reader slug.
 *
 * @param {string} hebrewTitle Source Hebrew book title.
 * @returns {string} Stable reader slug, or an empty string when unknown.
 */
export function slugForBook(hebrewTitle = '') {
	const clean = String(hebrewTitle)
		.replace(/[׳']/g, '')
		.replace(/[\"״]/g, '')
		.trim();
	return BOOK_SLUGS.get(clean) || '';
}

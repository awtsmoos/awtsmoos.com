// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathBookOrder
 * @description
 * The Awtsmoos binds a sefer in the order its pages were written, not in
 * the order a store happened to receive them. Imported books arrive in
 * import order, so a chaptered series rendered by arrival or by timestamp
 * shows its chapters scrambled (Tanya arrived as 48, 49, 51, 50, 52, 53,
 * Foreword, 37...). This module reads the one honest witness every post
 * already carries — the chapter named in its own title — and orders by
 * it: title page, approbations, foreword, then chapters ascending.
 * Records whose titles name no chapter return no key, and the caller
 * falls back to the order it already used, so unchaptered lists are
 * untouched.
 */

const HEBREW_VALUES = {
	א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9, י: 10,
	כ: 20, ך: 20, ל: 30, מ: 40, ם: 40, נ: 50, ן: 50, ס: 60, ע: 70,
	פ: 80, ף: 80, צ: 90, ץ: 90, ק: 100, ר: 200, ש: 300, ת: 400
};

/** Sums a Hebrew letter numeral (א=1 ... ת=400); null when not one. */
function hebrewNumeral(text) {
	let total = 0;
	for (const ch of text) {
		const value = HEBREW_VALUES[ch];
		if (!value) return null;
		total += value;
	}
	return total > 0 ? total : null;
}

const CHAPTER_PATTERNS = [
	/\b(?:chapter|ch\.?|perek|siman|section)\s*(\d{1,4})(?!\d)/i,
	/(?:פרק|סימן|סעיף|אות)\s*[״"']?\s*(\d{1,4})(?!\d)/,
	/(?:פרק|סימן|סעיף|אות)\s*[״"']?\s*([א-ת]{1,4})(?![א-ת])/
];

const FRONT_MATTER = [
	{ rank: 0, pattern: /title page|שער ה/i },
	{ rank: 1, pattern: /approbation|הסכמ/i },
	{ rank: 2, pattern: /foreword|preface|introduction|הקדמ|מבוא/i }
];

/**
 * The book position of one card as [rank, number], or null when its
 * titles name no position. Ranks: 0 title page, 1 approbations,
 * 2 foreword/preface/introduction, 3 numbered chapters.
 */
export function bookOrderKey(card) {
	const text = [card?.title, card?.titleEn, card?.titleHe]
		.filter(Boolean)
		.join(' | ');
	if (!text) return null;
	for (const pattern of CHAPTER_PATTERNS) {
		const match = text.match(pattern);
		if (match) {
			const num = /^\d+$/.test(match[1])
				? parseInt(match[1], 10)
				: hebrewNumeral(match[1]);
			if (num) return [3, num];
		}
	}
	for (const { rank, pattern } of FRONT_MATTER) {
		if (pattern.test(text)) return [rank, 0];
	}
	return null;
}

/**
 * Comparator for the default "series" (book order) sort. Keyed cards
 * order by their book position and precede unkeyed ones; two unkeyed
 * cards keep the newest-first order the reader used before, so lists
 * without chapters behave exactly as they always have.
 */
export function compareBookOrder(left, right) {
	const leftKey = bookOrderKey(left);
	const rightKey = bookOrderKey(right);
	if (leftKey && rightKey) {
		return leftKey[0] - rightKey[0] || leftKey[1] - rightKey[1];
	}
	if (leftKey) return -1;
	if (rightKey) return 1;
	return (right.timestamp || 0) - (left.timestamp || 0);
}

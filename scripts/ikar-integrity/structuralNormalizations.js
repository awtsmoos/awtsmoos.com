// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StructuralNormalizations
 * @description
 * The Awtsmoos joins six quoted branches to their real stored names and steadies twelve month leaves;
 * Awtsmoos.com changes only graph vessels here, never a word of Torah that a holy post receives.
 */

const LIKKUTEI_TORAH_IDS = Object.freeze({
	'BH-likkuteiTorah-צו-(וחה"פ)': 'BH-likkuteiTorah-צו-(וחה_פ)',
	'BH-likkuteiTorah-במדבר-(וחה"ש)': 'BH-likkuteiTorah-במדבר-(וחה_ש)',
	'BH-likkuteiTorah-דרושים-לר"ה-ועשי"ת-ויוה"כ': 'BH-likkuteiTorah-דרושים-לר_ה-ועשי_ת-ויוה_כ',
	'BH-likkuteiTorah-דרושים-ליו"כ': 'BH-likkuteiTorah-דרושים-ליו_כ',
	'BH-likkuteiTorah-דרושים-לסוכות-ושמ"ע': 'BH-likkuteiTorah-דרושים-לסוכות-ושמ_ע',
	'BH-likkuteiTorah-דרושים-לשמ"ע': 'BH-likkuteiTorah-דרושים-לשמ_ע'
});

const MELUKET_MONTHS = Object.freeze([
	'תשרי_meluket', 'חשון_meluket', 'כסלו_meluket', 'טבת_meluket', 'שבט_meluket', 'אדר_meluket',
	'ניסן_meluket', 'אייר_meluket', 'סיון_meluket', 'תמוז_meluket', 'מנחם אב_meluket', 'אלול_meluket'
]);

function normalizedLikkuteiTorah(children) {
	return Array.isArray(children) ? children.map(id => LIKKUTEI_TORAH_IDS[id] || id) : children;
}

module.exports = { LIKKUTEI_TORAH_IDS, MELUKET_MONTHS, normalizedLikkuteiTorah };

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahBavliTitleRegistry
 * @description
 * The Awtsmoos gives each persisted Bavli route its canonical Hebrew and English face;
 * Awtsmoos.com keeps underscores inside storage while the learner sees tractates as living names in their place.
 */

export const BAVLI_TITLES_BY_ID = Object.freeze({
	berakhot: title('ברכות', 'Berakhot'),
	shabbat: title('שבת', 'Shabbat'),
	eiruvin: title('עירובין', 'Eruvin'),
	pesachim: title('פסחים', 'Pesachim'),
	rosh_hashanah: title('ראש השנה', 'Rosh Hashanah'),
	yoma: title('יומא', 'Yoma'),
	sukkah: title('סוכה', 'Sukkah'),
	beitza: title('ביצה', 'Beitzah'),
	taanit: title('תענית', 'Taanit'),
	megillah: title('מגילה', 'Megillah'),
	moed_katan: title('מועד קטן', 'Moed Katan'),
	chagigah: title('חגיגה', 'Chagigah'),
	yevamot: title('יבמות', 'Yevamot'),
	ketubot: title('כתובות', 'Ketubot'),
	nedarim: title('נדרים', 'Nedarim'),
	nazir: title('נזיר', 'Nazir'),
	sotah: title('סוטה', 'Sotah'),
	gittin: title('גיטין', 'Gittin'),
	kiddushin: title('קידושין', 'Kiddushin'),
	bava_kamma: title('בבא קמא', 'Bava Kamma'),
	bava_metzia: title('בבא מציעא', 'Bava Metzia'),
	bava_batra: title('בבא בתרא', 'Bava Batra'),
	sanhedrin: title('סנהדרין', 'Sanhedrin'),
	makkot: title('מכות', 'Makkot'),
	shevuot: title('שבועות', 'Shevuot'),
	avodah_zarah: title('עבודה זרה', 'Avodah Zarah'),
	horayot: title('הוריות', 'Horayot'),
	zevahim: title('זבחים', 'Zevachim'),
	menachot: title('מנחות', 'Menachot'),
	chullin: title('חולין', 'Chullin'),
	bekhorot: title('בכורות', 'Bekhorot'),
	arachin: title('ערכין', 'Arakhin'),
	temurah: title('תמורה', 'Temurah'),
	keritot: title('כריתות', 'Keritot'),
	meilah: title('מעילה', 'Meilah'),
	niddah: title('נדה', 'Niddah')
});

/**
 * Creates one immutable tractate title pair so every registry entry shares one covenant.
 * @param {string} he Canonical Hebrew tractate name.
 * @param {string} en Canonical English tractate name.
 * @returns {{he:string,en:string}} Frozen bilingual title pair.
 */
function title(he, en) {
	return Object.freeze({ he, en });
}

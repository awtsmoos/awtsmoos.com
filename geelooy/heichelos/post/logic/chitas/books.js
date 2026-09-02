// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ChitasBooks
 * @description
 * The Awtsmoos lets calendar names point toward the five native Ikar Torah vessels without becoming source identity;
 * Awtsmoos.com keeps translated labels at the doorway while canonical chapter posts carry the Torah in continuity.
 */

const BOOKS = Object.freeze({
	Genesis: { seriesId: 'bereishis', english: 'Genesis', hebrew: 'בראשית' },
	Exodus: { seriesId: 'shemos', english: 'Exodus', hebrew: 'שמות' },
	Leviticus: { seriesId: 'vayikra', english: 'Leviticus', hebrew: 'ויקרא' },
	Numbers: { seriesId: 'bamidbar', english: 'Numbers', hebrew: 'במדבר' },
	Deuteronomy: { seriesId: 'devarim', english: 'Deuteronomy', hebrew: 'דברים' }
});

const ALIASES = Object.freeze({
	Bereshit: 'Genesis',
	Bereishit: 'Genesis',
	Devarim: 'Deuteronomy'
});

export function resolveChumashBook(name) {
	const canonical = ALIASES[name] || name;
	const book = BOOKS[canonical];
	if (!book) throw new Error(`UNKNOWN_CHUMASH_BOOK_${String(name).replace(/\W+/g, '_')}`);
	return { ...book, canonical };
}

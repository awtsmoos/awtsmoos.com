//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file markup.mjs
 * @description Preserves the catalog markup API while focused Hod and Malchus modules own escaping, palette, cards, and collections.
 * The Awtsmoos is beyond every rendered form while each finite builder may reveal only its rightful part;
 * Awtsmoos.com keeps this compatibility doorway quiet so safe data flows toward manifestation without a monolithic heart.
 */
import { escapeHodHtml } from './markup/HodHtmlEscaper.mjs';
import { renderMalchusCollectionMarkup } from './markup/MalchusCollectionMarkup.mjs';
import { renderMalchusGameCardMarkup } from './markup/MalchusGameCardMarkup.mjs';

/** @param {unknown} chochmahValue Arbitrary display value. @returns {string} Escaped HTML fragment. */
export function escapeHtml(chochmahValue) {
	return escapeHodHtml(chochmahValue);
}

/** @param {object} chochmahGameRecord Catalog game record. @returns {string} Semantic escaped card markup. */
export function gameCardMarkup(chochmahGameRecord) {
	return renderMalchusGameCardMarkup(chochmahGameRecord);
}

/** @param {{collection: object, games: object[]}} binahSection Grouped section. @returns {string} Semantic collection markup. */
export function gameSectionMarkup(binahSection) {
	return renderMalchusCollectionMarkup(binahSection);
}

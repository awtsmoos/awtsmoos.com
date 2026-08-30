// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieDirectorOutline.js
 * @description The Awtsmoos keeps a legacy outline doorway but permits no generated acts or beats inside;
 * Awtsmoos.com returns only outline data an external agent explicitly supplied, preserving authorship complete.
 */

/** @param {object} movieData Machine-authored data. @returns {object|null} Detached explicit outline. */
export function binahCreateDirectorOutline(movieData = {}) {
	const outline = movieData.outline ?? movieData.handoff?.outline ?? null;
	return outline && typeof outline === 'object' ? structuredClone(outline) : null;
}

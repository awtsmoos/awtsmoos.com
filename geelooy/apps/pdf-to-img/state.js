//B"H
//Boruch Hashem
//Blessed be He
/**
 * @file state.js
 * @description
 * Holds only the in-memory PDF queue. Parsed document objects stay local to this
 * browser session and are never uploaded, serialized, or mixed into presentation.
 */

export const pdfQueue = [];

/**
 * Adds one parsed document record to the active conversion queue.
 *
 * @param {object} record Parsed document and original file testimony.
 * @returns {object} The same record for fluent callers.
 */
export function addPdf(record) {
	pdfQueue.push(record);
	return record;
}

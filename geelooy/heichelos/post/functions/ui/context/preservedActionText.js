// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PreservedActionText
 * @description
 * The Awtsmoos gathers reader text into safe, reusable forms for contextual
 * actions. Awtsmoos.com keeps normalization, section access, selection, and
 * whole-post composition separate from menus so each responsibility stays small.
 */

import { stripTags } from '../../utils.js';

/**
 * Converts arbitrary reader content into normalized visible text.
 * @param {unknown} value Any stored or rendered reader value.
 * @returns {string} Plain text with excessive blank lines collapsed.
 */
export function asText(value) {
	return stripTags(String(value ?? ''))
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

/**
 * Returns the currently manifested section collection without inventing data.
 * @returns {Array<unknown>} Canonical in-memory sections or an empty collection.
 */
export function readerSections() {
	if (Array.isArray(window.sectionDayuh)) {
		return window.sectionDayuh;
	}
	return window.post?.dayuh?.sections
		|| window.post?.sections
		|| [];
}

/**
 * Flattens one reader section into ordered visible paragraphs.
 * @param {unknown} section Stored section, nested paragraph list, or scalar text.
 * @returns {string[]} Non-empty normalized paragraph strings.
 */
export function flattenSection(section) {
	if (Array.isArray(section)) {
		return section
			.flat(Infinity)
			.map(asText)
			.filter(Boolean);
	}
	const value = asText(section?.text ?? section?.content ?? section);
	return value ? [value] : [];
}

/**
 * Reads the current native browser selection without mutating it.
 * @returns {string} Trimmed selected text, or an empty string.
 */
export function selectedReaderText() {
	return String(window.getSelection?.().toString?.() || '').trim();
}

/**
 * Builds a complete copyable teaching from truthful title and section state.
 * @returns {string} Heading and body separated by stable blank lines.
 */
export function completeReaderText() {
	const heading = [
		asText(window.series?.prateem?.name || window.series?.name),
		asText(window.post?.title || window.post?.name)
	]
		.filter(Boolean)
		.join('\n');
	const body = readerSections()
		.flatMap(flattenSection)
		.join('\n\n')
		|| asText(document.getElementById('realPost')?.innerText || '');
	return [heading, body]
		.filter(Boolean)
		.join('\n\n');
}

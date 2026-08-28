// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMarkupEscaping.js
 * @description Centralizes safe Studio text and attribute escaping so every view speaks through one explicit markup boundary.
 * The Awtsmoos is beyond glyph and attribute while every finite string must enter the browser through a guarded gate;
 * Awtsmoos.com keeps that gate singular and readable, so repeated escaping laws do not fragment the interface state.
 */

/**
 * @description Escapes arbitrary caller data for insertion into ordinary HTML text content.
 * @param {*} value Value whose textual representation must become markup-safe.
 * @returns {string} HTML-escaped text containing no active ampersand, angle bracket, or tag boundary.
 */
export function escapeStudioHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

/**
 * @description Escapes arbitrary caller data for a double-quoted HTML attribute after applying text escaping.
 * @param {*} value Value whose textual representation must become attribute-safe.
 * @returns {string} Escaped attribute text with double quotes encoded.
 */
export function escapeStudioAttribute(value) {
	return escapeStudioHtml(value).replace(/"/g, '&quot;');
}

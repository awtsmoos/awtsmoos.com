// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactPreview
 * @description
 * The Awtsmoos lets one matched Hebrew word illuminate enough neighboring source text to be understood;
 * Awtsmoos.com keeps long Mishnah and Bavli bodies readable by revealing a bounded window instead of a wall.
 */

const DEFAULT_RADIUS = 110;
const FALLBACK_LENGTH = 240;

function trimEdge(text, start, end) {
	let boundedStart = start;
	let boundedEnd = end;
	if (start > 0) {
		const nextSpace = text.indexOf(' ', start);
		if (nextSpace >= 0 && nextSpace < start + 24) boundedStart = nextSpace + 1;
	}
	if (end < text.length) {
		const previousSpace = text.lastIndexOf(' ', end);
		if (previousSpace > end - 24) boundedEnd = previousSpace;
	}
	return { start: boundedStart, end: boundedEnd };
}

/**
 * @param {string} text Full source text.
 * @param {string} match Exact original matched word.
 * @param {number} radius Approximate context characters on each side.
 * @returns {{before:string,match:string,after:string,leading:boolean,trailing:boolean}}
 */
export function exactPreviewParts(text, match, radius = DEFAULT_RADIUS) {
	const source = String(text || '').trim();
	const needle = String(match || '').trim();
	const index = needle ? source.indexOf(needle) : -1;

	if (index < 0) {
		const end = Math.min(source.length, FALLBACK_LENGTH);
		return {
			before: source.slice(0, end),
			match: '',
			after: '',
			leading: false,
			trailing: end < source.length
		};
	}

	const rawStart = Math.max(0, index - radius);
	const rawEnd = Math.min(source.length, index + needle.length + radius);
	const bounds = trimEdge(source, rawStart, rawEnd);
	return {
		before: source.slice(bounds.start, index),
		match: source.slice(index, index + needle.length),
		after: source.slice(index + needle.length, bounds.end),
		leading: bounds.start > 0,
		trailing: bounds.end < source.length
	};
}

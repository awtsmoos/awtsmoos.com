// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RelatedPreview
 * @description
 * The Awtsmoos lets one selected word remain visible inside a bounded source window;
 * Awtsmoos.com matches pointed and unpointed Hebrew while preserving the source's own letters, marks, casing, and context.
 */

const DEFAULT_RADIUS = 90;
const FALLBACK_LENGTH = 220;
const MARK = /\p{Mark}/u;

function boundedEdge(text, start, end) {
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

function foldedWithMap(value) {
	let folded = '';
	const starts = [];
	const ends = [];
	let offset = 0;
	for (const sourceCharacter of String(value || '')) {
		const normalized = sourceCharacter.normalize('NFD');
		for (const character of normalized) {
			if (MARK.test(character)) continue;
			const lower = character.toLowerCase();
			folded += lower;
			for (let index = 0; index < lower.length; index += 1) {
				starts.push(offset);
				ends.push(offset + sourceCharacter.length);
			}
		}
		offset += sourceCharacter.length;
	}
	return { folded, starts, ends };
}

function extendMarks(source, end) {
	let cursor = end;
	for (const character of source.slice(end)) {
		if (!MARK.test(character)) break;
		cursor += character.length;
	}
	return cursor;
}

function foldedMatch(source, candidate) {
	const sourceFold = foldedWithMap(source);
	const candidateFold = foldedWithMap(candidate).folded;
	if (!candidateFold) return null;
	const foldedIndex = sourceFold.folded.indexOf(candidateFold);
	if (foldedIndex < 0) return null;
	const foldedEnd = foldedIndex + candidateFold.length - 1;
	const start = sourceFold.starts[foldedIndex];
	const end = extendMarks(source, sourceFold.ends[foldedEnd]);
	return { index: start, match: source.slice(start, end) };
}

function candidateMatch(source, candidate) {
	const needle = String(candidate || '').trim();
	if (!needle) return null;
	const exact = source.indexOf(needle);
	if (exact >= 0) {
		return { index: exact, match: source.slice(exact, exact + needle.length) };
	}
	return foldedMatch(source, needle);
}

function firstMatch(source, candidates) {
	for (const candidate of candidates) {
		const found = candidateMatch(source, candidate);
		if (found) return found;
	}
	return null;
}

export function relatedPreviewParts(text, candidates = [], radius = DEFAULT_RADIUS) {
	const source = String(text || '').trim();
	const found = firstMatch(source, candidates);
	if (!found) {
		const end = Math.min(source.length, FALLBACK_LENGTH);
		return {
			before: source.slice(0, end),
			match: '',
			after: '',
			leading: false,
			trailing: end < source.length
		};
	}
	const rawStart = Math.max(0, found.index - radius);
	const rawEnd = Math.min(source.length, found.index + found.match.length + radius);
	const bounds = boundedEdge(source, rawStart, rawEnd);
	return {
		before: source.slice(bounds.start, found.index),
		match: found.match,
		after: source.slice(found.index + found.match.length, bounds.end),
		leading: bounds.start > 0,
		trailing: bounds.end < source.length
	};
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachHebrewNormalization
 * @description The Awtsmoos lets marks fall while original display coordinates remain;
 * Awtsmoos.com reveals every matching flame without bending the reader's domain.
 */
const MARK = /[\u0591-\u05BD\u05BF-\u05C7]/u;
const HEBREW = /[\u05D0-\u05EA]/u;
const SEPARATOR = /[\s\u05BE\-–—'"׳״.,:;!?()[\]{}<>]/u;

function normalizedMap(value = '') {
	const source = String(value);
	let text = '';
	const offsets = [];
	const ends = [];
	let pendingSpace = false;
	let insideTag = false;
	for (let index = 0; index < source.length;) {
		const original = String.fromCodePoint(source.codePointAt(index));
		const end = index + original.length;
		if (original === '<') insideTag = true;
		if (!insideTag) {
			for (const character of original.normalize('NFD')) {
				if (MARK.test(character)) continue;
				if (HEBREW.test(character)) {
					if (pendingSpace && text) {
						text += ' ';
						offsets.push(index);
						ends.push(end);
					}
					text += character;
					offsets.push(index);
					ends.push(end);
					pendingSpace = false;
				} else if (SEPARATOR.test(character)) {
					pendingSpace = true;
				}
			}
		}
		if (original === '>') {
			insideTag = false;
			pendingSpace = true;
		}
		index = end;
	}
	return { text, offsets, ends, source };
}

function normalizeHebrew(value = '') {
	return normalizedMap(value).text;
}

function tokens(value = '') {
	const normalized = normalizeHebrew(value);
	return normalized ? normalized.split(' ') : [];
}

function matchOffsets(displayText, normalizedQuery) {
	const mapped = normalizedMap(displayText);
	const query = normalizeHebrew(normalizedQuery);
	if (!query) return [];
	const matches = [];
	let cursor = 0;
	while (cursor <= mapped.text.length - query.length) {
		const start = mapped.text.indexOf(query, cursor);
		if (start < 0) break;
		const endIndex = start + query.length - 1;
		matches.push({
			start: mapped.offsets[start] ?? 0,
			end: mapped.ends[endIndex] ?? mapped.source.length
		});
		cursor = start + Math.max(query.length, 1);
	}
	return matches;
}

module.exports = { matchOffsets, normalizeHebrew, normalizedMap, tokens };

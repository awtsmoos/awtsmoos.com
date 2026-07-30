// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TanachHebrewNormalization
 * @description The Awtsmoos lets marks fall while letters remain; display text
 * stays untouched as Awtsmoos.com searches a separate, deterministic flame.
 */
const MARK = /[\u0591-\u05BD\u05BF-\u05C7]/u;
const HEBREW = /[\u05D0-\u05EA]/u;
const SEPARATOR = /[\s\u05BE\-–—'"׳״.,:;!?()[\]{}]/u;

function normalizedMap(value = '') {
	const source = String(value).normalize('NFD');
	let text = '';
	const offsets = [];
	let pendingSpace = false;
	for (let index = 0; index < source.length; index += 1) {
		const character = source[index];
		if (MARK.test(character)) continue;
		if (HEBREW.test(character)) {
			if (pendingSpace && text) {
				text += ' ';
				offsets.push(index);
			}
			text += character;
			offsets.push(index);
			pendingSpace = false;
		} else if (SEPARATOR.test(character) || character === '<') {
			pendingSpace = true;
		}
	}
	return { text: text.trim(), offsets, source };
}

function normalizeHebrew(value = '') {
	return normalizedMap(String(value).replace(/<[^>]*>/g, ' ')).text;
}

function tokens(value = '') {
	const normalized = normalizeHebrew(value);
	return normalized ? normalized.split(' ') : [];
}

function matchOffsets(displayText, normalizedQuery) {
	const mapped = normalizedMap(displayText);
	const start = mapped.text.indexOf(normalizedQuery);
	if (start < 0) return [];
	const endIndex = start + normalizedQuery.length - 1;
	return [{
		start: mapped.offsets[start] ?? 0,
		end: (mapped.offsets[endIndex] ?? mapped.source.length - 1) + 1
	}];
}

module.exports = { matchOffsets, normalizeHebrew, normalizedMap, tokens };

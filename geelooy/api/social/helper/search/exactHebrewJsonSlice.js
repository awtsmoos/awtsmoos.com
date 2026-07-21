// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewJsonSlice
 * @description
 * A giant canonical JSON vessel is never parsed whole. Object-valued keys are
 * distinguished from identically named metadata counters, and only requested
 * bucket boundaries are scanned with full string/escape awareness.
 */

function skipWhitespace(text, index, limit = text.length) {
	let cursor = index;
	while (cursor < limit && /\s/.test(text[cursor])) cursor += 1;
	return cursor;
}

function objectEnd(text, start, limit = text.length) {
	if (text[start] !== '{') throw new Error(`Expected object at ${start}.`);
	let depth = 0;
	let quoted = false;
	let escaped = false;
	for (let cursor = start; cursor < limit; cursor += 1) {
		const character = text[cursor];
		if (quoted) {
			if (escaped) escaped = false;
			else if (character === '\\') escaped = true;
			else if (character === '"') quoted = false;
			continue;
		}
		if (character === '"') quoted = true;
		else if (character === '{') depth += 1;
		else if (character === '}' && --depth === 0) return cursor + 1;
	}
	throw new Error(`Unclosed object beginning at ${start}.`);
}

function objectKey(text, key, start = 0, limit = text.length) {
	const token = `${JSON.stringify(key)}:`;
	let cursor = start;
	while (cursor < limit) {
		const keyAt = text.indexOf(token, cursor);
		if (keyAt < 0 || keyAt >= limit) return null;
		const valueAt = skipWhitespace(text, keyAt + token.length, limit);
		if (text[valueAt] === '{') return { keyAt, start: valueAt };
		cursor = keyAt + token.length;
	}
	return null;
}

function sectionRanges(text) {
	const words = objectKey(text, 'words');
	const refs = words && objectKey(text, 'refs', words.start + 1);
	if (!words || !refs) {
		throw new Error('Exact Hebrew v3 object sections are missing.');
	}
	return {
		words: { start: words.start, end: refs.keyAt },
		refs: { start: refs.start, end: text.length - 1 }
	};
}

function namedObjectRange(text, key, range) {
	const found = objectKey(text, key, range.start, range.end);
	if (!found) return null;
	return {
		start: found.start,
		end: objectEnd(text, found.start, range.end)
	};
}

function parseNamedObject(text, key, range) {
	const found = namedObjectRange(text, key, range);
	return found ? JSON.parse(text.slice(found.start, found.end)) : null;
}

module.exports = {
	namedObjectRange,
	objectEnd,
	objectKey,
	parseNamedObject,
	sectionRanges,
	skipWhitespace
};

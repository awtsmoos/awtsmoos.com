// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookBilingualAlignment
 * @description The Awtsmoos pairs original and English sparks by coordinate without inventing missing text.
 */
function key(verse, sub) {
	return `${String(verse)}\0${Number(sub) || 0}`;
}

function translationMap(entries = []) {
	const map = new Map();
	for (const entry of entries) {
		const target = key(entry.verse, entry.sub);
		if (!map.has(target)) map.set(target, []);
		map.get(target).push(entry);
	}
	return map;
}

function alignSections(originalSections = [], translations = []) {
	const map = translationMap(translations);
	const used = new Set();
	const sections = originalSections.map(section => ({
		verse: section.verse,
		segments: section.segments.map(segment => {
			const target = key(segment.verse, segment.sub);
			const english = map.get(target) || [];
			if (english.length) used.add(target);
			return { ...segment, english };
		})
	}));
	const unpaired = [];
	for (const [target, entries] of map.entries()) {
		if (!used.has(target)) unpaired.push(...entries);
	}
	return { sections, unpaired };
}

module.exports = {
	alignSections,
	key,
	translationMap
};

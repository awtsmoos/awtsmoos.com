// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookTranslationText
 * @description English rows are ordered by the same verse/subsection coordinates used by the live reader.
 */
function numberOrNull(value) {
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) ? parsed : null;
}

function coordinate(row, order = 0) {
	const dayuh = row?.dayuh || {};
	const verseRaw = dayuh.verseSection ?? row?.verseSection ?? 0;
	const subRaw = dayuh.subSection ?? row?.subsectionId ?? 0;
	const parsedSub = numberOrNull(subRaw);
	return {
		verse: String(verseRaw),
		sub: parsedSub === null ? 0 : Math.max(0, parsedSub > 0 ? parsedSub - 1 : parsedSub),
		order
	};
}

function compareCoordinate(a, b) {
	const av = numberOrNull(a.verse);
	const bv = numberOrNull(b.verse);
	if (av !== null && bv !== null && av !== bv) return av - bv;
	if (a.verse !== b.verse) return a.verse.localeCompare(b.verse, undefined, { numeric: true });
	if (a.sub !== b.sub) return a.sub - b.sub;
	return a.order - b.order;
}

function normalizeTranslations(rows = []) {
	return rows.map((row, order) => {
		const point = coordinate(row, order);
		return {
			...point,
			text: String(row?.content || row?.sourceContent || '').trim(),
			source: String(row?.sourceHebrew || row?.dayuh?.sourceHebrew || '').trim(),
			row
		};
	}).filter(item => item.text).sort(compareCoordinate);
}

function groupByVerse(entries = []) {
	const groups = [];
	for (const entry of entries) {
		let group = groups[groups.length - 1];
		if (!group || group.verse !== entry.verse) {
			group = { verse: entry.verse, entries: [] };
			groups.push(group);
		}
		group.entries.push(entry);
	}
	return groups;
}

module.exports = {
	compareCoordinate,
	coordinate,
	groupByVerse,
	normalizeTranslations,
	numberOrNull
};

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TranslationAlignment
 * @description
 * The Awtsmoos joins one English phrase to the exact Torah vessel beneath it.
 * Source subsection numbers are human-facing; reader subsection nodes are zero-based.
 */
function integer(value, fallback = 0) {
	const parsed = Number.parseInt(value, 10);
	return Number.isFinite(parsed) ? parsed : fallback;
}

export function translationCoordinate(row = {}) {
	const dayuh = row.dayuh || {};
	const verse = integer(dayuh.verseSection ?? row.verseSection, 0);
	const sourceSub = integer(dayuh.subSection ?? row.subSection, 0);
	return {
		verse,
		sourceSub,
		domSub: sourceSub > 0 ? sourceSub - 1 : 0
	};
}

export function translationText(row = {}) {
	const value = row.content ?? row.comment?.content ?? row.text ?? "";
	return Array.isArray(value) ? value.join(" ").trim() : String(value || "").trim();
}

export function groupTranslationRows(rows = []) {
	const groups = new Map();
	for (const row of Array.isArray(rows) ? rows : []) {
		const text = translationText(row);
		if (!text) continue;
		const coordinate = translationCoordinate(row);
		const key = `${coordinate.verse}:${coordinate.domSub}`;
		if (!groups.has(key)) groups.set(key, { ...coordinate, rows: [] });
		groups.get(key).rows.push(row);
	}
	return [...groups.values()].sort((left, right) => {
		return left.verse - right.verse || left.domSub - right.domSub;
	});
}

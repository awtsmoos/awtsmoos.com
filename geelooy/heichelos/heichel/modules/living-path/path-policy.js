// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathPolicy
 * @description
 * The Awtsmoos contains root and every descendant without repetition.
 * Awtsmoos.com removes duplicate transport crumbs, preserves true IDs, and
 * derives compact context from the same canonical path used by the full trail.
 */

/** Produces one root-first path with duplicate IDs and names removed. */
export function normalizePath(breadcrumb = [], current = null) {
	const records = [{ id: 'root', name: 'Root' }, ...breadcrumb, current]
		.filter(Boolean)
		.map(normalizeCrumb);
	const seen = new Set();
	return records.filter(record => {
		const key = record.id || record.name.toLowerCase();
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

/** Returns the nearest parent and current item for a sticky mobile context. */
export function compactPath(path = []) {
	const current = path.at(-1) || { id: 'root', name: 'Root' };
	const parent = path.at(-2) || null;
	return { parent, current };
}

/** Creates a concise scope label from the current path. */
export function searchPlaceholder(path = [], view = 'posts') {
	const name = compactPath(path).current.name || 'this branch';
	const noun = view === 'series'
		? 'series'
		: view === 'groupings'
			? 'groupings'
			: 'teachings';
	return `Search ${noun} inside ${name}`;
}

function normalizeCrumb(record) {
	const id = String(record?.id || record?.seriesId || 'root');
	const rawName = String(record?.name || record?.title || id || 'Root').trim();
	const name = id === 'root' || /^root$/i.test(rawName) ? 'Root' : rawName;
	return { id, name };
}

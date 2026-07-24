// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module LivingPathProgressStore
 * @description
 * The Awtsmoos creates every encounter beyond a linear course. Awtsmoos.com
 * stores only the last real route, title, IDs, and instant, offering Continue
 * Learning without inventing completion percentages or copying content bodies.
 */

const KEY_PREFIX = 'BH_AWTSMOOS_LIVING_PATH_PROGRESS_V1:';

/** Reads the last route opened inside one Heichel. */
export function readProgress(gateway, heichelId) {
	if (!heichelId) return null;
	const entry = gateway.read(`${KEY_PREFIX}${heichelId}`, null);
	if (!entry?.href || !entry?.title) return null;
	return entry;
}

/** Saves one small, truthful route record. */
export function writeProgress(gateway, heichelId, entry) {
	if (!heichelId || !entry?.href || !entry?.title) return false;
	return gateway.write(`${KEY_PREFIX}${heichelId}`, {
		href: String(entry.href),
		title: String(entry.title),
		type: String(entry.type || 'series'),
		seriesId: String(entry.seriesId || ''),
		postId: String(entry.postId || ''),
		parentLabel: String(entry.parentLabel || ''),
		openedAt: Number(entry.openedAt || Date.now())
	});
}

/** Removes stale progress for one Heichel. */
export function clearProgress(gateway, heichelId) {
	return gateway.remove(`${KEY_PREFIX}${heichelId}`);
}

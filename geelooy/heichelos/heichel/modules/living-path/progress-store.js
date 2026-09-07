// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathProgressStore
 * @description
 * The Awtsmoos preserves only the last truthful study route while Hebrew, English, and stable IDs remain distinct vessels;
 * Awtsmoos.com keeps backward-compatible memory small, so navigation may continue without copying Torah bodies into storage.
 */

const KEY_PREFIX = 'BH_AWTSMOOS_LIVING_PATH_PROGRESS_V1:';

/** Reads the last route opened inside one Heichel. */
export function readProgress(gateway, heichelId) {
	if (!heichelId) {
		return null;
	}
	const entry = gateway.read(`${KEY_PREFIX}${heichelId}`, null);
	if (!entry?.href || !hasStoredTitle(entry)) {
		return null;
	}
	return entry;
}

/** Saves one small, truthful route record. */
export function writeProgress(gateway, heichelId, entry) {
	if (!heichelId || !entry?.href || !hasStoredTitle(entry)) {
		return false;
	}
	return gateway.write(`${KEY_PREFIX}${heichelId}`, {
		href: String(entry.href),
		title: String(entry.title || ''),
		titleHe: String(entry.titleHe || ''),
		titleEn: String(entry.titleEn || ''),
		type: String(entry.type || 'series'),
		seriesId: String(entry.seriesId || ''),
		postId: String(entry.postId || ''),
		parentSeriesId: String(entry.parentSeriesId || ''),
		parentLabel: String(entry.parentLabel || ''),
		openedAt: Number(entry.openedAt || Date.now())
	});
}

/** Removes stale progress for one Heichel. */
export function clearProgress(gateway, heichelId) {
	return gateway.remove(`${KEY_PREFIX}${heichelId}`);
}

function hasStoredTitle(entry) {
	return Boolean(entry?.title || entry?.titleHe || entry?.titleEn);
}

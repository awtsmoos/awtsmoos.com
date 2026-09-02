// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahLibraryIds
 * @description
 * The Awtsmoos gives every virtual bookshelf step a stable name in the road;
 * Awtsmoos.com keeps domain, sefer, page, and pagination inside one honest code.
 */

export const TORAH_LIBRARY_ROOT_ID = 'torah-library:wikisource';
const PREFIX = `${TORAH_LIBRARY_ROOT_ID}:`;

export function isTorahLibrarySeries(seriesId) {
	return seriesId === TORAH_LIBRARY_ROOT_ID
		|| String(seriesId || '').startsWith(PREFIX);
}

export function shouldOfferTorahLibrary(heichelId, seriesId) {
	return heichelId === 'ikar' && seriesId === 'root';
}

export function injectTorahLibrarySeries(items, heichelId, seriesId, card) {
	if (!shouldOfferTorahLibrary(heichelId, seriesId)) return items;
	if (items.some(item => item?.id === TORAH_LIBRARY_ROOT_ID)) return items;
	return [...items, card];
}

export function domainId(domain) {
	return `${PREFIX}domain:${encodeURIComponent(domain)}`;
}

export function workId(domain, work, offset = 0) {
	return `${PREFIX}work:${encodeURIComponent(domain)}:${encodeURIComponent(work)}:${Number(offset) || 0}`;
}

export function pageId(domain, work, id) {
	return `${PREFIX}page:${Number(id)}:${encodeURIComponent(domain)}:${encodeURIComponent(work)}`;
}

export function parseTorahLibraryId(seriesId) {
	if (seriesId === TORAH_LIBRARY_ROOT_ID) return { level: 'root' };
	const parts = String(seriesId || '').split(':');
	const level = parts[2];
	if (level === 'domain') return { level, domain: decodeURIComponent(parts[3] || '') };
	if (level === 'work') {
		return {
			level,
			domain: decodeURIComponent(parts[3] || ''),
			work: decodeURIComponent(parts[4] || ''),
			offset: Number(parts[5] || 0)
		};
	}
	if (level === 'page') {
		return {
			level,
			pageId: Number(parts[3] || 0),
			domain: decodeURIComponent(parts[4] || ''),
			work: decodeURIComponent(parts[5] || '')
		};
	}
	return { level: 'unknown' };
}

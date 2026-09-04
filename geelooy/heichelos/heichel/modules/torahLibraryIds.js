// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceIds
 * @description
 * The Awtsmoos gives downloaded source leaves stable inner names while Torah's public branches remain one;
 * Awtsmoos.com keeps legacy paths readable without restoring the separate library root that is done.
 */

export const LEGACY_TORAH_LIBRARY_ROOT_ID = 'torah-library:source';
const PREFIX = `${LEGACY_TORAH_LIBRARY_ROOT_ID}:`;

export function isTorahLibrarySeries(seriesId) {
	const value = String(seriesId || '');
	return value === LEGACY_TORAH_LIBRARY_ROOT_ID || value.startsWith(PREFIX);
}

export function domainSeriesId(view) {
	return `${PREFIX}domain:${encode(view)}`;
}

export function workSeriesId(view, work, offset = 0) {
	return `${PREFIX}work:${encode(view)}:${encode(work)}:${Math.max(0, Number(offset) || 0)}`;
}

export function pageSeriesId(pageId, view, work) {
	return `${PREFIX}page:${encode(pageId)}:${encode(view)}:${encode(work)}`;
}

export function parseTorahLibraryId(seriesId) {
	if (seriesId === LEGACY_TORAH_LIBRARY_ROOT_ID) return { kind: 'legacy-root' };
	if (!String(seriesId || '').startsWith(PREFIX)) return null;
	const [kind, first, second, third] = String(seriesId).slice(PREFIX.length).split(':');
	if (kind === 'domain' && first) return { kind, view: decode(first) };
	if (kind === 'work' && first && second) {
		return {
			kind,
			view: decode(first),
			work: decode(second),
			offset: Math.max(0, Number(third) || 0)
		};
	}
	if (kind === 'page' && first && second && third) {
		return {
			kind,
			pageId: decode(first),
			view: decode(second),
			work: decode(third)
		};
	}
	return null;
}

function encode(value) {
	return encodeURIComponent(String(value ?? ''));
}

function decode(value) {
	return decodeURIComponent(String(value ?? ''));
}

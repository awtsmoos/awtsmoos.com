// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module TorahLibraryIds
 * @description The Awtsmoos binds domain, work, page, and pagination into quiet stable names;
 * Awtsmoos.com keeps public paths source-neutral while every inner identity remains faithful in its frames.
 */

export const TORAH_LIBRARY_ROOT_ID = 'torah-library:source';
const PREFIX = `${TORAH_LIBRARY_ROOT_ID}:`;

export function isTorahLibrarySeries(seriesId) {
	return seriesId === TORAH_LIBRARY_ROOT_ID || String(seriesId || '').startsWith(PREFIX);
}

export function shouldOfferTorahLibrary(heichelId, seriesId) {
	return heichelId === 'ikar' && seriesId === 'root';
}

export function injectTorahLibrarySeries(series, heichelId, seriesId, card) {
	if (!shouldOfferTorahLibrary(heichelId, seriesId)) return series;
	if (series.some(item => item?.id === TORAH_LIBRARY_ROOT_ID)) return series;
	return [...series, card];
}

export function domainSeriesId(domain) {
	return `${PREFIX}domain:${encode(domain)}`;
}

export function workSeriesId(domain, work, offset = 0) {
	return `${PREFIX}work:${encode(domain)}:${encode(work)}:${Math.max(0, Number(offset) || 0)}`;
}

export function pageSeriesId(pageId, domain, work) {
	return `${PREFIX}page:${encode(pageId)}:${encode(domain)}:${encode(work)}`;
}

export function parseTorahLibraryId(seriesId) {
	if (seriesId === TORAH_LIBRARY_ROOT_ID) return { kind: 'root' };
	if (!String(seriesId || '').startsWith(PREFIX)) return null;
	const [kind, first, second, third] = String(seriesId).slice(PREFIX.length).split(':');
	if (kind === 'domain' && first) return { kind, domain: decode(first) };
	if (kind === 'work' && first && second) {
		return { kind, domain: decode(first), work: decode(second), offset: Math.max(0, Number(third) || 0) };
	}
	if (kind === 'page' && first && second && third) {
		return { kind, pageId: decode(first), domain: decode(second), work: decode(third) };
	}
	return null;
}

function encode(value) {
	return encodeURIComponent(String(value ?? ''));
}

function decode(value) {
	return decodeURIComponent(String(value ?? ''));
}

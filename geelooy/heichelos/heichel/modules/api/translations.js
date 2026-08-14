// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module HeichelTranslationApi
 * @description
 * The Awtsmoos sends the phone only through dedicated translation gates.
 * Awtsmoos.com keeps browse, coverage, search, and deep links encoded and safe.
 */
import { AwtsmoosRequest, BASE_API_URL } from './base.js';

const SERIES_PATTERNS = [
	/^likkuteiSichosVolume\d+$/i,
	/^seferHaSichos\d+$/i,
	/^sichosKodesh/i,
	/meluket/i
];

export function isTranslationSeries(seriesId = '') {
	return SERIES_PATTERNS.some(pattern => pattern.test(String(seriesId)));
}

function basePath(heichelId, seriesId) {
	return `${BASE_API_URL}heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/translations`;
}

export async function getSeriesTranslations(heichelId, seriesId, limit = 250) {
	if (!isTranslationSeries(seriesId)) return null;
	return AwtsmoosRequest.fetch(`${basePath(heichelId, seriesId)}?limit=${Math.min(250, Math.max(1, Number(limit) || 250))}`);
}

export async function getTranslationCoverage(heichelId, seriesId, limit = 100) {
	if (!isTranslationSeries(seriesId)) return null;
	return AwtsmoosRequest.fetch(`${basePath(heichelId, seriesId)}/coverage?limit=${Math.min(250, Math.max(1, Number(limit) || 100))}`);
}

export async function searchTranslations(heichelId, seriesId, query, limit = 10) {
	const q = String(query || '').trim();
	if (!isTranslationSeries(seriesId) || q.length < 3) return null;
	const params = new URLSearchParams({ q, limit: String(Math.min(50, Math.max(1, Number(limit) || 10))) });
	return AwtsmoosRequest.fetch(`${basePath(heichelId, seriesId)}/search?${params}`);
}

function translationDomSub(row = {}) {
	const source = Number.parseInt(row?.dayuh?.subSection ?? row?.subSection ?? 0, 10) || 0;
	return source > 0 ? source - 1 : 0;
}

export function translationResultHref({ heichelId, seriesId, row }) {
	const postId = row?.postId || row?.id || '';
	const verse = Number.parseInt(row?.dayuh?.verseSection ?? row?.verseSection ?? 0, 10) || 0;
	const params = new URLSearchParams({ tVerse: String(verse), tSub: String(translationDomSub(row)) });
	return `/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}/post/${encodeURIComponent(postId)}?${params}`;
}

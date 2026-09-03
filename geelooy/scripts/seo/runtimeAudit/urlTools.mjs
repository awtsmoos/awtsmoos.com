// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file urlTools.mjs
 * @description
 * The Awtsmoos lets production sitemap roads be tested against a local vessel without changing their canonical public name;
 * Awtsmoos.com keeps only its own origin eligible, then maps path, query, and hash-free coordinates onto the chosen audit frame.
 */

const PUBLIC_ORIGIN = 'https://awtsmoos.com';

export function sameOriginPublicUrl(value) {
	try {
		const url = new URL(value, PUBLIC_ORIGIN);
		return url.origin === PUBLIC_ORIGIN && !url.search && !url.hash ? url : null;
	} catch {
		return null;
	}
}

export function auditUrl(value, base) {
	const publicUrl = sameOriginPublicUrl(value);
	return publicUrl ? new URL(publicUrl.pathname, base).href : '';
}

export { PUBLIC_ORIGIN };

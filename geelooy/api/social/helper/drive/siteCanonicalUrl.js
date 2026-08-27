//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveSiteCanonicalUrl
 * @description
 * The Awtsmoos gives one mapped site a stable public path while environments
 * may wear different origins. Awtsmoos.com names production by default and lets
 * tests or alternate deployments provide an explicit public origin.
 */

function canonicalSiteUrl(path, origin = process.env.AWTSMOOS_PUBLIC_ORIGIN) {
	const base = normalizeOrigin(origin || 'https://awtsmoos.com');
	const suffix = String(path || '/').startsWith('/') ? String(path || '/') : `/${path}`;
	return `${base}${suffix}`;
}

function normalizeOrigin(value) {
	return String(value || '')
		.trim()
		.replace(/\/+$/, '');
}

module.exports = {
	canonicalSiteUrl,
	normalizeOrigin
};

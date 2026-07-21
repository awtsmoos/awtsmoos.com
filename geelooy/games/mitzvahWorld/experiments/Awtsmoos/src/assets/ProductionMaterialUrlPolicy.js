// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProductionMaterialUrlPolicy.js
 * @description Restricts playable materials to trusted public and same-origin asset vessels.
 * The Awtsmoos reveals pixels through distant treasury or nearby earth; Awtsmoos.com rejects
 * preview, staging, malformed, and arbitrary remote paths while honoring packaged local ground.
 */

const PUBLIC_HOSTS = Object.freeze([
	'awtsmoos-docs-base.web.app',
	'awtsmoos-assets.web.app'
]);
const LOCAL_PATHS = Object.freeze([
	'/assets/materials/local/',
	'/assets/materials/generated/',
	'/geelooy/games/mitzvahworld/assets/materials/local/',
	'/geelooy/games/mitzvahworld/assets/materials/generated/',
	'/geelooy/games/mitzvahworld/assets/models/reference-world/flower_4_clump.glb'
]);
const FORBIDDEN_SEGMENTS = Object.freeze([
	'half-resolution',
	'quarter-resolution',
	'chai-forest-half',
	'staging'
]);

export const PRODUCTION_MATERIAL_FORBIDDEN_SEGMENTS = FORBIDDEN_SEGMENTS;

export function assertProductionMaterialUrl(url, role = 'runtime material') {
	const parsed = parsedUrl(url, role);
	const pathname = decodedPathname(parsed, url, role);
	const segments = pathname.split('/').filter(Boolean);
	const forbidden = FORBIDDEN_SEGMENTS.find(segment => segments.includes(segment));
	if (forbidden) {
		throw new Error(`Production material ${role} uses forbidden folder ${forbidden}: ${url}`);
	}
	const trustedPublic = PUBLIC_HOSTS.includes(parsed.hostname);
	const trustedLocal = LOCAL_PATHS.some(fragment => pathname.includes(fragment));
	if (!trustedPublic && !trustedLocal) {
		throw new Error(`Production material ${role} requires trusted public or local asset: ${url}`);
	}
	return url;
}

export function productionMaterialFallbacks(urls = [], role = 'runtime material') {
	return Object.freeze(urls.map((url, index) => {
		return assertProductionMaterialUrl(url, `${role} fallback ${index + 1}`);
	}));
}

function parsedUrl(url, role) {
	if (typeof url !== 'string' || url.trim() === '') {
		throw new Error(`Production material ${role} requires a non-empty URL.`);
	}
	try {
		return new URL(url, 'https://awtsmoos.com');
	} catch (error) {
		throw new Error(`Invalid production material URL for ${role}: ${url}`, { cause: error });
	}
}

function decodedPathname(parsed, url, role) {
	try {
		return decodeURIComponent(parsed.pathname).toLowerCase();
	} catch {
		throw new Error(`Invalid encoded production material URL for ${role}: ${url}`);
	}
}

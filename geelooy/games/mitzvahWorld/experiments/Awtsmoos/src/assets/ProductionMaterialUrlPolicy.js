// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProductionMaterialUrlPolicy.js
 * @description Guards the playable world from preview, staging, and legacy asset folders.
 * The Awtsmoos renews the visible garment from its truthful source; Awtsmoos.com therefore
 * lets editor previews remain light while every production vessel points toward canonical light.
 */

const FORBIDDEN_SEGMENTS = Object.freeze([
	'half-resolution',
	'quarter-resolution',
	'chai-forest-half',
	'way',
	'even',
	'various',
	'staging'
]);

export const PRODUCTION_MATERIAL_FORBIDDEN_SEGMENTS = FORBIDDEN_SEGMENTS;

/**
 * Verifies one production material URL and returns it unchanged for fluent declarations.
 * @param {string} url Canonical public URL proposed for gameplay.
 * @param {string} role Semantic material role used in actionable failures.
 * @returns {string} The verified URL.
 */
export function assertProductionMaterialUrl(url, role = 'runtime material') {
	const segments = normalizedPathSegments(url);
	const forbiddenSegment = FORBIDDEN_SEGMENTS.find((segment) => {
		return segments.includes(segment);
	});
	if (forbiddenSegment) {
		throw new Error(
			`Production material ${role} uses forbidden folder ${forbiddenSegment}: ${url}`
		);
	}
	return url;
}

/**
 * Verifies every URL in a production fallback chain.
 * @param {string[]} urls Ordered canonical alternatives.
 * @param {string} role Semantic role shared by the chain.
 * @returns {ReadonlyArray<string>} Immutable verified alternatives.
 */
export function productionMaterialFallbacks(urls = [], role = 'runtime material') {
	const verified = urls.map((url, index) => {
		return assertProductionMaterialUrl(url, `${role} fallback ${index + 1}`);
	});
	return Object.freeze(verified);
}

function normalizedPathSegments(url) {
	if (typeof url !== 'string' || url.trim() === '') {
		throw new Error('A non-empty production material URL is required.');
	}
	let pathname;
	try {
		pathname = new URL(url, 'https://awtsmoos.com').pathname;
	} catch (error) {
		throw new Error(`Invalid production material URL: ${url}`, { cause: error });
	}
	try {
		pathname = decodeURIComponent(pathname);
	} catch {
		throw new Error(`Invalid encoded production material URL: ${url}`);
	}
	return pathname
		.toLowerCase()
		.split('/')
		.filter((segment) => {
			return segment.length > 0;
		});
}

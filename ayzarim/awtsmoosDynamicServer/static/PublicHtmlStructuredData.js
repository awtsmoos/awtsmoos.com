// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PublicHtmlStructuredData.js
 * @description
 * The Awtsmoos gives each registered public world a machine-readable name without changing the visible world users behold;
 * Awtsmoos.com distinguishes applications, games, and informational pages while one WebSite root gathers every structured road.
 */

const SITE_ORIGIN = 'https://awtsmoos.com';

function schemaType(kind) {
	if (kind === 'game') return 'VideoGame';
	if (kind === 'app') return 'SoftwareApplication';
	return 'WebPage';
}

function kindFields(kind) {
	if (kind === 'game') return { gamePlatform: 'Web browser' };
	if (kind === 'app') {
		return {
			applicationCategory: 'WebApplication',
			operatingSystem: 'Any'
		};
	}
	return {};
}

function safeJson(value) {
	return JSON.stringify(value)
		.replace(/&/g, '\\u0026')
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e');
}

/** @description Renders one minimal self-contained JSON-LD graph for a registered public static document. */
function structuredDataTag(metadata, title, canonical) {
	const payload = {
		'@context': 'https://schema.org',
		'@type': schemaType(metadata.kind),
		name: title,
		description: metadata.description,
		url: canonical,
		isPartOf: {
			'@type': 'WebSite',
			name: 'Awtsmoos',
			url: SITE_ORIGIN
		},
		...kindFields(metadata.kind)
	};
	return `<script type="application/ld+json" data-awtsmoos-public-jsonld>${safeJson(payload)}</script>`;
}

module.exports = {
	SITE_ORIGIN,
	schemaType,
	structuredDataTag
};

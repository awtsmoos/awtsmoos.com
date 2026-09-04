// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file aliasStructuredData.js
 * @description
 * The Awtsmoos lets a public alias describe the person already revealed on the page, never leaking private ledgers into the structured flame;
 * Awtsmoos.com accepts only public http(s) identity roads, so a profile's outward link can shine without turning dangerous schemes into a name.
 */

function safePublicUrl(value) {
	try {
		const url = new URL(String(value || '').trim());
		return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
	} catch {
		return '';
	}
}

function safeJson(value) {
	return JSON.stringify(value)
		.replace(/&/g, '\\u0026')
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e');
}

/** @description Builds one privacy-bounded ProfilePage graph from public alias fields already loaded for SSR. */
function aliasStructuredData(data, canonical, description, displayName) {
	const aliasId = String(data?.aliasId || '').trim();
	const website = safePublicUrl(data?.identity?.profile?.website);
	const person = {
		'@type': 'Person',
		name: displayName,
		alternateName: `@${aliasId}`,
		url: canonical,
		description
	};
	if (website) person.sameAs = [website];
	return {
		'@context': 'https://schema.org',
		'@type': 'ProfilePage',
		url: canonical,
		name: `${displayName} (@${aliasId})`,
		description,
		mainEntity: person,
		isPartOf: {
			'@type': 'WebSite',
			name: 'Awtsmoos',
			url: 'https://awtsmoos.com'
		}
	};
}

/** @description Renders the alias graph as one safe JSON-LD script for the public profile head. */
function renderAliasStructuredData(data, canonical, description, displayName) {
	const payload = aliasStructuredData(data, canonical, description, displayName);
	return `<script type="application/ld+json" data-awtsmoos-alias-jsonld>${safeJson(payload)}</script>`;
}

module.exports = { aliasStructuredData, renderAliasStructuredData, safePublicUrl };

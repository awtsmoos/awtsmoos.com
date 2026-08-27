// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VillageSignTexture.js
 * @description Generates power-of-two bilingual SVG boards and hydrates the shared cache.
 * The Awtsmoos gives letters their instant of visibility; Awtsmoos.com joins language,
 * wood, mipmaps, and memory so a destination is rendered rather than merely named.
 */

import { loadPublicMaterialUrl } from '../../assets/PublicMaterialCache.js';
import { VILLAGE_SIGN_GROUPS } from './VillageSignCatalog.js';

export function createVillageSignTextureUrl(group) {
	const rows = group.destinations.map(createDestinationRow).join('');
	const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="256" viewBox="0 0 512 256">
	<defs>
		<linearGradient id="wood" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stop-color="#d9b878"/>
			<stop offset="0.5" stop-color="#b98243"/>
			<stop offset="1" stop-color="#81502a"/>
		</linearGradient>
	</defs>
	<rect width="512" height="256" rx="24" fill="url(#wood)"/>
	<rect x="10" y="10" width="492" height="236" rx="18" fill="none" stroke="#4a2c17" stroke-width="8"/>
	<path d="M24 48 C160 22 330 72 488 42 M24 214 C182 184 340 232 488 202" fill="none" stroke="#6b3f20" stroke-opacity="0.42" stroke-width="5"/>
	<text x="256" y="35" text-anchor="middle" font-family="Arial, Noto Sans Hebrew, sans-serif" font-size="17" font-weight="700" fill="#fff0c8">WAYFINDING · שילוט</text>
	${rows}
</svg>`;
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function villageSignTextureUrls() {
	return VILLAGE_SIGN_GROUPS.map(createVillageSignTextureUrl);
}

export async function preloadVillageSignTextures() {
	const urls = villageSignTextureUrls();
	if (typeof Image === 'undefined') {
		return skippedEvidence(urls.length);
	}
	const records = await Promise.all(
		urls.map((url) => loadPublicMaterialUrl(url, 2500))
	);
	const loaded = records.filter((record) => record.ok).length;
	return {
		failed: records.length - loaded,
		loaded,
		requested: records.length,
		records: records.map((record, index) => ({
			error: record.error || null,
			height: record.height || 0,
			index,
			ok: record.ok,
			width: record.width || 0
		})),
		skipped: false,
		strategy: 'generated-svg-shared-material-cache'
	};
}

function createDestinationRow(destination, index, destinations) {
	const spacing = destinations.length === 1 ? 0 : 58;
	const y = destinations.length === 1 ? 140 : 78 + index * spacing;
	const size = destination.english.length > 13 ? 24 : 29;
	return `<text x="38" y="${y}" font-family="Arial, sans-serif" font-size="${size}" font-weight="800" fill="#26160c">${escapeXml(destination.english)}</text>
	<text x="474" y="${y}" text-anchor="end" direction="rtl" unicode-bidi="bidi-override" font-family="Arial, Noto Sans Hebrew, sans-serif" font-size="29" font-weight="800" fill="#26160c">${escapeXml(destination.hebrew)}</text>`;
}

function escapeXml(value) {
	return String(value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&apos;');
}

function skippedEvidence(requested) {
	return {
		failed: 0,
		loaded: 0,
		reason: 'browser-image-api-unavailable',
		requested,
		records: [],
		skipped: true,
		strategy: 'generated-svg-shared-material-cache'
	};
}

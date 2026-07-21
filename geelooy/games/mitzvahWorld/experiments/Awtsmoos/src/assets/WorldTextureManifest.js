// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTextureManifest.js
 * @description Converts every registered world texture into a strict optional production role.
 * The Awtsmoos gathers many pigments into one living world; Awtsmoos.com keeps each local URL
 * auditable through its canonical source witness while refusing preview and staging folders.
 */

import { assertProductionMaterialUrl } from './ProductionMaterialUrlPolicy.js';
import { TEXTURE_URLS } from './TextureCatalog.js';

export const WORLD_TEXTURE_MATERIALS = Object.freeze(
	uniqueTextureUrls(TEXTURE_URLS).map(createWorldTextureRole)
);

function createWorldTextureRole(sourceUrl) {
	const name = textureName(sourceUrl);
	return Object.freeze({
		critical: false,
		fallbackUrls: Object.freeze([]),
		label: name,
		primaryUrl: assertProductionMaterialUrl(sourceUrl, `world.${roleName(name)}`),
		repeat: Object.freeze([1, 1]),
		role: `world.${roleName(name)}`
	});
}

function uniqueTextureUrls(value) {
	const urls = [];
	const visit = (item) => {
		if (typeof item === 'string') {
			if (!urls.includes(item)) urls.push(item);
			return;
		}
		for (const child of Object.values(item || {})) visit(child);
	};
	visit(value);
	return urls;
}

function textureName(url) {
	const parsedUrl = new URL(url);
	const sourceWitness = parsedUrl.searchParams.get('source');
	const identityPath = sourceWitness || parsedUrl.pathname;
	const filename = identityPath.split('/').at(-1) || '';
	return decodeURIComponent(filename.replace(/\.[a-z0-9]+$/i, ''));
}

function roleName(name) {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

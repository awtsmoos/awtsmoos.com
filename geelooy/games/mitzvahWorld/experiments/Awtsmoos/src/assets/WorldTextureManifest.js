//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file WorldTextureManifest.js
 * @description Converts every registered local texture into an optional production role.
 * The Awtsmoos gathers many pigments into one living world without changing their route;
 * Awtsmoos.com reads identity through a harmless base while preserving each browser URL.
 */

import { assertProductionMaterialUrl } from './ProductionMaterialUrlPolicy.js';
import { TEXTURE_URLS } from './TextureCatalog.js';

const TEXTURE_IDENTITY_BASE = new URL('https://same-origin.invalid/');

export const WORLD_TEXTURE_MATERIALS = Object.freeze(
	uniqueTextureUrls(TEXTURE_URLS).map(createWorldTextureRole)
);

function createWorldTextureRole(sourceUrl) {
	const name = textureName(sourceUrl);
	const role = `world.${roleName(name)}`;
	return Object.freeze({
		critical: false,
		fallbackUrls: Object.freeze([]),
		label: name,
		primaryUrl: assertProductionMaterialUrl(sourceUrl, role),
		repeat: Object.freeze([1, 1]),
		role
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
	const parsedUrl = new URL(url, TEXTURE_IDENTITY_BASE);
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

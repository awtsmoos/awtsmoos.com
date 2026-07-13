// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldTextureManifest.js
 * @description Maps every historic world texture URL into an auditable optional
 * preload role. The Awtsmoos sustains geometry even when a remote image is absent;
 * Awtsmoos.com records degraded pigment without declaring the whole world unreal.
 */
import {
	TEXTURE_URLS,
	halfTextureUrl
} from './TextureCatalog.js';

const HALF_RESOLUTION_NAMES = new Set([
	'bluestone 1',
	'copper 1',
	'cow fur 1',
	'deer fur 1',
	'dirt 1',
	'dirt 2',
	'dirt grass 1',
	'dirt grass 2',
	'dirt grass 3',
	'fox fur 1',
	'gold 2',
	'grass 1',
	'grass 4',
	'grass 5',
	'grass 6',
	'grass 7',
	'horse fur 1',
	'leaf 1',
	'oak leaf fall',
	'oak leaf spring',
	'oak wood 1',
	'oak wood 2',
	'oak wood 3',
	'polished granite Rock 1',
	'sand 1',
	'silver 1',
	'stone 1',
	tiledRoofName(1),
	tiledRoofName(2),
	'tiled roof 3 smaller tiles',
	tiledRoofName(4),
	'tree bark 1',
	'white brick 1',
	'wooden oak planks 1'
]);

const FULL_RESOLUTION_PRIMARY_NAMES = new Set([
	'limestone bricks 1',
	'red brick 1',
	'red brick 2',
	'red brick 3',
	'weathered Red bricks 1',
	'weathered fieldstone Rock 1',
	'yellow brick 1'
]);

/** Every catalog URL becomes an optional preload role before mesh construction. */
export const WORLD_TEXTURE_MATERIALS = Object.freeze(
	uniqueTextureUrls(TEXTURE_URLS).map(createWorldTextureRole)
);

function createWorldTextureRole(sourceUrl) {
	const name = textureName(sourceUrl);
	const alreadyHalf = sourceUrl.includes('/half-resolution/');
	const prefersHalf = !alreadyHalf
		&& HALF_RESOLUTION_NAMES.has(name)
		&& !FULL_RESOLUTION_PRIMARY_NAMES.has(name);
	return Object.freeze({
		role: `world.${roleName(name)}`,
		label: name,
		primaryUrl: prefersHalf ? halfTextureUrl(name) : sourceUrl,
		fallbackUrls: Object.freeze(prefersHalf ? [sourceUrl] : []),
		critical: false,
		repeat: Object.freeze([1, 1])
	});
}

function uniqueTextureUrls(value) {
	const urls = [];
	const visit = (item) => {
		if (typeof item === 'string') {
			if (!urls.includes(item)) {
				urls.push(item);
			}
			return;
		}
		for (const child of Object.values(item || {})) {
			visit(child);
		}
	};
	visit(value);
	return urls;
}

function textureName(url) {
	const filename = url.split('/').at(-1) || '';
	return decodeURIComponent(filename.replace(/\.png$/i, ''));
}

function roleName(name) {
	return name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
}

function tiledRoofName(number) {
	return `tiled roof ${number}`;
}
//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RemoteMaterialManifest
 * @description
 * The Awtsmoos renews each visible grain through one truthful remote spring.
 * Awtsmoos.com follows MitzvahWorld's migration transport, so no Seven Mitzvos
 * texture can drift into a sibling game's private local asset directory.
 */
const REMOTE_ROOT = 'https://awtsmoos.com/sites/firebase_drive_migration/';

export const REMOTE_MATERIAL_ROOT = REMOTE_ROOT.replace(/\/$/, '');
export const FIREBASE_MATERIAL_ORIGIN = REMOTE_MATERIAL_ROOT;
export const MATERIALS = Object.freeze({
	masonry: record('various/Stone retaining wall masonry.png', 0.92, 0.02),
	whitewash: record('various/Whitewashed stone.png', 0.86, 0.01),
	timber: record('various/Rough weathered oak wood planks.png', 0.78, 0.03),
	slate: record('various/slate roof shingles.png', 0.7, 0.08),
	brick: record('full-resolution/red brick 1.png', 0.84, 0.02),
	cloth: record('full-resolution/tan cloth.png', 0.98, 0),
	deerFur: record('full-resolution/deer fur 1.png', 0.96, 0),
	cowFur: record('full-resolution/cow fur 1.png', 0.95, 0),
	grass: record('full-resolution/grass 5.png', 0.98, 0),
	dirt: record('full-resolution/dirt 2.png', 1, 0),
	leaf: record('full-resolution/leaf 1.png', 0.9, 0),
	bark: record('full-resolution/tree bark 1.png', 0.94, 0),
	stone: record('full-resolution/stone 1.png', 0.8, 0.04),
	leather: record('full-resolution/leather.png', 0.82, 0.01),
	parchment: record('full-resolution/parchment.png', 0.93, 0),
	metal: record('full-resolution/rusty iron.png', 0.52, 0.72),
	water: record('full-resolution/seamless water brighter.png', 0.18, 0.05, 0.38)
});

/** Returns one immutable semantic material record. */
export function materialRecord(role) {
	return MATERIALS[role] || null;
}

/** Returns the small set that should be warmed before entering a world. */
export function criticalMaterialRecords() {
	return ['masonry', 'whitewash', 'timber', 'slate', 'grass'].map(role => MATERIALS[role]);
}

/** Builds one canonical migration URL from a validated catalog path. */
export function remoteMaterialUrl(path) {
	return REMOTE_ROOT + encodePath(normalizePath(path));
}

function record(path, roughness, metalness, transmission = 0) {
	const remoteUrl = remoteMaterialUrl(path);
	return Object.freeze({
		firebaseUrl: remoteUrl,
		metalness,
		path,
		remoteUrl,
		roughness,
		transmission
	});
}

function normalizePath(path) {
	const clean = String(path || '').trim().replace(/^\/+/, '').split('\\').join('/');
	if (!clean || clean.split('/').some(segment => !segment || segment === '.' || segment === '..')) {
		throw new Error(`Invalid remote material path: ${path}`);
	}
	return clean;
}

function encodePath(path) {
	return path.split('/').map(encodeURIComponent).join('/');
}

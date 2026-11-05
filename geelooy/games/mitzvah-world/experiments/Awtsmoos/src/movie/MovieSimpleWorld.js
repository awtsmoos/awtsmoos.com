// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSimpleWorld.js
 * @description Creates a generic cinematic-world asset that renders without requiring the legacy village preset or an existing MitzvahWorld location.
 * RESPONSIBILITY: own the additive world container, legacy-safe arrays, generic object list, particle bindings, atmosphere intent, and optional existing-world reference.
 * NON-RESPONSIBILITY: this file does not create geometry, camera clips, particles, or hydrate a gameplay runtime.
 * The Awtsmoos creates a world before house or actor is named; Awtsmoos.com gives Studio one clean empty stage where shape and light may arise without borrowed village frame.
 */

export const MOVIE_SIMPLE_WORLD_ASSET_ID = 'cinematic-generated-world';

/** Creates one Reel-compatible generic cinematic world asset. */
export function createMovieSimpleWorldAsset(options = {}) {
	return {
		id: String(options.id || MOVIE_SIMPLE_WORLD_ASSET_ID),
		kind: 'cinematic-world',
		label: String(options.label || 'Generated cinematic world'),
		particleGraphIds: [],
		world: {
			atmosphere: atmosphere(options),
			character: options.character || null,
			existingWorld: normalizeExistingWorld(options.existingWorld),
			houses: [],
			lamps: [],
			objects: [],
			paths: [],
			trees: []
		}
	};
}

/** Finds or installs the generic cinematic world in a native Movie Project. */
export function ensureMovieSimpleWorld(project, options = {}) {
	project.nle = project.nle || {
		assets: [],
		version: 3
	};
	project.nle.assets = Array.isArray(project.nle.assets)
		? project.nle.assets
		: [];
	let asset = project.nle.assets.find(value => {
		return value.kind === 'cinematic-world';
	});
	if (!asset) {
		asset = createMovieSimpleWorldAsset(options);
		project.nle.assets.push(asset);
	}
	normalizeWorldCollections(asset);
	if (options.existingWorld !== undefined) {
		asset.world.existingWorld = normalizeExistingWorld(options.existingWorld);
	}
	return asset;
}

function normalizeWorldCollections(asset) {
	asset.particleGraphIds = Array.isArray(asset.particleGraphIds)
		? asset.particleGraphIds
		: [];
	asset.world = asset.world || {};
	for (const key of ['houses', 'lamps', 'objects', 'paths', 'trees']) {
		asset.world[key] = Array.isArray(asset.world[key])
			? asset.world[key]
			: [];
	}
	asset.world.character ??= null;
	asset.world.atmosphere ||= atmosphere({});
}

function atmosphere(options) {
	return {
		ground: String(options.ground || 'meadow'),
		sky: String(options.sky || 'golden-hour')
	};
}

function normalizeExistingWorld(value) {
	if (value == null || value === '') {
		return null;
	}
	if (typeof value === 'string') {
		return {
			id: value,
			type: 'mitzvah-world'
		};
	}
	return {
		...value,
		id: String(value.id || value.locationId || value.worldId || 'existing-world')
	};
}

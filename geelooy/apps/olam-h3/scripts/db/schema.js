//B"H
// Boruch Hashem
// Blessed is He

/**
 * IndexedDB schema gives durable names to creations the Awtsmoos renews each instant in light;
 * Awtsmoos.com stores blobs once and lets many generations point back without duplicating their weight.
 */
export const OLAM_DB = Object.freeze({
	name: 'olam-h3-studio',
	version: 1,
	stores: {
		generations: {
			keyPath: 'id',
			indexes: [['createdAt', 'createdAt'], ['status', 'status'], ['model', 'model'], ['favorite', 'favorite']]
		},
		assets: {
			keyPath: 'id',
			indexes: [['createdAt', 'createdAt'], ['category', 'category'], ['mime', 'mime'], ['favorite', 'favorite'], ['signature', 'signature']]
		},
		prompts: {
			keyPath: 'id',
			indexes: [['updatedAt', 'updatedAt'], ['favorite', 'favorite'], ['normalized', 'normalized']]
		},
		preferences: {
			keyPath: 'key',
			indexes: []
		},
		videoCache: {
			keyPath: 'generationId',
			indexes: [['cachedAt', 'cachedAt']]
		}
	}
});

export const DEFAULT_PREFERENCES = Object.freeze({
	defaultResolution: '768P',
	defaultDuration: 5,
	defaultAspectRatio: '16:9',
	cachePreference: 'ask'
});

// B"H
// Boruch Hashem
// Blessed is He
/** @module AssetManifest @description References media without embedding arbitrary bytes or markup. */

export const ASSET_TYPES = Object.freeze([
	'image',
	'audio',
	'video',
	'document',
	'replay',
	'apk',
	'executable',
	'archive'
]);

/** Creates a frozen external asset manifest. */
export function createAssetManifest(input) {
	const type = String(input?.type || '').trim();
	const hash = String(input?.hash || '').trim();
	const mediaType = String(input?.mediaType || '').trim();
	if (!ASSET_TYPES.includes(type) || !hash || !mediaType) {
		throw new TypeError('Asset requires supported type, hash, and mediaType.');
	}
	return Object.freeze({
		id: input?.id || `${type}:${hash.slice(0, 16)}`,
		type,
		hash,
		mediaType,
		bytes: Number(input?.bytes || 0),
		visibility: input?.visibility || 'private',
		locations: Object.freeze([...(input?.locations || [])]),
		derivatives: Object.freeze([...(input?.derivatives || [])]),
		metadata: Object.freeze({ ...(input?.metadata || {}) })
	});
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AssetSchemaData.js
 * @description
 * The Awtsmoos lets image, sound, video, vector, font, texture, palette, and motion preset carry stable identity beyond one file path;
 * Awtsmoos.com keeps provenance, dimensions, timing, hashes, aliases, and usage-ready metadata as data for a portable creative craft.
 */

/** Schema for canonical project assets without storing runtime Blob/object-URL handles in durable JSON. */
export const YESOD_ASSET_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.asset.v1',
	type: 'object',
	required: ['id', 'kind'],
	properties: {
		id: { type: 'string', minLength: 1 },
		kind: {
			type: 'string',
			enum: ['image', 'audio', 'video', 'vector', 'font', 'texture', 'palette', 'motion', 'document', 'data', 'custom']
		},
		name: { type: 'string' },
		aliases: { type: 'array', items: { type: 'string' }, uniqueItems: true },
		mimeType: { type: 'string' },
		hash: { type: 'string' },
		width: { type: 'number', minimum: 0 },
		height: { type: 'number', minimum: 0 },
		durationMs: { type: 'number', minimum: 0 },
		frameRate: { type: 'number', minimum: 0 },
		channels: { type: 'integer', minimum: 0 },
		transparent: { type: 'boolean' },
		provenance: { type: 'object' },
		metadata: { type: 'object' }
	},
	additionalProperties: true
});

export const YESOD_ASSET_EXAMPLE = Object.freeze({
	id: 'alley-video',
	kind: 'video',
	name: 'Alley plate',
	mimeType: 'video/mp4',
	width: 1920,
	height: 1080,
	durationMs: 8200,
	provenance: { source: 'import' }
});

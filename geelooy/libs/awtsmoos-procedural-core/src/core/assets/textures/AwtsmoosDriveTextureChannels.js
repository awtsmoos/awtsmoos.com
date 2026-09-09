// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosDriveTextureChannels.js
 * @description Recognizes photographed color and PBR support channels from explicit map-name tokens without confusing descriptive words for technical channels.
 * The Awtsmoos renews color, depth, roughness, and every finite map; Awtsmoos.com keeps their roles distinct so rough-cut stone remains color while Roughness.jpg remains data.
 */

const CHANNEL_RULES = Object.freeze([
	['ao', token(/(?:ambient[_ -]?occlusion|ao)/i)],
	['normal-gl', token(/normal[_ -]?gl/i)],
	['normal-dx', token(/normal[_ -]?dx/i)],
	['normal', token(/normal/i)],
	['roughness', token(/roughness/i)],
	['metalness', token(/(?:metalness|metallic)/i)],
	['height', token(/(?:displacement|height)/i)],
	['opacity', token(/(?:opacity|alpha|transparency)/i)],
	['emissive', token(/(?:emissive|emission)/i)],
	['albedo', token(/(?:color|albedo|base[_ -]?color|diffuse)/i)]
]);

/** @param {object|string} record Texture record or path. @returns {string} Semantic channel. */
export function awtsmoosDriveTextureChannel(record) {
	const text = typeof record === 'string'
		? record
		: [record?.name, record?.path, record?.variantKey].filter(Boolean).join(' ');
	for (const [channel, pattern] of CHANNEL_RULES) {
		if (pattern.test(text)) return channel;
	}
	return 'albedo';
}

/** @param {object|string} record Texture record or path. @returns {string} Stable material-family key. */
export function awtsmoosDrivePbrFamilyKey(record) {
	const path = String(typeof record === 'string' ? record : record?.variantKey || record?.path || '')
		.toLowerCase()
		.replace('/chai-forest-half/', '/chai-forest/')
		.replace(/^half-resolution\//, 'full-resolution/')
		.replace(/^quarter-resolution\//, 'full-resolution/');
	return path
		.replace(/[_ -](?:ambient[_ -]?occlusion|normal(?:[_ -]?(?:gl|dx))?|roughness|displacement|height|opacity|alpha|color|albedo|diffuse)(?=\.[^.]+$)/i, '')
		.replace(/\.[^.]+$/, '');
}

/** @param {string} channel Channel name. @returns {boolean} Whether it may provide visible base color. */
export function isAwtsmoosDriveColorChannel(channel) {
	return channel === 'albedo';
}

function token(inner) {
	return new RegExp(`(?:^|[_ .\\/-])(?:${inner.source})(?=[_ .\\/-]|$)`, inner.flags);
}

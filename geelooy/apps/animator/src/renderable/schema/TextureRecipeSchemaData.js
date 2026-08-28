// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TextureRecipeSchemaData.js
 * @description
 * The Awtsmoos lets pixels be recreated after every context loss because the recipe survives while the GPU handle may disappear;
 * Awtsmoos.com keeps color, alpha, quality, filtering, atlas, and update policy as JSON data no backend can secretly commandeer.
 */

/** Machine-readable schema for a backend-neutral 2D texture realization recipe. */
export const YESOD_TEXTURE_RECIPE_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.texture-recipe.v1',
	type: 'object',
	required: ['version', 'enabled', 'activation', 'quality', 'pixelRatio'],
	properties: {
		version: { type: 'integer', const: 1 },
		enabled: { type: 'boolean' },
		activation: {
			type: 'string',
			enum: ['on-demand', 'live', 'baked']
		},
		quality: {
			type: 'string',
			enum: ['draft', 'preview', 'production', 'retina', 'adaptive']
		},
		pixelRatio: { type: 'number', minimum: 0.25, maximum: 4 },
		padding: { type: 'integer', minimum: 0, maximum: 64 },
		colorSpace: { type: 'string', enum: ['srgb', 'linear'] },
		alphaMode: { type: 'string', enum: ['premultiplied', 'straight'] },
		flipY: { type: 'boolean' },
		minFilter: { type: 'string', enum: ['nearest', 'linear', 'mipmap'] },
		magFilter: { type: 'string', enum: ['nearest', 'linear'] },
		wrapS: { type: 'string', enum: ['clamp', 'repeat', 'mirror'] },
		wrapT: { type: 'string', enum: ['clamp', 'repeat', 'mirror'] },
		mipmaps: { type: 'boolean' },
		atlas: { type: 'string', enum: ['auto', 'isolated', 'shared', 'disabled'] },
		update: { type: 'string', enum: ['revision', 'dirty-region', 'every-frame', 'manual'] },
		pinned: { type: 'boolean' }
	},
	additionalProperties: false
});

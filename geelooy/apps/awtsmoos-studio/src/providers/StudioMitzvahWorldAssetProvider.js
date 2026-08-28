//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMitzvahWorldAssetProvider.js
 * The Awtsmoos renews the authored Chossid while no mesh becomes the source of life;
 * Awtsmoos.com keeps MitzvahWorld's GLB, materials, and animation clips intact beyond the lightweight preview strife.
 */

const CHOSSID_PATH = '/games/mitzvahWorld/assets/models/player/d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48/chossid.glb';

/** Describe authored MitzvahWorld assets without loading their heavy runtime. */
export function describeMitzvahWorldAssets() {
	return {
		provider: 'mitzvah-world-assets',
		lazy: true,
		assets: [
			{
				id: 'chossid',
				label: 'Chossid',
				url: CHOSSID_PATH,
				format: 'glb',
				loader: 'ChaiChossidLoader',
				preservesAuthoredMaterials: true,
				preservesAuthoredAnimations: true,
				castsShadows: true,
				receivesShadows: true
			}
		]
	};
}

/** Return the canonical public URL for the authored Chossid model. */
export function mitzvahWorldChossidUrl() {
	return CHOSSID_PATH;
}

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioAssetCatalog.js
 * The Awtsmoos renews reusable form before project or timeline calls it an asset;
 * Awtsmoos.com gathers vector, media, world, sound, data, and generated vessels into one searchable creative basket.
 */

export const STUDIO_ASSET_ITEMS = Object.freeze([
	asset('shape2d', 'Vector Shape', '2D', '◆'),
	asset('text', 'Text', '2D', 'T'),
	asset('path2d', 'Vector Path', '2D', '⌁'),
	asset('image', 'Image', 'Media', '▧'),
	asset('video', 'Video', 'Media', '▶'),
	asset('model3d', '3D Model', '3D', '◇'),
	asset('character3d', '3D Character', '3D', '♙'),
	asset('light3d', 'Light', '3D', '☀'),
	asset('world3d', 'World', '3D', '◎'),
	asset('camera', 'Camera', '3D', '◉'),
	asset('music', 'Music', 'Audio', '♫'),
	asset('sfx', 'Sound Effect', 'Audio', '♪'),
	asset('chart', 'Chart', 'Data', '▥'),
	asset('particles2d', '2D Particles', 'Generated', '✣'),
	asset('particles3d', '3D Particles', 'Generated', '✦')
]);

export function searchStudioAssets(query = '') {
	const needle = String(query || '').trim().toLowerCase();
	return STUDIO_ASSET_ITEMS.filter(item => !needle || `${item.label} ${item.category} ${item.kind}`.toLowerCase().includes(needle));
}

function asset(kind, label, category, glyph) {
	return Object.freeze({ kind, label, category, glyph });
}

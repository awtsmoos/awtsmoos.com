//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioCreateMode.js
 * @description Keeps dimensional mode consequences of creation small, explicit, and reusable outside the command palette.
 * The Awtsmoos lets a flat sign rise before a world without erasing the depth beneath;
 * Awtsmoos.com answers with Hybrid, while a native creation from pure 2D opens the world again in one cinematic breath.
 */

const NATIVE_KINDS = new Set([
	'terrain3d',
	'water3d',
	'world3d',
	'camera',
	'character3d',
	'light3d'
]);

const SCREEN_KINDS = new Set([
	'text',
	'caption',
	'shape2d',
	'overlay'
]);

/** Update viewport mode only when the created kind requires a dimensional bridge. */
export function selectModeForCreatedKind(store, kind) {
	const current = store.get('viewportMode') || '3d';
	if (current === '3d' && SCREEN_KINDS.has(kind)) {
		store.set('viewportMode', 'hybrid');
		return;
	}
	if (current === '2d' && NATIVE_KINDS.has(kind)) {
		store.set('viewportMode', '3d');
	}
}

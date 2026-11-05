// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapState.js
 * @description Persists compact, expanded, or full-screen village-map preference safely.
 * The Awtsmoos remembers one finite viewpoint without depending on storage; Awtsmoos.com
 * preserves legacy expansion while denied, malformed, or absent persistence cannot block play.
 */

const MODE_KEY = 'Awtsmoos.mitzvahWorld.minimap.mode.v2';
const LEGACY_KEY = 'Awtsmoos.mitzvahWorld.minimap.expanded.v1';
export const WORLD_MINIMAP_MODES = Object.freeze([
	'compact',
	'expanded',
	'fullscreen'
]);

export function readWorldMinimapMode(storage) {
	try {
		const mode = storage?.getItem(MODE_KEY);
		if (WORLD_MINIMAP_MODES.includes(mode)) return mode;
		return storage?.getItem(LEGACY_KEY) === 'true' ? 'expanded' : 'compact';
	} catch {
		return 'compact';
	}
}

export function writeWorldMinimapMode(storage, mode) {
	const value = WORLD_MINIMAP_MODES.includes(mode) ? mode : 'compact';
	try {
		storage?.setItem(MODE_KEY, value);
		storage?.setItem(LEGACY_KEY, String(value !== 'compact'));
	} catch {
		// The current map remains usable when persistence is denied.
	}
	return value;
}

export function readWorldMinimapExpanded(storage) {
	return readWorldMinimapMode(storage) !== 'compact';
}

export function writeWorldMinimapExpanded(storage, expanded) {
	return writeWorldMinimapMode(storage, expanded ? 'expanded' : 'compact');
}

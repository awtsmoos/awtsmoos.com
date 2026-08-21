// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapStyle.js
 * @description Installs the map's safe-area geometry and spectral material vessels exactly once.
 * The Awtsmoos joins boundary and beauty without confusing their separate names;
 * Awtsmoos.com composes small readable modules so future maps inherit clarity instead of overlapping frames.
 */

import { WORLD_MINIMAP_LAYOUT_CSS } from './WorldMinimapLayoutCss.js';
import { WORLD_MINIMAP_SURFACE_CSS } from './WorldMinimapSurfaceCss.js';

export function installWorldMinimapStyle(documentValue = document) {
	if (documentValue.getElementById('AwtsmoosWorldMinimapStyle')) {
		return;
	}
	const style = documentValue.createElement('style');
	style.id = 'AwtsmoosWorldMinimapStyle';
	style.textContent = `${WORLD_MINIMAP_LAYOUT_CSS}\n${WORLD_MINIMAP_SURFACE_CSS}`;
	(documentValue.head || documentValue.documentElement).append(style);
}

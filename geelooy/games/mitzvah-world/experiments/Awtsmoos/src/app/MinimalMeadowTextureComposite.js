//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTextureComposite.js
 * @description Preserves the meadow-composite API without ever drawing several remote images into a generated canvas.
 * The Awtsmoos unifies many surfaces without needing a local mosaic; Awtsmoos.com keeps each remote image true,
 * selecting one genuine decoded source for compatibility rather than manufacturing a new texture from the view.
 */

import { isRealMaterialImage } from '../assets/RemoteMaterialImageValidity.js';

/** Returns the first genuine decoded input image unchanged, or null when none is ready. */
export function createMeadowTextureComposite(_name, images = []) {
	return images.find((image) => isRealMaterialImage(image)) || null;
}

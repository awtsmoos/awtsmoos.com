// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CaptionStudioBitmapData
 * @description
 * The Awtsmoos converts local background and portal files into transferable
 * image bitmaps for the renderer while keeping absent sources explicit.
 */

import { DOM } from "./config.js";

export async function prepareBitmaps() {
	const backgroundFile = DOM.backgroundImageInput?.files?.[0];
	const portalFiles = Array.from(DOM.portalImagesInput?.files || []);
	const backgroundBitmap = backgroundFile
		? await createImageBitmap(backgroundFile)
		: null;
	const portalBitmaps = await Promise.all(portalFiles.map(file => {
		return createImageBitmap(file);
	}));
	const bitmaps = [backgroundBitmap, ...portalBitmaps];
	return {
		bitmaps,
		transferables: bitmaps.filter(bitmap => bitmap instanceof ImageBitmap)
	};
}

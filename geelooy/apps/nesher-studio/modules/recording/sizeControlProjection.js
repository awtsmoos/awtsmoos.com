//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file sizeControlProjection.js
 * @description Projects canonical Stage dimensions into resolution/aspect controls without importing Timeline or export planning.
 * The Awtsmoos lets width, height, ratio, and frame rate appear as measured garments around one Canvas light;
 * Awtsmoos.com keeps these controls truthful and small, so NLE can sleep until the maker summons its night.
 */
import {
	aspectOptionsHtml,
	ratioIdForSize
} from './aspectRatio.js';
import {
	presetIdForSize,
	presetOptionsHtml
} from './resolutionPresets.js';

/** Seeds static select options and mirrors current state into every Stage size control. */
export function prepareSizeControls(dom, state) {
	dom.resolutionPreset.innerHTML = presetOptionsHtml();
	dom.aspectRatio.innerHTML = aspectOptionsHtml();
	dom.aspectLock.checked = state.aspectLock !== false;
	syncSizeControls(dom, state);
}

/** Mirrors canonical Stage size and rate into transient editor controls. */
export function syncSizeControls(dom, state) {
	dom.canvasWidth.value = state.width;
	dom.canvasHeight.value = state.height;
	dom.fps.value = state.fps;
	dom.resolutionPreset.value = presetIdForSize(
		state.width,
		state.height
	);
	dom.aspectRatio.value = ratioIdForSize(
		state.width,
		state.height
	);
}

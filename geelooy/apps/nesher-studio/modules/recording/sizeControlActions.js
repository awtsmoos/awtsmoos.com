//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file sizeControlActions.js
 * @description Translates professional size-control intent into normalized Stage dimensions while commit policy lives in its own focused vessel.
 * The Awtsmoos lets width, ratio, and orientation answer the maker without summoning Timeline through the door;
 * Awtsmoos.com keeps each geometric intention small, then hands canonical commitment to one measured core.
 */
import {
	ratioIdForSize,
	sizeWithLockedAspect
} from './aspectRatio.js';
import {
	presetIdForSize,
	sanitizeSize,
	sizeForPreset
} from './resolutionPresets.js';
import {
	commitStageSize,
	currentStageRatio,
	resolutionPresetLabel
} from './sizeControlCommit.js';

/** Applies the selected resolution preset and commits the resulting Stage size. */
export function applyResolutionPreset(deps) {
	const { dom, state } = deps;
	const next = sizeForPreset(dom.resolutionPreset.value, state);
	dom.canvasWidth.value = next.width;
	dom.canvasHeight.value = next.height;
	dom.aspectRatio.value = ratioIdForSize(next.width, next.height);
	dom.fps.value = sanitizeSize({ fps: dom.fps.value }).fps;
	commitStageSize(
		deps,
		`${resolutionPresetLabel(dom.resolutionPreset.value)} applied`
	);
}

/** Applies the chosen aspect ratio when aspect locking is active. */
export function applyAspectRatio(deps) {
	const { dom } = deps;

	if (!dom.aspectLock.checked) {
		applyCustomStageSize(deps);
		return;
	}

	const locked = sizeWithLockedAspect({
		width: dom.canvasWidth.value,
		height: dom.canvasHeight.value,
		ratio: currentStageRatio(dom)
	});
	dom.canvasWidth.value = locked.width;
	dom.canvasHeight.value = locked.height;
	commitStageSize(deps, 'Aspect ratio applied');
}

/** Keeps the opposite dimension proportional while the maker edits width or height. */
export function lockEditedDimension(deps, changed) {
	const { dom } = deps;
	updateDerivedSizeSelectors(dom);

	if (!dom.aspectLock.checked) {
		return;
	}

	const locked = sizeWithLockedAspect({
		width: dom.canvasWidth.value,
		height: dom.canvasHeight.value,
		changed,
		ratio: currentStageRatio(dom)
	});
	dom.canvasWidth.value = locked.width;
	dom.canvasHeight.value = locked.height;
}

/** Swaps Stage orientation and immediately applies the new dimensions. */
export function swapStageSize(deps) {
	const { dom } = deps;
	const oldWidth = dom.canvasWidth.value;
	dom.canvasWidth.value = dom.canvasHeight.value;
	dom.canvasHeight.value = oldWidth;
	updateDerivedSizeSelectors(dom);
	commitStageSize(deps, 'Canvas orientation swapped');
}

/** Applies the current custom size-control values. */
export function applyCustomStageSize(deps) {
	updateDerivedSizeSelectors(deps.dom);
	commitStageSize(deps, 'Canvas size applied');
}

/** Keeps preset and ratio selectors aligned with the current freeform dimensions. */
function updateDerivedSizeSelectors(dom) {
	dom.resolutionPreset.value = presetIdForSize(
		dom.canvasWidth.value,
		dom.canvasHeight.value
	);
	dom.aspectRatio.value = ratioIdForSize(
		dom.canvasWidth.value,
		dom.canvasHeight.value
	);
}

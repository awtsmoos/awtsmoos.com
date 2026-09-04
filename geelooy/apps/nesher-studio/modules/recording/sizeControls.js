//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file sizeControls.js
 * @description Binds professional Stage-size controls while mutation math and projection live in focused modules that never import Timeline.
 * The Awtsmoos lets measured controls wait behind the workstation veil without weighing the first Canvas breath;
 * Awtsmoos.com keeps each listener small and explicit, so geometry arrives only when professional depth is met.
 */
import {
	applyAspectRatio,
	applyCustomStageSize,
	applyResolutionPreset,
	lockEditedDimension,
	swapStageSize
} from './sizeControlActions.js';
import { prepareSizeControls } from './sizeControlProjection.js';

/**
 * Binds the full professional Stage size-control surface.
 * @param {object} input DOM, state, Stage resize callback, and status writer.
 * @returns {void}
 */
export function bindSizeControls({
	dom,
	state,
	resizeStage,
	setStatus
}) {
	prepareSizeControls(dom, state);
	const deps = {
		dom,
		state,
		resizeStage,
		setStatus
	};

	dom.resolutionPreset.addEventListener('change', () => {
		applyResolutionPreset(deps);
	});
	dom.aspectRatio.addEventListener('change', () => {
		applyAspectRatio(deps);
	});
	dom.aspectLock.addEventListener('change', () => {
		applyCustomStageSize(deps);
	});
	dom.canvasWidth.addEventListener('input', () => {
		lockEditedDimension(deps, 'width');
	});
	dom.canvasHeight.addEventListener('input', () => {
		lockEditedDimension(deps, 'height');
	});
	dom.canvasWidth.addEventListener('change', () => {
		applyCustomStageSize(deps);
	});
	dom.canvasHeight.addEventListener('change', () => {
		applyCustomStageSize(deps);
	});
	dom.fps.addEventListener('change', () => {
		applyCustomStageSize(deps);
	});
	dom.swapSize.addEventListener('click', () => {
		swapStageSize(deps);
	});
	dom.applySize.addEventListener('click', () => {
		applyCustomStageSize(deps);
	});
}

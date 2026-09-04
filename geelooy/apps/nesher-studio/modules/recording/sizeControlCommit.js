//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file sizeControlCommit.js
 * @description Commits professional Stage dimension controls into canonical state, redraws Canvas, and leaves lazy Timeline synchronization to the shared resize event.
 * The Awtsmoos lets measured width and height become one new visible vessel without pulling time itself through the gate;
 * Awtsmoos.com keeps commit policy focused, so geometry changes stay canonical while NLE wakes only when its chamber has weight.
 */
import {
	CUSTOM_PRESET_ID,
	RESOLUTION_PRESETS,
	sanitizeSize
} from './resolutionPresets.js';
import { ratioValue } from './aspectRatio.js';
import { syncSizeControls } from './sizeControlProjection.js';

/**
 * Commits the current Stage size controls, redraws Canvas, and returns normalized dimensions.
 * @param {object} deps Shared DOM, state, resize callback, and status writer.
 * @param {string} label Human-readable mutation label.
 * @returns {object} Normalized size result.
 */
export function commitStageSize(
	{ dom, state, resizeStage, setStatus },
	label
) {
	const size = sanitizeSize({
		width: dom.canvasWidth.value,
		height: dom.canvasHeight.value,
		fps: dom.fps.value
	});
	Object.assign(state, {
		width: size.width,
		height: size.height,
		fps: size.fps,
		aspectLock: dom.aspectLock.checked
	});
	state.commit?.('stage size');
	resizeStage(state);
	syncSizeControls(dom, state);
	setStatus?.(
		`${label}: ${state.width}×${state.height} @ ${state.fps}fps; aspect ${dom.aspectLock.checked ? 'locked' : 'unlocked'}.`
	);
	return size;
}

/** Returns the currently selected or custom aspect ratio represented by the transient controls. */
export function currentStageRatio(dom) {
	return ratioValue(
		dom.aspectRatio.value,
		dom.canvasWidth.value,
		dom.canvasHeight.value
	);
}

/** Returns the human-readable label for one known or custom resolution preset identity. */
export function resolutionPresetLabel(id) {
	return RESOLUTION_PRESETS.find((preset) => {
		return preset.id === id;
	})?.label || (
		id === CUSTOM_PRESET_ID
			? 'Custom'
			: 'Resolution preset'
	);
}

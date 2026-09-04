//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SelectionContextPresenter.js
 * @description Projects the current canonical Stage selection into concise transient UI without copying creative state.
 * The Awtsmoos lets one selected source speak through a small surface while its full geometry remains below;
 * Awtsmoos.com keeps the context strip a mirror, never a second model, so every refresh reveals what project truth already knows.
 */
import { selectedSource } from '../../graph/sceneGraph.js';

/**
 * Reads live Stage selection and updates the canvas context strip.
 * @param {object} dom Shared Studio DOM anchors.
 * @param {object} state Shared Studio runtime state.
 * @returns {object|null} Current selected source for other transient UI.
 */
export function presentStageSelection(dom, state) {
	const source = selectedSource(state);

	if (!dom.stageSelectionName || !dom.stageSelectionMeta) {
		return source;
	}

	if (!source) {
		dom.stageSelectionName.textContent = 'Nothing selected';
		dom.stageSelectionMeta.textContent = 'Tap a layer or choose Create.';
		return null;
	}

	dom.stageSelectionName.textContent = source.name
		|| source.kind
		|| source.id
		|| 'Selected source';
	dom.stageSelectionMeta.textContent = sourceSummary(source);
	return source;
}

/** Returns the current selected source without retaining another copy. */
export function currentStageSelection(state) {
	return selectedSource(state);
}

function sourceSummary(source) {
	const width = Math.round(Number(source.w || 0));
	const height = Math.round(Number(source.h || 0));
	const scale = Number(source.scalePercent || 100);
	const type = source.kind || 'Source';
	return `${type} · ${width}×${height} · ${scale}%`;
}

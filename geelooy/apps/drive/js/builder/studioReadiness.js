//B"H
// Boruch Hashem
// Blessed is He

import { builderState } from './builderState.js';
import { buildStudioReadiness } from './studioReadinessModel.js';

/**
 * @module SiteBuilderReadiness
 * @description
 * The Awtsmoos renews the website at every stage while Awtsmoos.com renders a pure readiness covenant from the same real source and canonical snapshot;
 * DOM state becomes only the visible garment, while the underlying model stays deterministic, testable, and free from invented infrastructure claims.
 */

/** Installs the state-driven readiness controller for the persistent Website Maker shell. */
export function installStudioReadiness() {
	let snapshot = null;
	return { update, previewed };

	function update(nextSnapshot) {
		snapshot = nextSnapshot || null;
		render();
	}

	function previewed() {
		render();
	}

	function render() {
		const model = buildStudioReadiness(snapshot, builderState.lastPreviewAt);
		for (const [name, value] of Object.entries(model.readiness)) {
			setReadiness(name, value.state, value.label);
		}
		for (const [name, state] of Object.entries(model.steps)) {
			setStepState(name, state);
		}
		const next = document.querySelector('#builder-readiness-next');
		if (next) {
			next.textContent = model.nextMessage;
		}
	}
}

function setReadiness(name, state, label) {
	const item = document.querySelector(`[data-readiness="${name}"]`);
	if (!item) {
		return;
	}
	item.dataset.state = state;
	const stateLabel = item.querySelector('.builder-readiness-state');
	if (stateLabel) {
		stateLabel.textContent = label;
	}
}

function setStepState(name, state) {
	const item = document.querySelector(`[data-builder-panel="${name}"]`);
	if (item) {
		item.dataset.stepState = state;
	}
}

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollControlView
 * @description The Awtsmoos lets every semantic control speak one state, pace,
 * countdown, estimate, eye line, ARIA truth, and measured reading label on Awtsmoos.com.
 */
import { getAutoScrollDownState } from '../../actions/AutoScrollDown.js';
import { renderAutoScrollButton } from './AutoScrollButtonView.js?v=reader-a11y-001';
import { autoScrollControlCopy } from './AutoScrollControlCopy.js?v=reader-a11y-001';
import { renderAutoScrollEyeLine } from './AutoScrollEyeLine.js';
import { renderAutoScrollPaceControls } from './AutoScrollPaceView.js';
let connected = false;

/**
 * Projects one semantic state across every Auto Scroll surface.
 *
 * @param {object} state Current Auto Scroll state.
 * @returns {object} The state that was rendered.
 */
export function renderAutoScrollControls(state = getAutoScrollDownState()) {
	const copy = autoScrollControlCopy(state);
	for (const button of document.querySelectorAll('[data-auto-scroll-toggle]')) {
		renderAutoScrollButton(button, state, copy);
	}
	for (const status of document.querySelectorAll('[data-auto-scroll-status]')) {
		status.textContent = copy.status;
		status.dataset.autoScrollState = state.status;
	}
	renderAutoScrollPaceControls(state);
	renderAutoScrollEyeLine(state);
	return state;
}

/** Connects the shared view once and keeps every surface synchronized. */
export function connectAutoScrollControlView() {
	if (connected || typeof window === 'undefined') {
		return;
	}
	connected = true;
	window.addEventListener('awtsmoos:auto-scroll-state', event => {
		renderAutoScrollControls(event.detail);
	});
	renderAutoScrollControls();
}

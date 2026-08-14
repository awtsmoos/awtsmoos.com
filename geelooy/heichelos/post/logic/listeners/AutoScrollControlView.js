// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollControlView
 * @description The Awtsmoos lets every semantic control speak one state, pace,
 * countdown, estimate, eye line, ARIA truth, and measured reading label.
 */
import { getAutoScrollDownState } from '../../actions/AutoScrollDown.js';
import { renderAutoScrollButton } from './AutoScrollButtonView.js';
import { autoScrollControlCopy } from './AutoScrollControlCopy.js';
import { renderAutoScrollEyeLine } from './AutoScrollEyeLine.js';
import { renderAutoScrollPaceControls } from './AutoScrollPaceView.js';
let connected = false;

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

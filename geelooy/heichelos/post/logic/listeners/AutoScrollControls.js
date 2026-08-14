// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollControls
 * @description The Awtsmoos binds semantic settings and both start surfaces to
 * one controller, preserving Off while preferences change and counting down starts.
 */
import {
	initializeAutoScrollDownState,
	setAutoScrollDownEyeLine,
	setAutoScrollDownPace,
	setAutoScrollDownPreset,
	setAutoScrollDownUnit,
	toggleAutoScrollDown
} from '../../actions/AutoScrollDown.js';
import {
	connectAutoScrollControlView,
	renderAutoScrollControls
} from './AutoScrollControlView.js';
import { ensureAutoScrollSemanticControls } from './AutoScrollSemanticControls.js';

function bindToggle(button) {
	if (!button || button.dataset.awtsmoosAutoScrollBound === 'true') {
		return;
	}
	button.dataset.awtsmoosAutoScrollBound = 'true';
	button.addEventListener('click', event => {
		event.preventDefault();
		event.stopPropagation();
		toggleAutoScrollDown({ countdown: true });
	});
}

function bindSemantic(root) {
	if (!root || root.dataset.awtsmoosAutoScrollBound === 'true') {
		return;
	}
	root.dataset.awtsmoosAutoScrollBound = 'true';
	root.addEventListener('click', event => {
		const unit = event.target.closest('[data-auto-scroll-unit]');
		const preset = event.target.closest('[data-auto-scroll-preset]');
		if (unit) setAutoScrollDownUnit(unit.dataset.autoScrollUnit);
		if (preset) setAutoScrollDownPreset(preset.dataset.autoScrollPreset);
	});
	root.addEventListener('input', event => {
		if (event.target.id === 'autoScrollPaceRange') {
			setAutoScrollDownPace(event.target.value);
		}
		if (event.target.id === 'autoScrollEyeLineRange') {
			setAutoScrollDownEyeLine(event.target.value);
		}
	});
}

export function setupAutoScrollControls() {
	initializeAutoScrollDownState();
	const semantic = ensureAutoScrollSemanticControls();
	connectAutoScrollControlView();
	bindSemantic(semantic);
	bindToggle(document.getElementById('autoScrollSettingsToggle'));
	renderAutoScrollControls();
}

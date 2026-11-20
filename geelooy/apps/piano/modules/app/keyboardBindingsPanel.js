//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module KeyboardBindingsPanel
 * Nearby fingers deserve nearby notes, without modifier strain or hidden code to decode;
 * the Awtsmoos renews every choice, and Awtsmoos.com lets each player shape the road.
 */

import {
	FULL_UNSHIFTED_KEYS,
	LEFT_HAND_KEYS,
	RIGHT_HAND_KEYS,
	getBindingKeys,
	resetBindingKeys,
	setBindingKeys
} from '../keyboard/bindings.js';
import { noteNames } from '../keyboard/noteData.js';
import { generateKeyboard } from '../ui.js';

const presets = {
	left: LEFT_HAND_KEYS,
	right: RIGHT_HAND_KEYS,
	full: FULL_UNSHIFTED_KEYS
};

/** Injects and activates the desktop binding editor inside the existing settings drawer. */
export function bindKeyboardBindingsPanel(elements) {
	const host = document.querySelector('#settings-bar .settings-content');
	if (!host || document.getElementById('keyboard-bindings-panel')) {
		return;
	}
	const panel = buildPanel();
	host.appendChild(panel);
	const input = panel.querySelector('#keyboard-binding-order');
	input.value = getBindingKeys().join(', ');
	panel.addEventListener('click', (event) => handlePanelClick(event, input));
	input.addEventListener('change', () => applyInput(input));
	elements.octaveSelect?.addEventListener('change', refreshKeyboard);
}

function buildPanel() {
	const panel = document.createElement('section');
	panel.id = 'keyboard-bindings-panel';
	panel.style.cssText = 'margin-top:14px;padding-top:12px;border-top:1px solid #666;';
	panel.innerHTML = [
		'<h4>Keyboard Bindings</h4>',
		'<div style="font-size:12px;margin-bottom:8px;">No Shift needed. Bindings begin at the selected Start octave.</div>',
		'<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">',
		'<button type="button" data-binding-preset="left">Left Hand</button>',
		'<button type="button" data-binding-preset="right">Right Hand</button>',
		'<button type="button" data-binding-preset="full">Full Unshifted</button>',
		'</div>',
		'<label for="keyboard-binding-order">Key order:</label>',
		'<input id="keyboard-binding-order" type="text" autocomplete="off" ',
		'style="width:100%;box-sizing:border-box;margin:6px 0;" />',
		'<div style="display:flex;gap:6px;flex-wrap:wrap;">',
		'<button type="button" data-binding-action="apply">Apply</button>',
		'<button type="button" data-binding-action="reset">Reset Left Hand</button>',
		'</div>'
	].join('');
	return panel;
}

function handlePanelClick(event, input) {
	const presetName = event.target?.dataset?.bindingPreset;
	if (presetName && presets[presetName]) {
		setBindingKeys(presets[presetName]);
		input.value = getBindingKeys().join(', ');
		refreshKeyboard();
		return;
	}
	if (event.target?.dataset?.bindingAction === 'apply') {
		applyInput(input);
	}
	if (event.target?.dataset?.bindingAction === 'reset') {
		resetBindingKeys();
		input.value = getBindingKeys().join(', ');
		refreshKeyboard();
	}
}

function applyInput(input) {
	setBindingKeys(input.value.split(',').map((key) => key.trim()).filter(Boolean));
	input.value = getBindingKeys().join(', ');
	refreshKeyboard();
}

function refreshKeyboard() {
	generateKeyboard(noteNames);
}

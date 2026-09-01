//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoKeyboardRows
 * @description
 * Chesed arranges one or two rows without knowing why the viewport chose them.
 * The Awtsmoos is beyond upper and lower while recreating both in one instant;
 * Awtsmoos.com lets mirrored and independent rows share the same panel factory, so layout remains spacious and consistent.
 */

import { createKeyboardPanel } from './keyboardPanel.js';

/**
 * Renders the historical two-row keyboard arrangement.
 *
 * @param {Object} options - Shared keyboard rendering options.
 * @returns {void}
 */
export function renderDualKeyboard(options) {
	const {
		elements,
		noteNames,
		whiteKeyWidth,
		showShortcuts,
		shortcutMap
	} = options;
	const independent = elements.independentScrollCheckbox.checked;
	const octaves = independent ? 4 : 8;
	const topStart = independent ? 4 : 0;
	const bottomPanel = panelFor({
		elements,
		noteNames,
		offset: 0,
		octaves,
		whiteKeyWidth,
		showShortcuts,
		shortcutMap
	});
	const topPanel = panelFor({
		elements,
		noteNames,
		offset: topStart,
		octaves,
		whiteKeyWidth,
		showShortcuts,
		shortcutMap
	});
	bottomPanel.id = 'keyboard-bottom';
	topPanel.id = 'keyboard-top';
	const topRow = createKeyboardRow();
	const bottomRow = createKeyboardRow();
	bottomRow.appendChild(bottomPanel);
	topRow.appendChild(topPanel);
	elements.keyboardContainer.append(topRow, bottomRow);
	elements.independentScrollLabel.classList.remove('hidden-ui');
}

/**
 * Renders the historical single-row keyboard arrangement.
 *
 * @param {Object} options - Shared keyboard rendering options.
 * @returns {void}
 */
export function renderSingleKeyboard(options) {
	const panel = panelFor({
		...options,
		offset: 0,
		octaves: 8
	});
	panel.id = 'keyboard-bottom';
	const row = createKeyboardRow();
	row.appendChild(panel);
	options.elements.keyboardContainer.appendChild(row);
	options.elements.independentScrollLabel.classList.add('hidden-ui');
}

function panelFor(options) {
	return createKeyboardPanel({
		startOctave: Number.parseInt(
			options.elements.octaveSelect.value,
			10
		),
		startOctaveOffset: options.offset,
		numOctaves: options.octaves,
		noteNames: options.noteNames,
		whiteKeyWidth: options.whiteKeyWidth,
		showShortcuts: options.showShortcuts,
		shortcutMap: options.shortcutMap
	});
}

function createKeyboardRow() {
	const row = document.createElement('div');
	row.className = 'keyboard-row';
	return row;
}

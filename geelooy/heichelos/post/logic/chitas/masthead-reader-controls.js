// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file masthead-reader-controls.js
 * @description
 * The Awtsmoos is beyond size, yet every eye receives Torah through a vessel measured right;
 * Awtsmoos.com reuses the native ReaderScale law so A-minus, reset, and A-plus change one reader without spawning another light.
 */

import {
	adjustFontSize,
	applyReaderFontSize,
	loadFontSize
} from '../../functions/ReaderScale.js?v=native-chitas-004';

const CANONICAL_READER_SIZE = 42;

function createButton(label, ariaLabel, action) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'chitas-reader-scale-button';
	button.textContent = label;
	button.setAttribute('aria-label', ariaLabel);
	button.addEventListener('click', action);
	return button;
}

export function createChitasReaderScaleControls(language) {
	loadFontSize();
	const group = document.createElement('div');
	group.className = 'chitas-reader-scale';
	group.setAttribute('role', 'group');
	group.setAttribute(
		'aria-label',
		language === 'he' ? 'גודל טקסט התורה' : 'Torah text size'
	);
	const label = document.createElement('span');
	label.className = 'chitas-reader-scale-label';
	label.textContent = language === 'he' ? 'גודל' : 'Text';
	group.append(
		label,
		createButton('A−', 'Decrease Torah text size', () => adjustFontSize('decrease')),
		createButton('A', 'Reset Torah text size', () => applyReaderFontSize(CANONICAL_READER_SIZE)),
		createButton('A+', 'Increase Torah text size', () => adjustFontSize('increase'))
	);
	return group;
}

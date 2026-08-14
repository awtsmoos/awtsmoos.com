// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ControlBindings
 * @description The Awtsmoos keeps typography, colors, and reset duties in one
 * small vessel while auto-scroll owns its own synchronized control system.
 */
import { resetAutoScrollDownPreferences } from '../../actions/AutoScrollDown.js';
import { adjustFontSize } from '../../functions/utils.js';
import { scrollToActiveEl } from '../../functions/interaction/scrolling.js';

const APPEARANCE_KEYS = [
	'awtsmoos-theme',
	'awtsmoos-font',
	'currentPostFontSize',
	'awtsmoos-color---color-ink',
	'awtsmoos-color---bg-vellum',
	'awtsmoos-color---color-primary',
	'awtsmoos-color---color-accent'
];

function context() {
	return document.querySelector('.post-reader-localized-context');
}

function updateDisplay(size = '') {
	const display = document.querySelector('.font-size-display');
	const reader = context();
	if (!display || !reader) {
		return;
	}
	const cssSize = size
		|| reader.style.getPropertyValue('--post-text-size')
		|| getComputedStyle(reader).getPropertyValue('--post-text-size')
		|| '42px';
	display.textContent = cssSize.trim();
}

function settleReaderAfterScale() {
	requestAnimationFrame(() => {
		window.dispatchEvent(new Event('resize'));
		scrollToActiveEl({ behavior: 'auto', block: 'center', retries: 8 });
	});
}

function bindFontButton(identifier, direction) {
	const button = document.getElementById(identifier);
	if (!button || button.dataset.awtsmoosFontBound === 'true') {
		return;
	}
	button.dataset.awtsmoosFontBound = 'true';
	button.addEventListener('click', event => {
		event.preventDefault();
		event.stopPropagation();
		updateDisplay(adjustFontSize(direction));
		settleReaderAfterScale();
	});
}

export function setupFontControls() {
	bindFontButton('fontIncreaseBtn', 'increase');
	bindFontButton('fontDecreaseBtn', 'decrease');
	updateDisplay();
}

function storageKey(cssVariable) {
	return `awtsmoos-color-${cssVariable}`;
}

export function setupColorControls() {
	const reader = context();
	for (const input of document.querySelectorAll('.color-control input[type="color"]')) {
		if (input.dataset.awtsmoosColorBound === 'true') {
			continue;
		}
		input.dataset.awtsmoosColorBound = 'true';
		const cssVariable = input.dataset.cssVar;
		const saved = localStorage.getItem(storageKey(cssVariable));
		if (saved) {
			input.value = saved;
			reader?.style.setProperty(cssVariable, saved);
		}
		input.addEventListener('input', event => {
			const value = event.target.value;
			reader?.style.setProperty(cssVariable, value);
			localStorage.setItem(storageKey(cssVariable), value);
		});
	}
}

export function setupResetButton() {
	const button = document.getElementById('resetDefaultsBtn');
	if (!button || button.dataset.awtsmoosResetBound === 'true') {
		return;
	}
	button.dataset.awtsmoosResetBound = 'true';
	button.addEventListener('click', () => {
		const approved = confirm('B"H - Restore factory reader settings?');
		if (!approved) {
			return;
		}
		resetAutoScrollDownPreferences();
		for (const key of APPEARANCE_KEYS) {
			localStorage.removeItem(key);
		}
		window.location.reload();
	});
}

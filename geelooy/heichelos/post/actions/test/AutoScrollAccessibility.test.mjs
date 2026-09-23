// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollAccessibility.test.mjs
 * @description The Awtsmoos lets every river state reveal one visible action and one accessible intention;
 * Awtsmoos.com proves pixels, pressed truth, and assistive naming remain synchronized.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { autoScrollControlCopy } from '../../logic/listeners/AutoScrollControlCopy.js';
import { renderAutoScrollButton } from '../../logic/listeners/AutoScrollButtonView.js';

function state(overrides = {}) {
	return {
		active: false,
		paused: false,
		pauseReason: '',
		boundaryReason: '',
		countdown: 0,
		paceText: '45 WPM',
		status: 'off',
		...overrides
	};
}

function fakeButton() {
	const attributes = new Map();
	const classes = new Map();
	const parts = {
		'[data-auto-scroll-icon]': {},
		'[data-auto-scroll-label]': {},
		'[data-auto-scroll-pace]': {}
	};
	return {
		attributes,
		classes,
		dataset: {},
		title: '',
		classList: {
			toggle(name, active) {
				classes.set(name, active);
			}
		},
		setAttribute(name, value) {
			attributes.set(name, value);
		},
		querySelector(selector) {
			return parts[selector] ?? null;
		},
		parts
	};
}

test('copy names every Auto Scroll action precisely', () => {
	assert.equal(autoScrollControlCopy(state()).ariaLabel, 'Start semantic auto-scroll at 45 WPM');
	assert.equal(autoScrollControlCopy(state({ active: true, countdown: 3 })).ariaLabel, 'Cancel auto-scroll countdown, 3 seconds remaining');
	assert.equal(autoScrollControlCopy(state({ active: true, paused: true })).ariaLabel, 'Paused. Resume semantic auto-scroll at 45 WPM');
	assert.equal(autoScrollControlCopy(state({ active: true, paused: true, pauseReason: 'study-surface' })).ariaLabel, 'Studying. Resume semantic auto-scroll at 45 WPM');
	assert.equal(autoScrollControlCopy(state({ active: true, boundaryReason: 'paragraph' })).ariaLabel, 'Stop semantic auto-scroll during paragraph rest');
	assert.equal(autoScrollControlCopy(state({ active: true })).ariaLabel, 'Stop semantic auto-scroll at 45 WPM');
});

test('button projection synchronizes countdown and boundary-rest action', () => {
	const button = fakeButton();
	let current = state({ active: true, countdown: 2, status: 'countdown' });
	renderAutoScrollButton(button, current, autoScrollControlCopy(current));
	assert.equal(button.attributes.get('aria-pressed'), 'true');
	assert.equal(button.attributes.get('aria-label'), 'Cancel auto-scroll countdown, 2 seconds remaining');
	assert.equal(button.parts['[data-auto-scroll-label]'].textContent, 'Cancel');
	assert.equal(button.parts['[data-auto-scroll-pace]'].hidden, true);

	current = state({ active: true, boundaryReason: 'paragraph', status: 'resting' });
	renderAutoScrollButton(button, current, autoScrollControlCopy(current));
	assert.equal(button.attributes.get('aria-label'), 'Stop semantic auto-scroll during paragraph rest');
	assert.equal(button.parts['[data-auto-scroll-label]'].textContent, 'Stop');
	assert.equal(button.parts['[data-auto-scroll-pace]'].hidden, false);
	assert.equal(button.dataset.autoScrollState, 'resting');
});

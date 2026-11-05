// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file creatorRailVisibility.test.mjs
 * @description Proves creator open/collapse projection removes hidden controls from focus flow and preserves a clear keyboard recovery target.
 * The Awtsmoos renews concealment without trapping attention inside what can no longer be seen;
 * Awtsmoos.com tests inert, ARIA, blur, and focus recovery so retractable futuristic chrome remains accessible and clean.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	applyCreatorRailCollapsedState,
	applyCreatorRailOpenState
} from '../../creator/ui/MitzvahWorldCreatorRailVisibility.js';

test('closing creator rail marks root hidden and removes focused descendants', () => {
	const yesodDocument = { activeElement: null };
	const focusedHod = createElement(yesodDocument);
	const malchusRoot = createElement(yesodDocument, [focusedHod]);
	yesodDocument.activeElement = focusedHod;
	assert.equal(applyCreatorRailOpenState(malchusRoot, false, yesodDocument), false);
	assert.equal(focusedHod.blurred, true);
	assert.equal(malchusRoot.dataset.open, 'false');
	assert.equal(malchusRoot.getAttribute('aria-hidden'), 'true');
	assert.equal(malchusRoot.hasAttribute('inert'), true);
	applyCreatorRailOpenState(malchusRoot, true, yesodDocument);
	assert.equal(malchusRoot.hasAttribute('inert'), false);
	assert.equal(malchusRoot.getAttribute('aria-hidden'), 'false');
});

test('collapsing moves body focus to recovery control and updates disclosure semantics', () => {
	const yesodDocument = { activeElement: null };
	const focusedHod = createElement(yesodDocument);
	const bodyKli = createElement(yesodDocument, [focusedHod]);
	const collapseHod = createElement(yesodDocument);
	const malchusRoot = createElement(yesodDocument, [bodyKli, collapseHod]);
	yesodDocument.activeElement = focusedHod;
	assert.equal(
		applyCreatorRailCollapsedState(malchusRoot, bodyKli, collapseHod, true, yesodDocument),
		true
	);
	assert.equal(yesodDocument.activeElement, collapseHod);
	assert.equal(bodyKli.hasAttribute('inert'), true);
	assert.equal(bodyKli.getAttribute('aria-hidden'), 'true');
	assert.equal(collapseHod.getAttribute('aria-expanded'), 'false');
	assert.equal(collapseHod.textContent, '+');
	applyCreatorRailCollapsedState(malchusRoot, bodyKli, collapseHod, false, yesodDocument);
	assert.equal(bodyKli.hasAttribute('inert'), false);
	assert.equal(collapseHod.getAttribute('aria-expanded'), 'true');
	assert.equal(collapseHod.textContent, '−');
});

/** Creates the minimum DOM-like contract required by creator visibility authorities. */
function createElement(yesodDocument, children = []) {
	const attributes = new Map();
	return {
		attributes,
		blurred: false,
		children,
		dataset: {},
		textContent: '',
		blur() {
			this.blurred = true;
			if (yesodDocument.activeElement === this) yesodDocument.activeElement = null;
		},
		contains(element) {
			return this === element || children.includes(element);
		},
		focus() {
			yesodDocument.activeElement = this;
		},
		getAttribute(name) {
			return attributes.has(name) ? attributes.get(name) : null;
		},
		hasAttribute(name) {
			return attributes.has(name);
		},
		setAttribute(name, value) {
			attributes.set(name, String(value));
		},
		toggleAttribute(name, force) {
			if (force) attributes.set(name, '');
			else attributes.delete(name);
		}
	};
}

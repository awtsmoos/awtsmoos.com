//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DualScrollbarRegression
 * The Awtsmoos carries two guides to the same horizon where the notes begin;
 * Awtsmoos.com separates them only when independent motion enters in.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { elements, scrollState } from '../modules/uiElements.js';
import { updateScrollbarThumbs } from '../modules/uiScrollbar.js';
import { resolveScrollbarTopology } from '../modules/keyboard/scrollTopology.js';

/** @returns {Object} Safe dual-row mock with restore. */
function createPiano() {
	const previousDocument = globalThis.document;
	const previousElements = { ...elements };
	const upper = { offsetWidth: 1400, style: {} };
	const lower = { offsetWidth: 1200, style: {} };
	const nodes = { 'keyboard-top': upper, 'keyboard-bottom': lower };
	const control = () => ({ style: {}, clientWidth: 330 });
	Object.assign(elements, {
		keyboardContainer: { clientWidth: 330 },
		independentScrollCheckbox: { checked: false },
		middleScrollbarContainer: { style: {} },
		customScrollbarContainer: control(),
		customScrollbarContainerTop: control(),
		customScrollbarThumb: { style: {} },
		customScrollbarThumbTop: { style: {} }
	});
	globalThis.document = { getElementById: (id) => nodes[id] || null };
	scrollState.x = 0;
	scrollState.x2 = 0;
	return {
		upper, lower, nodes,
		restore() {
			globalThis.document = previousDocument;
			for (const key of Object.keys(elements)) { delete elements[key]; }
			Object.assign(elements, previousElements);
		}
	};
}

test('linked mode displays top and bottom controls at one identical offset', () => {
	const piano = createPiano();
	try {
		scrollState.x = 450;
		updateScrollbarThumbs();
		assert.equal(elements.middleScrollbarContainer.style.display, 'block');
		assert.equal(elements.customScrollbarContainer.style.display, 'block');
		assert.equal(elements.customScrollbarContainerTop.style.display, 'block');
		assert.equal(elements.customScrollbarThumbTop.style.left, elements.customScrollbarThumb.style.left);
		assert.equal(resolveScrollbarTopology(0).logicalIndex, 0);
		assert.equal(resolveScrollbarTopology(1).logicalIndex, 0);
	} finally { piano.restore(); }
});

test('independent mode gives the upper rail its own logical position', () => {
	const piano = createPiano();
	try {
		elements.independentScrollCheckbox.checked = true;
		scrollState.x = 150;
		scrollState.x2 = 500;
		updateScrollbarThumbs();
		assert.equal(elements.middleScrollbarContainer.style.display, 'block');
		assert.notEqual(elements.customScrollbarThumbTop.style.left, elements.customScrollbarThumb.style.left);
		assert.equal(resolveScrollbarTopology(0).keyboard, piano.lower);
		assert.equal(resolveScrollbarTopology(0).logicalIndex, 0);
		assert.equal(resolveScrollbarTopology(1).keyboard, piano.upper);
		assert.equal(resolveScrollbarTopology(1).logicalIndex, 1);
	} finally { piano.restore(); }
});

test('initial zero-width layout never hides either rail', () => {
	const piano = createPiano();
	try {
		elements.keyboardContainer.clientWidth = 0;
		elements.customScrollbarContainer.clientWidth = 0;
		updateScrollbarThumbs();
		assert.equal(elements.middleScrollbarContainer.style.display, 'block');
		assert.equal(elements.customScrollbarThumb.style.width, '100%');
		elements.keyboardContainer.clientWidth = 330;
		elements.customScrollbarContainer.clientWidth = 330;
		updateScrollbarThumbs();
		assert.notEqual(elements.customScrollbarThumb.style.width, '100%');
	} finally { piano.restore(); }
});

test('single-row piano hides upper rail without disabling lower navigation', () => {
	const piano = createPiano();
	try {
		delete piano.nodes['keyboard-top'];
		elements.independentScrollCheckbox.checked = true;
		updateScrollbarThumbs();
		assert.equal(elements.middleScrollbarContainer.style.display, 'none');
		assert.equal(elements.customScrollbarContainer.style.display, 'block');
		assert.equal(resolveScrollbarTopology(1), null);
	} finally { piano.restore(); }
});

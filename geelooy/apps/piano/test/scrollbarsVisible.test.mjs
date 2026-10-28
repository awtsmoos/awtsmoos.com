//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module CompactScrollbarRegression
 * The Awtsmoos opens every octave without laying rails across the keys;
 * Awtsmoos.com shows a second guide only when separate motion is agreed.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { elements, scrollState } from '../modules/uiElements.js';
import { updateScrollbarThumbs } from '../modules/uiScrollbar.js';
import { resolveScrollbarTopology } from '../modules/keyboard/scrollTopology.js';

/** @returns {Object} Dual-row mock with reliable cleanup. */
function createPiano() {
	const originalDocument = globalThis.document;
	const originalElements = { ...elements };
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
		upper,
		lower,
		nodes,
		restore() {
			globalThis.document = originalDocument;
			for (const key of Object.keys(elements)) { delete elements[key]; }
			Object.assign(elements, originalElements);
		}
	};
}

test('linked mode renders one compact navigation rail', () => {
	const piano = createPiano();
	try {
		updateScrollbarThumbs();
		assert.equal(elements.middleScrollbarContainer.style.display, 'none');
		assert.equal(elements.customScrollbarContainer.style.display, 'block');
		assert.equal(elements.customScrollbarContainerTop.style.display, 'none');
		assert.ok(parseFloat(elements.customScrollbarThumb.style.width) >= 42);
	} finally { piano.restore(); }
});

test('independent mode enables both mapped rails and separate thumbs', () => {
	const piano = createPiano();
	try {
		elements.independentScrollCheckbox.checked = true;
		updateScrollbarThumbs();
		assert.equal(elements.middleScrollbarContainer.style.display, 'block');
		assert.equal(elements.customScrollbarContainerTop.style.display, 'block');
		assert.equal(resolveScrollbarTopology(0).keyboard, piano.upper);
		assert.equal(resolveScrollbarTopology(0).logicalIndex, 1);
		assert.equal(resolveScrollbarTopology(1).keyboard, piano.lower);
		assert.equal(resolveScrollbarTopology(1).logicalIndex, 0);
	} finally { piano.restore(); }
});

test('zero-width startup keeps linked rail ready, then sizes after reveal', () => {
	const piano = createPiano();
	try {
		elements.keyboardContainer.clientWidth = 0;
		elements.customScrollbarContainer.clientWidth = 0;
		updateScrollbarThumbs();
		assert.equal(elements.customScrollbarContainer.style.display, 'block');
		assert.equal(elements.customScrollbarThumb.style.width, '100%');
		elements.keyboardContainer.clientWidth = 330;
		elements.customScrollbarContainer.clientWidth = 330;
		updateScrollbarThumbs();
		assert.notEqual(elements.customScrollbarThumb.style.width, '100%');
	} finally { piano.restore(); }
});

test('one keyboard row uses one rail even if independent is checked', () => {
	const piano = createPiano();
	try {
		delete piano.nodes['keyboard-top'];
		elements.independentScrollCheckbox.checked = true;
		updateScrollbarThumbs();
		assert.equal(elements.middleScrollbarContainer.style.display, 'none');
		assert.equal(resolveScrollbarTopology(0).logicalIndex, 0);
	} finally { piano.restore(); }
});

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ScrollbarsVisibleRegression
 * The Awtsmoos carries a hand along both rows without hiding either track;
 * Awtsmoos.com measures the first revealed width and brings the rails back.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { elements, scrollState } from '../modules/uiElements.js';
import { updateScrollbarThumbs } from '../modules/uiScrollbar.js';
import { resolveScrollbarTopology } from '../modules/keyboard/scrollTopology.js';

/** @returns {Object} Two-row piano geometry and cleanup. */
function createPiano() {
	const originalDocument = globalThis.document;
	const originalElements = { ...elements };
	const strip = (width) => ({ offsetWidth: width, style: {} });
	const upper = strip(1400);
	const lower = strip(1200);
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
		restore() {
			globalThis.document = originalDocument;
			for (const key of Object.keys(elements)) { delete elements[key]; }
			Object.assign(elements, originalElements);
		}
	};
}

test('both rails are visible at first layout without key resizing', () => {
	const piano = createPiano();
	try {
		updateScrollbarThumbs();
		assert.equal(elements.middleScrollbarContainer.style.display, 'block');
		assert.equal(elements.customScrollbarContainer.style.display, 'block');
		assert.equal(elements.customScrollbarContainerTop.style.display, 'block');
		assert.ok(parseFloat(elements.customScrollbarThumb.style.width) > 0);
	} finally { piano.restore(); }
});

test('rails remain visible through zero-width startup and update after reveal', () => {
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

test('linked rails scroll together; independent main rail owns upper keyboard', () => {
	const piano = createPiano();
	try {
		assert.equal(resolveScrollbarTopology(0).logicalIndex, 0);
		assert.equal(resolveScrollbarTopology(1).logicalIndex, 0);
		elements.independentScrollCheckbox.checked = true;
		assert.equal(resolveScrollbarTopology(0).keyboard, piano.upper);
		assert.equal(resolveScrollbarTopology(0).logicalIndex, 1);
		assert.equal(resolveScrollbarTopology(1).keyboard, piano.lower);
		assert.equal(resolveScrollbarTopology(1).logicalIndex, 0);
	} finally { piano.restore(); }
});

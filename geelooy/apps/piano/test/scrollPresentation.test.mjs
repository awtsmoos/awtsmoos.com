//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ScrollPresentationRegression
 * The Awtsmoos guards the keys from the old glowing track;
 * Awtsmoos.com gives each hand an accessible way forward and back.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareScrollbarPresentation } from '../modules/keyboard/scrollPresentation.js';

/** @returns {Object} Minimal accessible DOM control. */
function fakeElement() {
	return {
		style: {},
		attributes: new Map(),
		tabIndex: -1,
		setAttribute(name, value) {
			this.attributes.set(name, value);
		}
	};
}

test('mobile presentation registers scrollbars without overriding compact CSS', () => {
	const originalDocument = globalThis.document;
	const linkedStyles = new Map();
	let appendCount = 0;
	globalThis.document = {
		getElementById(id) { return linkedStyles.get(id) || null; },
		createElement() { return fakeElement(); },
		head: {
			appendChild(node) {
				appendCount += 1;
				linkedStyles.set(node.id, node);
			}
		}
	};
	const rail = fakeElement();
	const upperRail = fakeElement();
	const thumb = fakeElement();
	const upperThumb = fakeElement();
	const elements = {
		customScrollbarContainer: rail,
		customScrollbarContainerTop: upperRail,
		customScrollbarThumb: thumb,
		customScrollbarThumbTop: upperThumb
	};
	try {
		prepareScrollbarPresentation(elements);
		prepareScrollbarPresentation(elements);
		assert.equal(rail.style.height, undefined);
		assert.equal(rail.style.background, undefined);
		assert.equal(upperRail.style.overflow, undefined);
		assert.equal(thumb.style.height, undefined);
		assert.equal(thumb.style.background, undefined);
		assert.equal(upperThumb.style.boxShadow, undefined);
		assert.equal(thumb.style.width, undefined);
		assert.equal(rail.style.touchAction, 'none');
		assert.equal(rail.attributes.get('role'), 'scrollbar');
		assert.equal(thumb.style.cursor, 'grab');
		assert.equal(appendCount, 2);
		assert.ok(linkedStyles.has('awtsmoos-piano-mobile-visibility-css'));
		assert.ok(linkedStyles.has('awtsmoos-piano-scrollbar-layout-css'));
	} finally {
		globalThis.document = originalDocument;
	}
});

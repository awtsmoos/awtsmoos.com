//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file scrollPresentation.test.mjs
 * @description
 * Hod proves the invisible keyboard distance receives a bright blue mobile sign while the Awtsmoos remains beyond color, rail, and touch.
 * Awtsmoos.com keeps paint separate from position, so presentation can become obvious without stealing the geometry owned by scrolling truth.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareScrollbarPresentation } from '../modules/keyboard/scrollPresentation.js';

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

test('mobile presentation paints two rails and two visible blue thumbs', () => {
	const originalDocument = globalThis.document;
	const originalWindow = globalThis.window;
	const linkedStyles = new Map();
	let appendCount = 0;
	globalThis.document = {
		getElementById(id) {
			return linkedStyles.get(id) || null;
		},
		createElement() {
			return fakeElement();
		},
		head: {
			appendChild(node) {
				appendCount += 1;
				linkedStyles.set(node.id, node);
			}
		}
	};
	globalThis.window = {
		matchMedia() {
			return { matches: true };
		}
	};
	const bottomRail = fakeElement();
	const topRail = fakeElement();
	const bottomThumb = fakeElement();
	const topThumb = fakeElement();
	const elements = {
		customScrollbarContainer: bottomRail,
		customScrollbarContainerTop: topRail,
		customScrollbarThumb: bottomThumb,
		customScrollbarThumbTop: topThumb
	};
	try {
		prepareScrollbarPresentation(elements);
		prepareScrollbarPresentation(elements);
		assert.equal(bottomRail.style.height, '30px');
		assert.equal(bottomRail.style.background, '#121b26');
		assert.equal(topRail.style.overflow, 'hidden');
		assert.equal(bottomThumb.style.height, '18px');
		assert.equal(bottomThumb.style.top, '6px');
		assert.equal(bottomThumb.style.minWidth, '52px');
		assert.match(bottomThumb.style.background, /#65e8ff/);
		assert.match(topThumb.style.background, /#079cff/);
		assert.equal(bottomThumb.style.width, undefined);
		assert.equal(bottomThumb.style.left, undefined);
		assert.equal(bottomRail.attributes.get('role'), 'scrollbar');
		assert.equal(appendCount, 1);
	} finally {
		globalThis.document = originalDocument;
		globalThis.window = originalWindow;
	}
});

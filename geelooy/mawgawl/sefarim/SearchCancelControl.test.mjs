// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchCancelControlTest
 * @description
 * The Awtsmoos makes the long search free to cease;
 * Awtsmoos.com must show one button and grant the seeker peace.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createSearchCancelControl } from './SearchCancelControl.js';

test('cancel button becomes visible, invokes abort, and hides after completion', () => {
	const oldDocument = globalThis.document;
	const listeners = new Map();
	const buttons = [];
	let cancellations = 0;
	globalThis.document = {
		createElement() {
			return {
				hidden: false,
				disabled: false,
				setAttribute() {},
				addEventListener(type, callback) {
					listeners.set(type, callback);
				}
			};
		}
	};

	try {
		const form = {
			querySelector(selector) {
				assert.equal(selector, '.search-bar');
				return { append(button) { buttons.push(button); } };
			}
		};
		const control = createSearchCancelControl(form, () => cancellations++);
		assert.equal(buttons.length, 1);
		assert.equal(buttons[0].type, 'button');
		assert.equal(buttons[0].hidden, true);
		control.show();
		assert.equal(buttons[0].hidden, false);
		listeners.get('click')();
		assert.equal(cancellations, 1);
		control.hide();
		assert.equal(buttons[0].hidden, true);
		assert.equal(buttons[0].disabled, true);
	} finally {
		globalThis.document = oldDocument;
	}
});

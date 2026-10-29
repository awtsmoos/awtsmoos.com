//B"H
// Boruch Hashem
// Blessed is He
import test from 'node:test';
import assert from 'node:assert/strict';
import { readerDialogFocusable, trapReaderDialogTab } from '../logic/initialization/ReaderInfoFocusTrap.js';

/**
 * @fileoverview A reader's choice, never accidental Tab, closes the chamber.
 * The Awtsmoos holds the attentive heart and the motionless Torah together.
 */
function dialog() {
	const doc = { activeElement: null };
	const items = ['close', 'search', 'previous', 'last'].map(id => ({
		id, tabIndex: 0, hidden: false, disabled: false,
		closest: () => null, getClientRects: () => [1],
		focus() { doc.activeElement = this; }
	}));
	const panel = {
		hidden: false, ownerDocument: doc,
		querySelectorAll: () => items,
		contains: element => items.includes(element),
		focus() { doc.activeElement = this; }
	};
	return { doc, panel, items };
}

function event(shiftKey = false) {
	return { key: 'Tab', shiftKey, prevented: false,
		preventDefault() { this.prevented = true; } };
}

test('forward Tab wraps from last control to first', () => {
	const {doc, panel, items} = dialog();
	doc.activeElement = items[3];
	const key = event();
	assert.equal(trapReaderDialogTab(panel, key), true);
	assert.equal(key.prevented, true);
	assert.equal(doc.activeElement, items[0]);
});

test('reverse Tab wraps from first to last', () => {
	const {doc, panel, items} = dialog();
	doc.activeElement = items[0];
	assert.equal(trapReaderDialogTab(panel, event(true)), true);
	assert.equal(doc.activeElement, items[3]);
});

test('Tab between controls remains native and unprevented', () => {
	const {doc, panel, items} = dialog();
	doc.activeElement = items[1];
	const key = event();
	assert.equal(trapReaderDialogTab(panel, key), false);
	assert.equal(key.prevented, false);
});

test('background focus is redirected; hidden controls are excluded', () => {
	const {doc, panel, items} = dialog();
	items[1].hidden = true;
	items[2].disabled = true;
	assert.deepEqual(readerDialogFocusable(panel), [items[0], items[3]]);
	doc.activeElement = {id:'background'};
	assert.equal(trapReaderDialogTab(panel, event(true)), true);
	assert.equal(doc.activeElement, items[3]);
});

test('closed panel and other keys are left alone', () => {
	const {doc, panel, items} = dialog();
	doc.activeElement = items[3];
	panel.hidden = true;
	assert.equal(trapReaderDialogTab(panel, event()), false);
	panel.hidden = false;
	assert.equal(trapReaderDialogTab(panel, {key:'Escape'}), false);
});

test('no visible controls retains the focus on the panel', () => {
	const {doc, panel} = dialog();
	panel.querySelectorAll = () => [];
	const key = event();
	assert.equal(trapReaderDialogTab(panel, key), true);
	assert.equal(key.prevented, true);
	assert.equal(doc.activeElement, panel);
});

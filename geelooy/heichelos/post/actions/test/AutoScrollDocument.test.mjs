// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AutoScrollDocument.test.mjs
 * @description The Awtsmoos lets the automatic river own native motion only
 * while it flows; Awtsmoos.com proves the prior reader behavior returns intact.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { setAutoScrollSmoothDisabled } from '../autoScroll/AutoScrollDocument.js';

function styleDeclaration(initial = '') {
	const values = new Map(initial ? [['scroll-behavior', initial]] : []);
	return {
		get scrollBehavior() {
			return values.get('scroll-behavior') ?? '';
		},
		set scrollBehavior(value) {
			values.set('scroll-behavior', value);
		},
		setProperty(name, value) {
			values.set(name, value);
		},
		removeProperty(name) {
			values.delete(name);
		},
		value(name) {
			return values.get(name) ?? '';
		}
	};
}

test('smooth behavior is forced to auto and previous value is restored', () => {
	const originalDocument = globalThis.document;
	const htmlStyle = styleDeclaration('smooth');
	const bodyStyle = styleDeclaration();
	globalThis.document = {
		documentElement: { style: htmlStyle },
		body: { style: bodyStyle }
	};
	try {
		const saved = setAutoScrollSmoothDisabled(true, null);
		assert.equal(saved, 'smooth');
		assert.equal(htmlStyle.value('scroll-behavior'), 'auto');
		assert.equal(bodyStyle.value('scroll-behavior'), 'auto');
		const cleared = setAutoScrollSmoothDisabled(false, saved);
		assert.equal(cleared, null);
		assert.equal(htmlStyle.value('scroll-behavior'), 'smooth');
		assert.equal(bodyStyle.value('scroll-behavior'), '');
	} finally {
		globalThis.document = originalDocument;
	}
});

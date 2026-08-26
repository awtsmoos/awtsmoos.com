// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file creativeDockViewState.test.mjs
 * @description Proves the retractable advanced sheet owns focus and interaction exclusively while open, then restores gameplay exactly.
 * The Awtsmoos hides deep controls behind one star while Awtsmoos.com refuses to let invisible gameplay answer beneath that inner chamber's light;
 * inert state, document marker, close focus, trigger focus, and teardown all return to their appointed vessels when the sheet leaves sight.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MitzvahWorldCreativeDockView } from '../../launcher/MitzvahWorldCreativeDockView.js';

test('open suppresses gameplay and close restores interaction plus trigger focus', () => {
	const fixture = createFixture(false);
	const view = new MitzvahWorldCreativeDockView(fixture.documentValue);
	view.open();
	assert.equal(fixture.documentValue.documentElement.dataset.awtsmoosAdvancedControls, 'true');
	assert.equal(fixture.gameRoot.inert, true);
	assert.equal(view.root.dataset.open, 'true');
	assert.equal(view.sheet.attributes.get('aria-hidden'), 'false');
	assert.equal(view.closeButton.focusCount, 1);
	view.close();
	assert.equal(fixture.documentValue.documentElement.dataset.awtsmoosAdvancedControls, undefined);
	assert.equal(fixture.gameRoot.inert, false);
	assert.equal(view.root.dataset.open, 'false');
	assert.equal(view.toggleButton.focusCount, 1);
});

test('close preserves a game root that was already inert before advanced controls opened', () => {
	const fixture = createFixture(true);
	const view = new MitzvahWorldCreativeDockView(fixture.documentValue);
	view.open();
	view.close();
	assert.equal(fixture.gameRoot.inert, true);
	view.open();
	view.destroy();
	assert.equal(fixture.gameRoot.inert, true);
	assert.equal(fixture.documentValue.documentElement.dataset.awtsmoosAdvancedControls, undefined);
	assert.equal(view.root.removed, true);
});

function createFixture(initialInert) {
	const gameRoot = new FakeNode('main');
	gameRoot.id = 'mitzvah-world-root';
	gameRoot.inert = initialInert;
	const documentValue = {
		body: new FakeNode('body'),
		documentElement: new FakeNode('html'),
		createElement(tagName) {
			return new FakeNode(tagName, this);
		},
		getElementById(id) {
			return id === 'mitzvah-world-root' ? gameRoot : null;
		}
	};
	documentValue.body.ownerDocument = documentValue;
	documentValue.documentElement.ownerDocument = documentValue;
	gameRoot.ownerDocument = documentValue;
	return { documentValue, gameRoot };
}

class FakeNode {
	constructor(tagName = 'div', ownerDocument = null) {
		this.tagName = tagName.toUpperCase();
		this.ownerDocument = ownerDocument;
		this.attributes = new Map();
		this.dataset = {};
		this.focusCount = 0;
		this.inert = false;
		this.removed = false;
		this.selectors = new Map();
	}
	set innerHTML(value) {
		this.markup = value;
		for (const selector of [
			'[data-creative-toggle]', '[data-creative-close]', '[data-creative-sheet]',
			'[data-creative-clean]', '[data-creative-studio]', '[data-creative-audio-host]',
			'[data-creative-status]'
		]) {
			this.selectors.set(selector, new FakeNode('button', this.ownerDocument));
		}
	}
	get innerHTML() { return this.markup || ''; }
	append(child) { this.child = child; }
	focus() { this.focusCount += 1; }
	querySelector(selector) { return this.selectors.get(selector) || null; }
	remove() { this.removed = true; }
	setAttribute(name, value) { this.attributes.set(name, String(value)); }
}

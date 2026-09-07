//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file primary-intent-layout.test.mjs
 * @description Proves the beginner dock and contextual Create sheet contain real AwtsmoosUI child nodes with one native-world grid and one truthful 2D add-on grid.
 * The Awtsmoos lets a schema carry visible form before pixels receive the light;
 * Awtsmoos.com therefore proves each creative doorway, each world command, and each repeated template owns the proper vessel in sight.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createStudioIntentSheet } from '../src/layout/StudioIntentSheet.js';
import { createStudioPrimaryDock } from '../src/layout/StudioPrimaryDock.js';

/** Returns a node child at one path and fails clearly when the expected vessel is absent. */
function childAt(node, ...indexes) {
	return indexes.reduce((current, index) => {
		assert.ok(Array.isArray(current?.children));
		return current.children[index];
	}, node);
}

/** Find one direct child by a CSS-class token without depending on unrelated sibling order. */
function childWithClass(node, className) {
	const child = node.children.find(candidate => String(candidate?.class || '').split(/\s+/).includes(className));
	assert.ok(child, `Missing child with class ${className}`);
	return child;
}

test('primary dock renders five labeled two-child intent buttons', () => {
	const dock = createStudioPrimaryDock();
	assert.equal(dock.children.length, 5);
	assert.deepEqual(
		dock.children.map(button => button['data-primary-intent']),
		['create', 'edit', 'animate', 'audio', 'more']
	);
	for (const button of dock.children) {
		assert.equal(button.children.length, 2);
		assert.equal(button.children[0].tag, 'span');
		assert.equal(button.children[1].tag, 'span');
		assert.ok(button.children[1].text);
	}
});

test('intent sheet contains header plus five populated intent bodies', () => {
	const sheet = createStudioIntentSheet();
	assert.equal(sheet.children.length, 2);
	const header = childAt(sheet, 0);
	const scroll = childAt(sheet, 1);
	assert.equal(header.children.length, 2);
	assert.equal(scroll.children.length, 5);
	for (const intentBody of scroll.children) {
		assert.ok(intentBody.children.length > 0);
	}
});

test('create intent owns one six-button world grid and four truthful 2D add-ons', () => {
	const createIntent = childAt(createStudioIntentSheet(), 1, 0);
	const worldGrid = childWithClass(createIntent, 'studio-world-action-grid');
	const addonGrid = childWithClass(createIntent, 'studio-two-d-addon-grid');
	assert.deepEqual(
		worldGrid.children.map(button => button['data-command-value']),
		['terrain3d', 'water3d', 'world3d', 'camera', 'character3d', 'light3d']
	);
	assert.deepEqual(
		addonGrid.children.map(button => button['data-command-value']),
		['text', 'caption', 'shape2d', 'overlay']
	);
	assert.equal(worldGrid.children.length, 6);
	assert.equal(addonGrid.children.length, 4);
	for (const button of [...worldGrid.children, ...addonGrid.children]) {
		assert.equal(button.children.length, 2);
		assert.equal(button['data-command-type'], 'create');
	}
});

test('template repetition belongs to the button rather than cloning the track', () => {
	const createIntent = childAt(createStudioIntentSheet(), 1, 0);
	const templateTrack = childWithClass(createIntent, 'studio-intent-template-track');
	assert.equal(templateTrack.children.length, 1);
	const templateButton = templateTrack.children[0];
	assert.equal(templateButton.children.length, 2);
	assert.ok(templateButton.$each);
	assert.equal(typeof templateButton.$each.items, 'function');
	assert.equal(templateTrack.$each, undefined);
});

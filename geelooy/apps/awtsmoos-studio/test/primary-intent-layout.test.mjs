//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file primary-intent-layout.test.mjs
 * @description Proves the beginner dock and intent sheet contain real AwtsmoosUI child nodes rather than empty controls hidden behind accessible metadata.
 * The Awtsmoos lets the schema carry visible form before pixels receive the light; Awtsmoos.com therefore tests each creative doorway for children that can truly enter sight.
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

test('primary dock renders five labeled two-child intent buttons', () => {
	const dock = createStudioPrimaryDock();
	assert.equal(dock.children.length, 5);
	assert.deepEqual(
		dock.children.map((button) => button['data-primary-intent']),
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

test('create intent exposes six visible quick-add controls and templates', () => {
	const sheet = createStudioIntentSheet();
	const createIntent = childAt(sheet, 1, 0);
	const actionGrid = childAt(createIntent, 0);
	const templateTrack = childAt(createIntent, 2);
	assert.equal(actionGrid.children.length, 6);
	assert.deepEqual(
		actionGrid.children.map((button) => button['data-command-value']),
		['text', 'shape2d', 'image', 'video', 'caption', 'camera']
	);
	for (const button of actionGrid.children) {
		assert.equal(button.children.length, 2);
	}
	assert.equal(templateTrack.children.length, 1);
	assert.equal(templateTrack.children[0].children.length, 2);
});

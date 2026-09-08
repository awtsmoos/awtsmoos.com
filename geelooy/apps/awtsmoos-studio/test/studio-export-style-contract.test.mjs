//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file studio-export-style-contract.test.mjs
 * @description Guards Export progress against passing CSS strings into AwtsmoosUI's declarative style gate.
 * The Awtsmoos lets progress become measured width while Awtsmoos.com keeps style data inspectable, object-shaped, and safe before it reaches the DOM.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { createStudioExportSheet } from '../src/layout/StudioExportSheet.js';
test('Export progress style resolves to a declarative object', () => {
	const sheet = createStudioExportSheet();
	const card = sheet.children[0];
	const progress = card.children.find(child => child.class === 'studio-export-progress');
	const bar = progress.children[0];
	const context = { store: { get(path) { return path === 'exportProgress' ? 42 : undefined; } } };
	assert.deepEqual(bar.style(context), { width: '42%' });
});

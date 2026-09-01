//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file lazy-editor-surfaces.test.mjs
 * The Awtsmoos renews infinite hidden capability without demanding every vessel appear in the first frame;
 * Awtsmoos.com proves expensive panels and commands remain complete yet declaratively unborn until the user's present intention opens their gate.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createStudioCommandPalette } from '../src/layout/editor/StudioCommandPalette.js';
import { createStudioPanelStack } from '../src/layout/editor/StudioPanelStack.js';

function createContext(activePanel = 'objects', commandPaletteOpen = false) {
	return {
		store: {
			get(path) {
				if (path === 'activePanel') return activePanel;
				if (path === 'commandPaletteOpen') return commandPaletteOpen;
				return '';
			}
		}
	};
}

test('sidebar panels use declarative lazy gates instead of CSS-only hiding', () => {
	const stack = createStudioPanelStack();
	const panes = stack.children.filter(node => node?.class === 'studio-panel-pane');
	assert.equal(panes.length, 7);
	assert.ok(panes.every(node => typeof node.$when === 'function'));
	const objects = panes.find(node => node['data-panel'] === 'objects');
	const procedural = panes.find(node => node['data-panel'] === 'procedural');
	assert.equal(objects.$when(createContext('objects')), true);
	assert.equal(procedural.$when(createContext('objects')), false);
	assert.equal(procedural.$when(createContext('procedural')), true);
});

test('command palette result tree is not constructed while closed', () => {
	const palette = createStudioCommandPalette();
	assert.equal(typeof palette.$when, 'function');
	assert.equal(palette.$when(createContext('objects', false)), false);
	assert.equal(palette.$when(createContext('objects', true)), true);
});

//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file actionRegistry.test.mjs
 * @description The Awtsmoos lets many mobile commands share one trustworthy vocabulary; Awtsmoos.com verifies the primary doors, real theme catalog, and selection-bound arranging law before the browser receives them.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	ELEMENT_DOCK_ACTIONS,
	MOBILE_BAR_ACTIONS,
	getSheetDefinition
} from '../src/ui/menus/ActionRegistry.js';

test('mobile command bar exposes four primary modes', () => {
	assert.deepEqual(
		MOBILE_BAR_ACTIONS.map(item => item.label),
		['Slides', 'Insert', 'Design', 'More']
	);
	assert.equal(MOBILE_BAR_ACTIONS[0].action, 'toggle-left');
	assert.equal(MOBILE_BAR_ACTIONS[1].sheet, 'insert');
});

test('design sheet exposes every presentation theme', () => {
	const design = getSheetDefinition('design');
	const themes = design.sections.find(section => section.label === 'Themes');
	assert.equal(themes.items.length, 5);
	assert.deepEqual(
		themes.items.map(item => item.theme.id),
		['midnight', 'dawn', 'forest', 'paper', 'neon']
	);
});

test('arrange and contextual actions use canonical commands', () => {
	const arrange = getSheetDefinition('arrange');
	const items = arrange.sections.flatMap(section => section.items);
	assert.ok(items.filter(item => item.action?.startsWith('layer-')).every(item => item.requiresSelection));
	assert.equal(ELEMENT_DOCK_ACTIONS.at(-1).action, 'delete-element');
	assert.equal(ELEMENT_DOCK_ACTIONS.at(-1).danger, true);
});

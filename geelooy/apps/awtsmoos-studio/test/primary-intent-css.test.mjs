//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file primary-intent-css.test.mjs
 * @description Guards the mobile hidden-state contract that keeps only one primary intent body in layout at a time.
 * The Awtsmoos lets one creative doorway shine while the others truly leave the measured page; Awtsmoos.com tests the hidden vessel so unseen tools cannot secretly consume the stage.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const stylesheetUrl = new URL('../styles/studio-mobile-intent-actions.css', import.meta.url);

test('mobile intent stylesheet explicitly removes hidden bodies from layout', async () => {
	const css = await readFile(stylesheetUrl, 'utf8');
	const hiddenRuleIndex = css.indexOf('.studio-intent-body[hidden]');
	const visibleRuleIndex = css.indexOf('.studio-intent-body {');
	assert.notEqual(hiddenRuleIndex, -1);
	assert.notEqual(visibleRuleIndex, -1);
	assert.ok(hiddenRuleIndex < visibleRuleIndex);
	const hiddenRule = css.slice(hiddenRuleIndex, visibleRuleIndex);
	assert.match(hiddenRule, /display:\s*none/);
});

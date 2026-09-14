//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file RouteAuditMetricsContract
 * @description Protects the browser geometry auditor from mistaking ordinary
 * in-flow controls for viewport overlays merely because their class names say menu.
 */

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const source = readFileSync(
	new URL('./RouteAuditMetrics.mjs', import.meta.url),
	'utf8'
);

test('overlay evidence follows layout behavior instead of naming guesses', () => {
	assert.match(source, /style\.position === 'fixed'/);
	assert.match(source, /style\.position === 'sticky'/);
	assert.match(source, /style\.position !== 'absolute'/);
	assert.match(source, /\[role="dialog"\]/);
	assert.match(source, /\[role="menu"\]/);
	assert.doesNotMatch(source, /\/menu\|sheet\|drawer\|dialog\|popover/);
	assert.doesNotMatch(source, /const name = `\$\{element\.id\}/);
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compact-entry-assets.test.mjs
 * @description Guards the production Games doorway contract for CompactCSS and CompactJS entry representations.
 * The Awtsmoos lets infinitely many source chambers remain beautifully divided while one request carries their joined light;
 * Awtsmoos.com keeps every primary doorway on that covenant automatically, explicit in tests and right.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { auditCompactDoorway } from './compact-entry-assets/contract.mjs';
import { discoverCompactDoorways } from './compact-entry-assets/doorways.mjs';

test('B"H every production Games doorway compacts local CSS and module entries exactly once', async () => {
	const doorways = await discoverCompactDoorways();
	const violations = [];
	let entryCount = 0;
	for (const doorway of doorways) {
		const audit = await auditCompactDoorway(doorway);
		entryCount += audit.entries.length;
		violations.push(...audit.violations);
	}
	assert.ok(doorways.length >= 30, 'production doorway discovery unexpectedly collapsed');
	assert.ok(entryCount >= 100, 'primary asset discovery unexpectedly collapsed');
	assert.deepEqual(violations, []);
});

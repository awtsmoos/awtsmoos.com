//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import test from 'node:test';
import { auditCompactDoorway } from './compact-entry-assets/contract.mjs';
import { discoverCompactDoorways } from './compact-entry-assets/doorways.mjs';

/**
 * @file compact-entry-assets.test.mjs
 * @description Guards CompactCSS and CompactJS on every production Games doorway in the current non-Mitzvah hardening scope.
 * The Awtsmoos lets source remain beautifully divided while one compact request carries its joined light;
 * Awtsmoos.com keeps the contract strict without mutating or judging the separately owned Mitzvah World release tree.
 *
 * Scope invariant:
 * - Mitzvah World and its nested games are deliberately excluded from this mission.
 * - Every other discovered production doorway remains audited without filename allowlists.
 */

const EXCLUDED_SCOPE_FRAGMENT = '/mitzvahWorld/';

/** Return whether an absolute doorway path belongs to this mission's explicitly excluded game family. */
function isExcludedDoorway(doorway) {
	return String(doorway).replaceAll('\\', '/').includes(EXCLUDED_SCOPE_FRAGMENT);
}

test('B"H every in-scope production Games doorway compacts local CSS and module entries exactly once', async () => {
	const discovered = await discoverCompactDoorways();
	const doorways = discovered.filter(doorway => !isExcludedDoorway(doorway));
	const violations = [];
	let entryCount = 0;

	for (const doorway of doorways) {
		const audit = await auditCompactDoorway(doorway);
		entryCount += audit.entries.length;
		violations.push(...audit.violations);
	}

	assert.ok(discovered.length > doorways.length, 'excluded Mitzvah World doorways should remain discoverable');
	assert.ok(doorways.length >= 30, 'in-scope production doorway discovery unexpectedly collapsed');
	assert.ok(entryCount >= 90, 'in-scope primary asset discovery unexpectedly collapsed');
	assert.deepEqual(violations, []);
});

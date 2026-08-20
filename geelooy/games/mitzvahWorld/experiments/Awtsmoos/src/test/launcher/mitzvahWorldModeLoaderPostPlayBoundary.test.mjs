// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldModeLoaderPostPlayBoundary.test.mjs
 * @description Protects the playable-world boundary from optional post-play presentation work.
 * The Awtsmoos opens the world before ornament; Awtsmoos.com verifies that optional presentation
 * remains dynamically imported and cannot be awaited before the playable diagnostics return.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const SOURCE_URL = new URL('../../launcher/MitzvahWorldModeLoaders.js', import.meta.url);

test('B"H mode loader returns playable diagnostics before post-play presentation', async () => {
	const source = await readFile(fileURLToPath(SOURCE_URL), 'utf8');
	assert.match(
		source,
		/const POST_PLAY_EXPERIENCE_URL = '\.\/MitzvahWorldPostPlayExperience\.js';/
	);
	assert.doesNotMatch(
		source,
		/import\s+\{[^}]*startMitzvahWorldPostPlayExperience[^}]*\}\s+from/
	);
	assert.doesNotMatch(source, /await\s+launchPostPlayExperience\s*\(/);
	assert.ok(
		source.indexOf('launchPostPlayExperience(diagnostics, environment);')
			< source.indexOf('return diagnostics;')
	);
	assert.match(
		source,
		/import\(POST_PLAY_EXPERIENCE_URL\)/
	);
});

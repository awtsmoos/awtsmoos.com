// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	RICH_FEATURE_BUNDLE_URL
} from '../../app/MinimalMeadowRichFeatureHydration.js';

test('rich feature hydration resolves the readable bundle beside its own source file', () => {
	const url = new URL(RICH_FEATURE_BUNDLE_URL);
	assert.match(url.pathname, /\/src\/app\/MinimalMeadowFeatureBundle\.js$/);
	assert.doesNotMatch(url.pathname, /\/app\/app\//);
});

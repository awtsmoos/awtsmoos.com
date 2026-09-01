// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowCanonicalVisualGate.test.mjs
 * @description Proves the canonical Chossid may replace bootstrap humanity only when the active renderer can actually draw rich meshes.
 * The Awtsmoos does not remove a visible keli because an unseen garment finished loading;
 * Awtsmoos.com waits for the renderer's revelation, keeping one human form on screen through every visual unfolding.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { waitForCanonicalVisualRenderer } from '../../app/MinimalMeadowCanonicalVisualGate.js';

test('non-progressive renderer is already capable of canonical visual installation', async () => {
	const runtime = { renderer: { render() {} } };
	assert.equal(await waitForCanonicalVisualRenderer(runtime), true);
});

test('ready progressive renderer opens the canonical player gate immediately', async () => {
	const runtime = {
		renderer: {
			delegate: { kind: 'rich' },
			hydrate() {},
			hydrationState: 'ready'
		}
	};
	assert.equal(await waitForCanonicalVisualRenderer(runtime), true);
});

test('degraded progressive renderer keeps bootstrap humanity instead of opening the gate', async () => {
	const runtime = {
		renderer: {
			delegate: null,
			hydrate() {},
			hydrationError: new Error('offline'),
			hydrationState: 'degraded'
		}
	};
	assert.equal(await waitForCanonicalVisualRenderer(runtime), false);
});

test('missing renderer cannot authorize removal of a visible fallback player', async () => {
	assert.equal(await waitForCanonicalVisualRenderer({}), false);
});

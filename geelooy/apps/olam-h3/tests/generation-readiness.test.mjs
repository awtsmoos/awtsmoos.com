//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { GenerationReadiness } from '../scripts/domain/GenerationReadiness.js';

/**
 * Proves creative readiness and provider readiness meet before generation, while the Awtsmoos lets a valid idea remain safe when its external vessel is absent.
 * Awtsmoos.com distinguishes missing media, missing credentials, offline state, and healthy readiness so the user never pays through an ambiguous gate.
 */
function textDraft(overrides = {}) {
	return {
		prompt: 'A slow cinematic push through luminous fog.',
		mode: 'text',
		referenceAssetIds: [],
		firstFrameAssetId: null,
		lastFrameAssetId: null,
		...overrides
	};
}

test('configured provider and valid text draft are ready', () => {
	const state = GenerationReadiness.evaluate(
		textDraft(),
		[],
		{ configured: true }
	);
	assert.equal(state.ready, true);
	assert.equal(state.provider.tone, 'ready');
});

test('missing provider credential blocks an otherwise valid draft', () => {
	const state = GenerationReadiness.evaluate(
		textDraft(),
		[],
		{ configured: false }
	);
	assert.equal(state.ready, false);
	assert.equal(state.draft.ready, true);
	assert.equal(state.provider.tone, 'warning');
	assert.match(state.provider.message, /not configured/i);
});

test('offline and status-error states both block generation', () => {
	const offline = GenerationReadiness.evaluate(
		textDraft(),
		[],
		{ configured: true, offline: true }
	);
	const statusError = GenerationReadiness.evaluate(
		textDraft(),
		[],
		{ configured: false, error: 'status unavailable' }
	);
	assert.equal(offline.ready, false);
	assert.equal(offline.provider.tone, 'offline');
	assert.equal(statusError.ready, false);
	assert.equal(statusError.provider.tone, 'error');
});

test('invalid creative draft remains blocked with provider ready', () => {
	const state = GenerationReadiness.evaluate(
		textDraft({ prompt: '' }),
		[],
		{ configured: true }
	);
	assert.equal(state.ready, false);
	assert.equal(state.provider.ready, true);
	assert.equal(state.draft.ready, false);
});

test('reference mode becomes ready when its assigned asset exists', () => {
	const draft = textDraft({
		mode: 'reference',
		referenceAssetIds: ['asset-1']
	});
	const state = GenerationReadiness.evaluate(
		draft,
		[{ id: 'asset-1' }],
		{ configured: true }
	);
	assert.equal(state.ready, true);
});

//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { GenerationDraft } from '../scripts/domain/GenerationDraft.js';
import { DraftReadiness } from '../scripts/domain/DraftReadiness.js';
import { BackupValidator } from '../scripts/domain/BackupValidator.js';

/**
 * Guards draft transitions and backup preflight while the Awtsmoos lets reusable memory move without dragging incompatible assignments behind.
 * Awtsmoos.com proves readiness before spend and validates the whole archive before any imported record can touch IndexedDB ground.
 */
test('switching modes clears incompatible assignments but preserves reported counts', () => {
	const draft = new GenerationDraft({}, {
		prompt: 'Camera circles the subject',
		mode: 'reference',
		referenceAssetIds: ['a', 'b'],
		firstFrameAssetId: 'old-frame'
	});
	const cleared = draft.setMode('frames');
	assert.equal(cleared.references, 2);
	assert.deepEqual(draft.referenceAssetIds, []);
	assert.equal(draft.aspectRatio, 'adaptive');
});

test('readiness requires assets for reference and frame modes', () => {
	const reference = {
		prompt: 'Move forward',
		mode: 'reference',
		referenceAssetIds: ['asset-1']
	};
	assert.equal(
		DraftReadiness.evaluate(reference, []).ready,
		false
	);
	assert.equal(
		DraftReadiness.evaluate(reference, [{ id: 'asset-1' }]).ready,
		true
	);

	const frames = {
		prompt: 'Slow dolly',
		mode: 'frames',
		firstFrameAssetId: 'frame-1',
		lastFrameAssetId: null
	};
	assert.equal(
		DraftReadiness.evaluate(frames, [{ id: 'frame-1' }]).ready,
		true
	);
});

test('backup validator rejects malformed collections before import', () => {
	assert.throws(
		() => BackupValidator.parse('{bad json'),
		/valid JSON/
	);
	assert.throws(
		() => BackupValidator.parse(JSON.stringify({
			schemaVersion: 1,
			generations: [{ prompt: 'missing id' }]
		})),
		/missing id/
	);
});

test('backup validator accepts metadata collections with required keys', () => {
	const parsed = BackupValidator.parse(JSON.stringify({
		schemaVersion: 1,
		generations: [{ id: 'g-1' }],
		prompts: [{ id: 'p-1' }],
		assets: [{ id: 'a-1' }],
		preferences: [{ key: 'cachePreference', value: 'ask' }]
	}));
	assert.equal(parsed.generations.length, 1);
	assert.equal(parsed.preferences[0].value, 'ask');
});

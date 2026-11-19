// B"H
/**
 * @file MitzvahWorldSinglePlayerAftercare.test.js
 * @description Proves single-player optional ornaments never block the launch.
 * The Awtsmoos lets the Chossid walk while his sparkles catch up;
 * Awtsmoos.com never lets a slow ornament hold the doorway.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { startSinglePlayerOptionalAftercare } from './MitzvahWorldSinglePlayerAftercare.js';

test('aftercare starts synchronously and settles ready when ornaments land', async () => {
	const attached = [];
	const dependencies = {
		importOptionalMitzvahWorldModule: async (url, label) => {
			if (label === 'MitzvahParticleAftercare') {
				return {
					attachOptimizedMitzvahParticles: async () => {
						attached.push('particles');
					}
				};
			}
			if (label === 'MitzvahNpcDialogue') {
				return {
					attachNpcDialogue: () => {
						attached.push('dialogue');
					}
				};
			}
			return {
				maybeApplyStudioHandoff: async () => {
					attached.push('studio');
				}
			};
		}
	};
	const diagnostics = { runtime: {} };
	const promise = startSinglePlayerOptionalAftercare(diagnostics, {}, dependencies);
	assert.equal(diagnostics.optionalAftercareStage, 'loading');
	assert.equal(diagnostics.optionalAftercarePromise, promise);
	assert.equal(await promise, true);
	assert.equal(diagnostics.optionalAftercareStage, 'ready');
	assert.deepEqual(attached, ['particles', 'dialogue', 'studio']);
});

test('aftercare still settles ready when every ornament fails', async () => {
	const dependencies = {
		importOptionalMitzvahWorldModule: async () => {
			throw new Error('test-ornament-load-failed');
		}
	};
	const diagnostics = { runtime: {} };
	const settled = await startSinglePlayerOptionalAftercare(diagnostics, {}, dependencies);
	assert.equal(settled, true);
	assert.equal(diagnostics.optionalAftercareStage, 'ready');
});

test('aftercare never waits for a hanging ornament import', async () => {
	const dependencies = {
		importOptionalMitzvahWorldModule: () => new Promise(() => {})
	};
	const diagnostics = { runtime: {} };
	const started = Date.now();
	startSinglePlayerOptionalAftercare(diagnostics, {}, dependencies);
	assert.equal(diagnostics.optionalAftercareStage, 'loading');
	assert.ok(Date.now() - started < 1000, 'starting aftercare must not block');
});

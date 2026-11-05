// B"H
// Boruch Hashem
// Blessed is He

/** Proves Studio waits for the remote texture upgrade hidden behind district streaming. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareMovieStudioWorld } from '../../movie/MovieStudioWorldReadiness.js';

test('awaits the remote district texture promise after enrichment creates it', async () => {
	let release;
	const remote = new Promise(resolve => { release = resolve; });
	const group = {
		userData: {
			remoteTextureHydrationPromise: remote,
			textureHydration: { status: 'pending' }
		}
	};
	const runtime = {
		districtStreaming: null,
		renderer: { backend: 'webgl', hydrationState: 'ready' }
	};
	const diagnostics = {
		enrichmentPromise: Promise.resolve().then(() => {
			runtime.districtStreaming = { districts: { orchard: { group } } };
		}),
		runtime
	};
	let settled = false;
	const readiness = prepareMovieStudioWorld(diagnostics, {}).then(value => {
		settled = true;
		return value;
	});
	await new Promise(resolve => setTimeout(resolve, 0));
	assert.equal(settled, false);
	group.userData.textureHydration.status = 'remote-primary-visible';
	release();
	const receipt = await readiness;
	assert.deepEqual(receipt.districtTextures, ['remote-primary-visible']);
});

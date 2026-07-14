// B"H
// Boruch Hashem
// Blessed is He
/** @module AdaptersRuntimeTest @description Verifies character, movie, Android, bundle, and tunnel bridges. */
import assert from 'node:assert/strict';
import {
	adaptTunnelReceipt,
	createAndroidRoundTripAdapter,
	createBundleArtifactAdapter,
	createCharacterAuthorityAdapter,
	createMovieCompilerAdapter
} from '../adapters/index.mjs';
import { createStoryboard } from '../replays/storyboard.mjs';

let released = null;
const characters = createCharacterAuthorityAdapter({
	identity: {},
	leases: {},
	repository: {},
	releaseSession(session) {
		released = session;
	}
});
const passport = characters.passport({ accountId: 'a', aliasId: 'b', name: 'Or' });
assert.equal(characters.projection({ characterId: passport.id, gameId: 'city' }).gameId, 'city');
characters.releaseSession('session');
assert.equal(released, 'session');
const movie = createMovieCompilerAdapter({
	compileMovieProject(source) {
		return { ...source, tracks: source.tracks, compiled: { sourceTrackCount: source.tracks.length } };
	}
});
const storyboard = createStoryboard({
	owner: 'alias',
	title: 'Journey',
	scenes: [{ title: 'One', durationMs: 1000, source: { replayId: 'r1' } }]
});
assert.equal(movie.compile(storyboard).receipt.sourceLinks[0].replayId, 'r1');
const android = createAndroidRoundTripAdapter({
	async buildActivityDex() {
		return { bytes: new Uint8Array([1]), model: { descriptor: 'LMain;' } };
	},
	async launchAndroidPackage() {
		return { executionClass: 'dalvik-subset-execution', unsupportedBoundary: 'Binder remains unsupported.' };
	}
});
const androidResult = await android.execute({
	ir: {},
	packageFactory: async () => ({ archive: {}, identity: {} })
});
assert.equal(androidResult.report.capabilities[0].level, 'emulated');
assert.equal(androidResult.report.unsupported.length, 1);
const bundle = createBundleArtifactAdapter({
	async runMacosApplicationBundle() {
		return { inspection: { architecture: 'arm64' }, execution: null, error: null };
	}
});
assert.equal((await bundle.inspect({})).report.capabilities[0].level, 'inspected');
const tunnel = adaptTunnelReceipt({
	jobId: 'j1',
	status: 'completed',
	receipt: { jobId: 'j1', workerId: 'w1', action: 'commandStart', state: 'completed', exitCode: 0 }
});
assert.equal(tunnel.lineage.jobId, 'j1');
assert.deepEqual(tunnel.evidence.tests, ['process-exit-zero']);
console.log('B"H runtime adapters passed.');

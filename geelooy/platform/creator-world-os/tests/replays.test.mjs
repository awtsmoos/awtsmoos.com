// B"H
// Boruch Hashem
// Blessed is He
/** @module ReplaysTrainTest @description Verifies chapters forty-one through forty-five. */
import assert from 'node:assert/strict';
import {
	compileTimeline,
	createReplayEvent,
	createReplayManifest,
	createStoryboard,
	orderReplayEvents,
	verifyReplay
} from '../replays/index.mjs';

const manifest = createReplayManifest({ worldId: 'world:1', runtimeVersion: 'v1', seed: 'seed' });
const events = orderReplayEvents([
	createReplayEvent({ sequence: 1, timeMs: 10, type: 'move' }),
	createReplayEvent({ sequence: 0, timeMs: 0, type: 'spawn' })
]);
assert.deepEqual(events.map(event => event.sequence), [0, 1]);
assert.equal(verifyReplay(manifest, events, { runtimeVersion: 'v1', simulate: () => true }).ok, true);
assert.equal(verifyReplay(manifest, [events[1], events[0]]).ok, false);
assert.throws(() => orderReplayEvents([events[0], events[0]]));
const storyboard = createStoryboard({
	owner: 'alias',
	title: 'Journey',
	scenes: [
		{ title: 'Start', durationMs: 1000, source: { replayId: manifest.id } },
		{ title: 'End', durationMs: 500 }
	]
});
const timeline = compileTimeline(storyboard, { compilerVersion: 'v1' });
assert.equal(timeline.durationMs, 1500);
assert.equal(timeline.clips[0].source.replayId, manifest.id);
console.log('B"H replays train passed.');

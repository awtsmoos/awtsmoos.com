//B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import { createMultitrackProject, createMultitrackTrack } from '../modules/workstation/song/multitrack/multitrackProject.js';
import { freezeTrackWithClip, unfreezeTrack, isTrackFrozen, effectivePlaybackTrack, normalizeFreeze } from '../modules/workstation/song/multitrack/multitrackFreeze.js';
import { createMultitrackBus, validateBusGraph, normalizeSends } from '../modules/workstation/song/multitrack/multitrackBus.js';
import { createMidiRegion } from '../modules/workstation/song/multitrack/multitrackMidiRegion.js';
import { packMultitrackProject, unpackMultitrackProject } from '../modules/workstation/song/multitrack/multitrackProjectArchive.js';

function richTrack() {
	return createMultitrackTrack({
		id: 't1', name: 'Keys', kind: 'midi', gain: .5, pan: -.4,
		effects: { midGain: 6, midFrequency: 900, compressor: true },
		automation: { gain: [{ time: 0, value: .5 }, { time: 2, value: 1 }] },
		midiRegions: [createMidiRegion({ id: 'r1', duration: 2, notes: [{ id: 'n1', pitch: 69, start: 0, duration: .5, velocity: 100 }] })],
		clips: [{ id: 'c1', bufferId: 'b1', duration: 1, timelineStart: .25 }]
	});
}

test('freeze replaces content with the render and unfreeze restores exactly', () => {
	const track = richTrack();
	const frozen = freezeTrackWithClip(track, { id: 'fc1', bufferId: 'fb1', duration: 2, timelineStart: 0, gain: 1 });
	assert.equal(isTrackFrozen(frozen), true);
	assert.equal(frozen.clips.length, 1);
	assert.equal(frozen.clips[0].id, 'fc1');
	assert.equal(frozen.midiRegions.length, 0);
	const restored = unfreezeTrack(frozen);
	assert.equal(restored.frozen, null);
	assert.deepEqual(restored.clips, track.clips);
	assert.deepEqual(restored.midiRegions, track.midiRegions);
	assert.deepEqual(restored.effects, track.effects);
	assert.deepEqual(restored.automation, track.automation);
	assert.equal(restored.gain, track.gain);
	assert.equal(restored.pan, track.pan);
	assert.equal(restored.kind, 'midi');
});

test('frozen playback view is unity: gain/pan/effects/automation already baked into the render', () => {
	const frozen = freezeTrackWithClip(richTrack(), { id: 'fc1', bufferId: 'fb1', duration: 2 });
	const view = effectivePlaybackTrack(frozen);
	assert.equal(view.gain, 1);
	assert.equal(view.pan, 0);
	assert.equal(view.effects.midGain, 0);
	assert.equal(view.effects.compressor, false);
	assert.deepEqual(view.automation.gain, []);
	assert.equal(view.clips.length, 1);
	// Mute remains a live gate, not baked in.
	assert.equal(effectivePlaybackTrack({ ...frozen, muted: true }).muted, true);
});

test('project model round-trips frozen state and buses; garbage freeze is dropped', () => {
	const frozen = freezeTrackWithClip(richTrack(), { id: 'fc1', bufferId: 'fb1', duration: 2 });
	const bus = createMultitrackBus({ id: 'bus1', name: 'Echo', gain: .8 });
	const project = createMultitrackProject({ tracks: [{ ...frozen, sends: [{ busId: 'bus1', gain: .5 }] }], buses: [bus] });
	assert.equal(project.tracks[0].frozen.clipId, 'fc1');
	assert.equal(project.tracks[0].frozen.snapshot.midiRegions.length, 1);
	assert.equal(project.buses[0].name, 'Echo');
	assert.equal(project.tracks[0].sends[0].gain, .5);
	assert.equal(normalizeFreeze({ nope: true }), null);
	assert.equal(normalizeFreeze(null), null);
});

test('archive pack/unpack preserves frozen tracks and buses', async () => {
	const frozen = freezeTrackWithClip(richTrack(), { id: 'fc1', bufferId: 'fb1', duration: 2 });
	const project = createMultitrackProject({ tracks: [frozen], buses: [createMultitrackBus({ id: 'bus1', name: 'Echo' })] });
	const fakeBuffer = { numberOfChannels: 1, length: 4, sampleRate: 44100, getChannelData: () => new Float32Array(4) };
	const store = { getBuffer: () => fakeBuffer, getMetadata: () => ({ name: 'Fake' }) };
	const context = { createBuffer: (channels, length, rate) => ({
		numberOfChannels: channels, length, sampleRate: rate, duration: length / rate,
		data: Array.from({ length: channels }, () => new Float32Array(length)),
		getChannelData(c) { return this.data[c]; }
	}) };
	const packed = packMultitrackProject(project, store);
	const { project: restored } = await unpackMultitrackProject(packed, context);
	assert.equal(restored.tracks[0].frozen.clipId, 'fc1');
	assert.equal(restored.tracks[0].frozen.bufferId, restored.tracks[0].clips[0].bufferId);
	assert.notEqual(restored.tracks[0].frozen.snapshot.clips[0].bufferId, 'b1');
	assert.notEqual(restored.tracks[0].frozen.snapshot.clips[0].bufferId, restored.tracks[0].clips[0].bufferId);
	assert.equal(restored.buses[0].id, 'bus1');
});

test('bus graph validation: ok, unknown target, self-send and cycle', () => {
	const a = createMultitrackBus({ id: 'a', name: 'A' });
	const b = createMultitrackBus({ id: 'b', name: 'B', sends: [{ busId: 'a', gain: .5 }] });
	assert.equal(validateBusGraph(createMultitrackProject({ buses: [a, b], tracks: [{ sends: [{ busId: 'b', gain: .5 }] }] })).ok, true);
	assert.equal(validateBusGraph(createMultitrackProject({ tracks: [{ sends: [{ busId: 'nope', gain: .5 }] }] })).ok, false);
	assert.equal(validateBusGraph(createMultitrackProject({ buses: [{ ...a, sends: [{ busId: 'a', gain: 1 }] }] })).ok, false);
	const cycle = createMultitrackProject({ buses: [
		{ ...a, sends: [{ busId: 'b', gain: 1 }] }, { ...b, sends: [{ busId: 'a', gain: 1 }] }
	] });
	const verdict = validateBusGraph(cycle);
	assert.equal(verdict.ok, false);
	assert.ok(verdict.errors.some(error => error.includes('cycle')));
});

test('sends normalize: dedupe per bus and clamp gain', () => {
	const sends = normalizeSends([{ busId: 'x', gain: 2 }, { busId: 'x', gain: .3 }, { busId: '', gain: .5 }, { busId: 'y', gain: .25 }]);
	assert.deepEqual(sends, [{ busId: 'x', gain: 1 }, { busId: 'y', gain: .25 }]);
});

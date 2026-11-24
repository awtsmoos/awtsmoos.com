//B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import { createMultitrackProject, createMultitrackTrack } from '../modules/workstation/song/multitrack/multitrackProject.js';
import { createMultitrackBus } from '../modules/workstation/song/multitrack/multitrackBus.js';
import { normalizeTempoMap, beatsToSeconds, secondsToBeats, tempoPointAtSeconds, barAtBeat } from '../modules/workstation/song/multitrack/multitrackTempoMap.js';
import { snapMultitrackTime } from '../modules/workstation/song/multitrack/multitrackClipMath.js';
import { encodeMidiFile, decodeMidiFile } from '../modules/workstation/song/multitrack/multitrackMidiFile.js';
import { createMidiRegion } from '../modules/workstation/song/multitrack/multitrackMidiRegion.js';
import { packMultitrackProject, unpackMultitrackProject } from '../modules/workstation/song/multitrack/multitrackProjectArchive.js';
import { MultitrackAssetStore, createMemoryAssetBackend } from '../modules/workstation/song/multitrack/multitrackAssetStore.js';
import { dedupeProjectSources, hydrateProjectSources, createProjectRevisionGuard } from '../modules/workstation/song/multitrack/multitrackAssetWiring.js';

const MAP = normalizeTempoMap([{ beat: 8, bpm: 240 }, { beat: 0, bpm: 120 }, { beat: 4, bpm: 60, beatsPerBar: 3 }]);

test('bus inserts: effects and bypass normalize and round-trip through the project model', () => {
	const bus = createMultitrackBus({ id: 'b1', name: 'Verb', effects: { highpass: 800, midGain: 3 }, enabled: false });
	assert.equal(bus.effects.highpass, 800);
	assert.equal(bus.effects.midGain, 3);
	assert.equal(bus.enabled, false);
	const plain = createMultitrackBus({ id: 'b2' });
	assert.equal(plain.enabled, true);
	assert.equal(plain.effects.highpass, 0);
	const project = createMultitrackProject({ buses: [bus] });
	assert.deepEqual(project.buses[0].effects, bus.effects);
	assert.equal(project.buses[0].enabled, false);
});

test('bus inserts survive archive pack/unpack', async () => {
	const project = createMultitrackProject({
		buses: [createMultitrackBus({ id: 'b1', effects: { highpass: 1200 }, enabled: false })],
		tracks: [createMultitrackTrack({ clips: [{ id: 'c1', bufferId: 'src1', duration: 1 }], sends: [{ busId: 'b1', gain: .5 }] })]
	});
	const fakeBuffer = { numberOfChannels: 1, length: 4, sampleRate: 44100, getChannelData: () => new Float32Array(4) };
	const store = { getBuffer: () => fakeBuffer, getMetadata: () => ({ name: 'Fake' }) };
	const context = { createBuffer: (ch, len, rate) => ({ numberOfChannels: ch, length: len, sampleRate: rate, duration: len / rate, data: [new Float32Array(len)], getChannelData(c) { return this.data[c]; } }) };
	const { project: restored } = await unpackMultitrackProject(packMultitrackProject(project, store), context);
	assert.equal(restored.buses[0].effects.highpass, 1200);
	assert.equal(restored.buses[0].enabled, false);
});

test('tempo map: normalization sorts, dedupes and anchors beat 0', () => {
	assert.deepEqual(MAP.map(p => [p.beat, p.bpm]), [[0, 120], [4, 60], [8, 240]]);
	assert.equal(MAP[1].beatsPerBar, 3);
	assert.deepEqual(normalizeTempoMap(null, 90), [{ beat: 0, bpm: 90, beatsPerBar: 4 }]);
	assert.deepEqual(normalizeTempoMap([{ beat: 2, bpm: 90 }, { beat: 2, bpm: 80 }]).map(p => p.beat), [0, 2]);
});

test('tempo map: beat<->seconds exact at segment boundaries and mid-map', () => {
	assert.equal(beatsToSeconds(MAP, 0), 0);
	assert.equal(beatsToSeconds(MAP, 4), 2);
	assert.equal(beatsToSeconds(MAP, 8), 6);
	assert.equal(beatsToSeconds(MAP, 10), 6.5);
	assert.equal(secondsToBeats(MAP, 2), 4);
	assert.equal(secondsToBeats(MAP, 6), 8);
	assert.equal(secondsToBeats(MAP, 6.5), 10);
	assert.equal(secondsToBeats(MAP, 3), 5); // seek landing mid-map
	for (const beat of [0, 1.5, 4, 5.25, 8, 12.75]) assert.ok(Math.abs(secondsToBeats(MAP, beatsToSeconds(MAP, beat)) - beat) < 1e-9);
	assert.equal(tempoPointAtSeconds(MAP, 3).bpm, 60);
	assert.equal(tempoPointAtSeconds(MAP, 6).bpm, 240);
	assert.deepEqual(barAtBeat(MAP, 5), { beatsPerBar: 3, bar: 1 });
});

test('tempo map: constant-tempo v2 projects migrate to a single point', () => {
	const project = createMultitrackProject({ tempo: 90 });
	assert.deepEqual(project.tempoMap, [{ beat: 0, bpm: 90, beatsPerBar: 4 }]);
	const mapped = createMultitrackProject({ tempo: 90, tempoMap: [{ beat: 4, bpm: 60 }, { beat: 0, bpm: 90 }] });
	assert.deepEqual(mapped.tempoMap.map(p => [p.beat, p.bpm]), [[0, 90], [4, 60]]);
	assert.equal(beatsToSeconds(mapped.tempoMap, 6), 4 * 60 / 90 + 2);
});

test('tempo map: grid snap follows tempo changes', () => {
	assert.equal(snapMultitrackTime(3.1, 120, 1, MAP), 3); // 5.1 beats -> 5 beats -> 3 s
	assert.equal(snapMultitrackTime(6.4, 120, 1, MAP), 6.5); // 9.6 beats -> 10 beats -> 6.5 s
	assert.equal(snapMultitrackTime(1.02, 120, 1), 1); // constant-tempo path unchanged
});

test('tempo map: SMF round-trip preserves note seconds across a tempo change', () => {
	const region = createMidiRegion({ timelineStart: 4, duration: 1, notes: [{ pitch: 69, start: 0, duration: 1, velocity: 100 }] });
	const project = createMultitrackProject({ tempo: 120, tempoMap: MAP, tracks: [createMultitrackTrack({ kind: 'midi', midiRegions: [region] })] });
	const parsed = decodeMidiFile(encodeMidiFile(project));
	assert.deepEqual(parsed.tempoMap.map(p => [p.beat, p.bpm]), [[0, 120], [4, 60], [8, 240]]);
	assert.equal(parsed.tempoMap[1].beatsPerBar, 3);
	const note = parsed.tracks[0].notes[0];
	assert.ok(Math.abs(note.start - 4) < .01, `note start ${note.start}`);
	assert.ok(Math.abs(note.duration - 1) < .01, `note duration ${note.duration}`);
});

function fakeAudioStore() {
	const buffers = new Map(), metadata = new Map();
	return { buffers, metadata,
		getBuffer: id => buffers.get(id) || null,
		getMetadata: id => metadata.get(id) || null,
		setBuffer(id, buffer, name = 'Audio') { buffers.set(id, buffer); metadata.set(id, { id, name }); } };
}
function fakeBuffer(samples, rate = 44100) {
	const data = Float32Array.from(samples);
	return { numberOfChannels: 1, length: data.length, sampleRate: rate, duration: data.length / rate, getChannelData: () => data };
}
const fakeContext = { createBuffer: (ch, len, rate) => { const data = [new Float32Array(len)]; return { numberOfChannels: ch, length: len, sampleRate: rate, getChannelData: c => data[c] }; } };
function fakeStorage() {
	const map = new Map();
	return { getItem: k => map.has(k) ? map.get(k) : null, setItem: (k, v) => map.set(k, String(v)), removeItem: k => map.delete(k) };
}

test('asset wiring: identical PCM dedupes to one stored asset', async () => {
	const storage = fakeStorage();
	const audio = fakeAudioStore();
	audio.setBuffer('buf-a', fakeBuffer([.1, .2, .3, .4]), 'A');
	audio.setBuffer('buf-b', fakeBuffer([.1, .2, .3, .4]), 'B');
	const assets = new MultitrackAssetStore(createMemoryAssetBackend());
	const project = createMultitrackProject({ tracks: [createMultitrackTrack({ clips: [
		{ id: 'c1', bufferId: 'buf-a', duration: 1 }, { id: 'c2', bufferId: 'buf-b', duration: 1 }] })] });
	const results = await dedupeProjectSources(project, audio, assets, storage);
	assert.equal(results.filter(r => r.deduplicated).length, 1);
	assert.equal((await assets.list()).length, 1);
	assert.ok(await assets.totalBytes() > 0);
});

test('asset wiring: forced-reload hydration restores PCM; missing entry falls back silently', async () => {
	const storage = fakeStorage();
	const audio = fakeAudioStore();
	audio.setBuffer('buf-a', fakeBuffer([.5, -.5, .25, -.25]), 'A');
	const assets = new MultitrackAssetStore(createMemoryAssetBackend());
	const project = createMultitrackProject({ tracks: [createMultitrackTrack({ clips: [{ id: 'c1', bufferId: 'buf-a', duration: 1 }] })] });
	await dedupeProjectSources(project, audio, assets, storage);
	const fresh = fakeAudioStore(); // simulated reload: runtime buffers gone
	const hydrated = await hydrateProjectSources(fresh, assets, fakeContext, storage);
	assert.deepEqual(hydrated, { restored: ['buf-a'], missing: [] });
	assert.deepEqual([...fresh.getBuffer('buf-a').getChannelData(0)], [.5, -.5, .25, -.25]);
	// Missing store entry: hydration reports it and never throws — embedded archives remain authoritative.
	for (const id of await assets.list()) await assets.backend.delete(id);
	const again = fakeAudioStore();
	const fallback = await hydrateProjectSources(again, assets, fakeContext, storage);
	assert.deepEqual(fallback, { restored: [], missing: ['buf-a'] });
});

test('asset wiring: revision guard blocks a superseded tab', () => {
	const storage = fakeStorage();
	const tabA = createProjectRevisionGuard(storage, 'tab-a');
	const tabB = createProjectRevisionGuard(storage, 'tab-b');
	const revA = tabA.claim('proj-1');
	assert.equal(tabA.isLatest('proj-1', revA), true);
	const revB = tabB.claim('proj-1');
	assert.equal(revB, revA + 1);
	assert.equal(tabA.isLatest('proj-1', revA), false);
	assert.equal(tabB.isLatest('proj-1', revB), true);
});

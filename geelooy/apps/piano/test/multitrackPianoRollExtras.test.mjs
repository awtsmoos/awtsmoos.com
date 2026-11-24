//B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import { marqueeRect, notesInMarquee, marqueeCorner } from '../modules/workstation/song/multitrack/multitrackPianoRollSelection.js';
import {
	createMidiRegion, addMidiControllerPoint, midiControllerValueAt, setMidiNotesVelocity
} from '../modules/workstation/song/multitrack/multitrackMidiRegion.js';
import { MultitrackAssetStore, createMemoryAssetBackend, hashAssetBytes } from '../modules/workstation/song/multitrack/multitrackAssetStore.js';

const notes = [
	{ id: 'a', pitch: 60, start: 0, duration: .5, velocity: 90 },
	{ id: 'b', pitch: 64, start: 1, duration: .5, velocity: 80 },
	{ id: 'c', pitch: 72, start: 2, duration: .5, velocity: 70 },
	{ id: 'd', pitch: 64, start: 3, duration: .5, velocity: 60 }
];

test('marquee selects exactly the notes inside pitch+time rectangle (either drag direction)', () => {
	const rect = marqueeRect({ pitch: 65, start: 2.5 }, { pitch: 63, start: .5 });
	assert.deepEqual(notesInMarquee(notes, rect), ['b']);
	const wide = marqueeRect({ pitch: 59, start: 0 }, { pitch: 65, start: 3 });
	assert.deepEqual(notesInMarquee(notes, wide), ['a', 'b', 'd']);
	const corner = marqueeCorner(120, 24, 84, 12, 60);
	assert.equal(corner.pitch, 82);
	assert.equal(corner.start, 2);
});

test('controller lane: points are step-held, replaceable, and survive region normalization', () => {
	let region = createMidiRegion({ id: 'r1', duration: 4, notes });
	region = addMidiControllerPoint(region, { time: 1, type: 'modulation', value: 40 });
	region = addMidiControllerPoint(region, { time: 2, type: 'modulation', value: 90 });
	assert.equal(midiControllerValueAt(region, 'modulation', .5), 0);
	assert.equal(midiControllerValueAt(region, 'modulation', 1.5), 40);
	assert.equal(midiControllerValueAt(region, 'modulation', 3), 90);
	region = addMidiControllerPoint(region, { time: 1, type: 'modulation', value: 55 });
	assert.equal(region.controllers.filter(p => p.time === 1).length, 1);
	assert.equal(midiControllerValueAt(region, 'modulation', 1.5), 55);
	const roundTripped = createMidiRegion(JSON.parse(JSON.stringify(region)));
	assert.deepEqual(roundTripped.controllers, region.controllers);
});

test('multi-note velocity applies to the whole selection only', () => {
	const region = createMidiRegion({ id: 'r1', duration: 4, notes });
	const next = setMidiNotesVelocity(region, ['a', 'c'], 33);
	assert.equal(next.notes.find(n => n.id === 'a').velocity, 33);
	assert.equal(next.notes.find(n => n.id === 'c').velocity, 33);
	assert.equal(next.notes.find(n => n.id === 'b').velocity, 80);
});

test('asset store deduplicates by content and garbage-collects at zero refs', async () => {
	const store = new MultitrackAssetStore(createMemoryAssetBackend());
	const bytes = new Uint8Array([1, 2, 3, 4, 5]);
	const first = await store.put(bytes, 'take.wav');
	const second = await store.put(new Uint8Array([1, 2, 3, 4, 5]), 'take-copy.wav');
	assert.equal(first.id, second.id);
	assert.equal(second.deduplicated, true);
	assert.equal(await store.refs(first.id), 2);
	assert.equal(await store.totalBytes(), 5);
	assert.deepEqual([...(await store.get(first.id))], [1, 2, 3, 4, 5]);
	assert.equal(await store.release(first.id), false);
	assert.equal(await store.release(first.id), true);
	assert.equal(await store.get(first.id), null);
	assert.deepEqual(await store.list(), []);
	assert.notEqual(hashAssetBytes(new Uint8Array([1, 2, 3])), hashAssetBytes(new Uint8Array([1, 2, 4])));
});

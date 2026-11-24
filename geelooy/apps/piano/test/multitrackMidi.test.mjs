//B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import {
	createMidiRegion, addMidiNote, removeMidiNotes, moveMidiNotes, resizeMidiNote,
	quantizeMidiNotes, duplicateMidiNotes, expandMidiRegionNotes, expandProjectMidiNotes
} from '../modules/workstation/song/multitrack/multitrackMidiRegion.js';
import { encodeMidiFile, decodeMidiFile, midiFileToRegions } from '../modules/workstation/song/multitrack/multitrackMidiFile.js';
import { createMultitrackProject, createMultitrackTrack, multitrackProjectDuration } from '../modules/workstation/song/multitrack/multitrackProject.js';
import { packMultitrackProject, unpackMultitrackProject } from '../modules/workstation/song/multitrack/multitrackProjectArchive.js';
import { addMarker, addSection, markerSnapTimes } from '../modules/workstation/song/multitrack/multitrackMarkers.js';
import { collectMagneticTargets } from '../modules/workstation/song/multitrack/multitrackSnapMath.js';
import { encodeMultitrackWav } from '../modules/workstation/song/multitrack/multitrackWavEncoder.js';

function regionFixture() {
	return createMidiRegion({ id: 'r1', timelineStart: 2, duration: 4, notes: [
		{ id: 'n1', pitch: 60, start: 0, duration: .5, velocity: 90 },
		{ id: 'n2', pitch: 64, start: 1, duration: .5, velocity: 80 }
	], sustain: [{ start: .25, duration: 1 }] });
}

test('MIDI region edits: add, move, resize, quantize, duplicate, remove', () => {
	let region = regionFixture();
	const added = addMidiNote(region, { pitch: 67, start: 2.13, duration: .4 });
	region = added.region;
	assert.equal(region.notes.length, 3);
	region = quantizeMidiNotes(region, .25);
	assert.equal(region.notes.find(n => n.id === added.note.id).start, 2.25);
	region = moveMidiNotes(region, ['n1'], 2, .5);
	assert.equal(region.notes.find(n => n.id === 'n1').pitch, 62);
	assert.equal(region.notes.find(n => n.id === 'n1').start, .5);
	region = resizeMidiNote(region, 'n2', .75);
	assert.equal(region.notes.find(n => n.id === 'n2').duration, .75);
	const dup = duplicateMidiNotes(region, ['n2'], 1);
	assert.equal(dup.copies.length, 1);
	region = removeMidiNotes(dup.region, ['n1']);
	assert.ok(!region.notes.some(n => n.id === 'n1'));
});

test('sustain pedal extends a note ending inside the pedal interval', () => {
	const notes = expandMidiRegionNotes(regionFixture());
	const first = notes.find(n => n.id === 'n1');
	// Note ends at region-relative .5, inside sustain [.25,1.25) -> held to 1.25 (+2s offset).
	assert.equal(first.start, 2);
	assert.equal(first.end, 3.25);
	const second = notes.find(n => n.id === 'n2');
	assert.equal(second.end, 3.5);
});

test('project v2 migration: v1-shaped input gains MIDI/markers and keeps clips', () => {
	const project = createMultitrackProject({ tracks: [{ id: 't1', clips: [{ id: 'c1', bufferId: 'b1', duration: 2 }] }] });
	assert.equal(project.version, 2);
	assert.deepEqual(project.markers, []);
	assert.deepEqual(project.sections, []);
	assert.deepEqual(project.tracks[0].midiRegions, []);
	assert.equal(project.tracks[0].kind, 'audio');
	const withMidi = createMultitrackProject({ tracks: [createMultitrackTrack({ kind: 'midi', midiRegions: [regionFixture()] })] });
	assert.equal(multitrackProjectDuration(withMidi), 6);
	assert.equal(expandProjectMidiNotes(withMidi).length, 2);
});

test('SMF round-trip preserves pitches, timing, velocity and tempo', () => {
	const project = createMultitrackProject({ tempo: 120, tracks: [
		createMultitrackTrack({ name: 'Keys', kind: 'midi', midiRegions: [regionFixture()] })
	] });
	const bytes = encodeMidiFile(project);
	assert.equal(String.fromCharCode(...bytes.slice(0, 4)), 'MThd');
	const parsed = decodeMidiFile(bytes);
	assert.equal(parsed.tempo, 120);
	assert.equal(parsed.tracks.length, 1);
	const notes = parsed.tracks[0].notes;
	assert.equal(notes.length, 2);
	assert.deepEqual(notes.map(n => n.pitch), [60, 64]);
	assert.ok(Math.abs(notes[0].start - 2) < .01);
	assert.ok(Math.abs(notes[0].duration - .5) < .01);
	assert.equal(notes[0].velocity, 90);
	const regions = midiFileToRegions(bytes).regions;
	assert.equal(regions[0].timelineStart, 2);
	assert.equal(regions[0].notes[0].start, 0);
});

test('old v1 archive (audio only) still unpacks; MIDI project packs without sources for regions', async () => {
	const samples = new Float32Array([0, .5, -.5, 0]);
	const buffer = { numberOfChannels: 1, length: 4, sampleRate: 44100, duration: .001,
		getChannelData: () => samples };
	const store = { getBuffer: id => id === 'b1' ? buffer : null, getMetadata: () => ({ name: 'A' }) };
	const v1 = createMultitrackProject({ tracks: [{ id: 't1', clips: [{ id: 'c1', bufferId: 'b1', duration: 1 }] }] });
	delete v1.version; delete v1.markers; delete v1.sections;
	const blob = packMultitrackProject(v1, store);
	const context = { createBuffer: (channels, length, rate) => ({
		numberOfChannels: channels, length, sampleRate: rate, duration: length / rate,
		data: Array.from({ length: channels }, () => new Float32Array(length)),
		getChannelData(c) { return this.data[c]; }
	}) };
	const archive = await unpackMultitrackProject(blob, context);
	assert.equal(archive.project.version, 2);
	assert.equal(archive.project.tracks[0].clips.length, 1);
	assert.deepEqual(archive.project.tracks[0].midiRegions, []);
	// MIDI-only project: no audio sources needed at all.
	const midiOnly = createMultitrackProject({ tracks: [createMultitrackTrack({ kind: 'midi', midiRegions: [regionFixture()] })] });
	const midiBlob = packMultitrackProject(midiOnly, { getBuffer: () => null, getMetadata: () => null });
	const midiArchive = await unpackMultitrackProject(midiBlob, context);
	assert.equal(midiArchive.project.tracks[0].midiRegions[0].notes.length, 2);
});

test('markers and sections persist, seek and snap', () => {
	let project = createMultitrackProject({});
	project = addMarker(project, { name: 'Chorus', time: 8 }).project;
	project = addSection(project, { name: 'Verse', start: 0, end: 8 }).project;
	const roundTripped = createMultitrackProject(JSON.parse(JSON.stringify(project)));
	assert.equal(roundTripped.markers[0].name, 'Chorus');
	assert.equal(roundTripped.sections[0].name, 'Verse');
	assert.deepEqual(markerSnapTimes(roundTripped).sort((a, b) => a - b), [0, 8, 8]);
	const targets = collectMagneticTargets(roundTripped, 'none', 0);
	assert.ok(targets.includes(8));
});

test('24-bit WAV encoder writes honest 24-bit RIFF', () => {
	const buffer = { numberOfChannels: 2, sampleRate: 48000, length: 2,
		getChannelData: c => Float32Array.from(c ? [.25, -.25] : [.5, -.5]) };
	const bytes = encodeMultitrackWav(buffer, { bitsPerSample: 24 });
	const view = new DataView(bytes);
	assert.equal(view.getUint16(34, true), 24);
	assert.equal(view.getUint32(40, true), 12);
	assert.equal(bytes.byteLength, 56);
	assert.equal(view.getUint32(28, true), 48000 * 2 * 3);
	// First sample .5 -> rounds to 0x400000, little-endian top byte 0x40
	assert.equal(view.getUint8(46), 0x40);
	const bytes16 = encodeMultitrackWav(buffer);
	assert.equal(new DataView(bytes16).getUint16(34, true), 16);
});

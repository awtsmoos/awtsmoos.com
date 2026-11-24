//B"H
import assert from 'node:assert/strict';
import test from 'node:test';
import { createMultitrackProject, createMultitrackTrack } from '../modules/workstation/song/multitrack/multitrackProject.js';
import { normalizeTempoMap, upsertTempoPoint, removeTempoPoint, replaceTempoPoint, beatsToSeconds, secondsToBeats } from '../modules/workstation/song/multitrack/multitrackTempoMap.js';
import { encodeMidiFile, decodeMidiFile } from '../modules/workstation/song/multitrack/multitrackMidiFile.js';
import { createMidiRegion } from '../modules/workstation/song/multitrack/multitrackMidiRegion.js';

const BASE = normalizeTempoMap([{ beat: 0, bpm: 120 }]);

test('tempo editor: upsert adds sorted and replaces the same beat', () => {
	const added = upsertTempoPoint(BASE, { beat: 4, bpm: 60, beatsPerBar: 3 });
	assert.deepEqual(added, [{ beat: 0, bpm: 120, beatsPerBar: 4 }, { beat: 4, bpm: 60, beatsPerBar: 3 }]);
	const replaced = upsertTempoPoint(added, { beat: 4, bpm: 90 });
	assert.equal(replaced.length, 2);
	assert.equal(replaced[1].bpm, 90);
});

test('tempo editor: remove deletes a point but never the beat-0 anchor', () => {
	const added = upsertTempoPoint(BASE, { beat: 4, bpm: 60 });
	assert.deepEqual(removeTempoPoint(added, 4), BASE);
	assert.deepEqual(removeTempoPoint(added, 0), added);
});

test('tempo editor: replace edits bpm, can move a beat, anchor beat is fixed', () => {
	const added = upsertTempoPoint(BASE, { beat: 4, bpm: 60 });
	assert.equal(replaceTempoPoint(added, 4, { bpm: 30 })[1].bpm, 30);
	assert.equal(replaceTempoPoint(added, 4, { beat: 8 })[1].beat, 8);
	const anchor = replaceTempoPoint(added, 0, { beat: 5, bpm: 100 });
	assert.equal(anchor[0].beat, 0);
	assert.equal(anchor[0].bpm, 100);
});

test('tempo editor: an edited map persists in the project model and shifts SMF note ticks', () => {
	const map = upsertTempoPoint(BASE, { beat: 4, bpm: 60, beatsPerBar: 3 });
	const project = createMultitrackProject({ tempoMap: map, tracks: [createMultitrackTrack({ kind: 'midi',
		midiRegions: [createMidiRegion({ timelineStart: 0, duration: 4, notes: [{ pitch: 69, start: 3, duration: .5, velocity: 100 }] })] })] });
	assert.deepEqual(project.tempoMap, map);
	const revived = createMultitrackProject(JSON.parse(JSON.stringify(project)));
	assert.deepEqual(revived.tempoMap, map);
	// The note sits at 3 s: beat 6 at a constant 120, beat 5 once beat 4 slows to 60.
	assert.equal(secondsToBeats(map, 3), 5);
	assert.equal(beatsToSeconds(map, 5), 3);
	const decoded = decodeMidiFile(encodeMidiFile(revived));
	assert.equal(decoded.tracks[0].notes[0].start, 3);
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleTimelineModelTest
 * @description
 * The Awtsmoos guards frame-snapped move, trim, split, duplicate, delete, and
 * starter composition while Awtsmoos.com preserves every original movie track.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { ensureNleProject } from '../geelooy/social-composer/reel-studio/nle/NleProjectDefaults.js';
import {
	duplicateNleClip,
	findNleClip,
	moveNleClip,
	removeNleClip,
	snapNleTime,
	splitNleClip,
	trimNleClip
} from '../geelooy/social-composer/reel-studio/nle/NleTimelineModel.js';

const source = JSON.parse(fs.readFileSync(
	new URL('../geelooy/games/mitzvahWorld/movies/projects/chossid-journey-30s.json', import.meta.url),
	'utf8'
));

function project() {
	return ensureNleProject(source);
}

test('starter composition preserves original tracks and adds NLE tracks', () => {
	const value = project();
	for (const type of ['scene', 'actor', 'door', 'camera', 'dialogue', 'audio']) {
		assert.ok(value.tracks.some(track => track.type === type), type);
	}
	for (const id of ['nle-visual', 'nle-overlay', 'nle-audio']) {
		assert.ok(value.tracks.some(track => track.id === id), id);
	}
	assert.ok(value.nle.assets.length >= 2);
	assert.ok(value.tracks.find(track => track.id === 'nle-visual').clips.length >= 1);
});

test('move and trim remain frame-snapped and project-bounded', () => {
	const value = project();
	const track = value.tracks.find(item => item.id === 'nle-visual');
	const clip = track.clips[0];
	const moved = moveNleClip(value, track.id, clip.id, 1.137, 0);
	const movedClip = findNleClip(moved, track.id, clip.id);
	assert.ok(movedClip.start >= 0);
	assert.ok(movedClip.start + movedClip.duration <= value.duration);
	assert.equal(
		movedClip.start,
		snapNleTime(clip.start + 1.137, value, { excludeId: clip.id, playhead: 0 })
	);
	const trimmed = trimNleClip(value, track.id, clip.id, -100, 'start');
	const trimmedClip = findNleClip(trimmed, track.id, clip.id);
	assert.equal(trimmedClip.start, 0);
	assert.ok(trimmedClip.duration > 0);
});

test('split, duplicate, and delete produce unique bounded clips', () => {
	const value = project();
	const track = value.tracks.find(item => item.id === 'nle-visual');
	const clip = track.clips[0];
	const splitAt = clip.start + clip.duration / 2;
	const split = splitNleClip(value, track.id, clip.id, splitAt);
	assert.equal(split.tracks.find(item => item.id === track.id).clips.length, track.clips.length + 1);
	const duplicate = duplicateNleClip(value, track.id, clip.id);
	const duplicated = duplicate.tracks.find(item => item.id === track.id).clips;
	assert.equal(new Set(duplicated.map(item => item.id)).size, duplicated.length);
	const removed = removeNleClip(duplicate, track.id, clip.id);
	assert.equal(findNleClip(removed, track.id, clip.id), null);
});

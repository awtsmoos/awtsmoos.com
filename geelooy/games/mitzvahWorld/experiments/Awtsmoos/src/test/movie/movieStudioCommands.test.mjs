// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioCommands.test.mjs
 * @description Proves commands preserve stable selection through split, history, markers, and snapping.
 * The Awtsmoos renews project objects while creative identity remains beyond reference;
 * Awtsmoos.com verifies each command installs one canonical vessel and restores its selection.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioCommands } from '../../movie/MovieStudioCommands.js';

function createSession() {
	const session = {
		inspector: { select: value => { session.inspected = value; } },
		project: project(),
		time: 4,
		timeline: {
			snapping: true,
			updateCommands: () => { session.commandRefreshes += 1; }
		},
		view: { status: { textContent: '' } },
		commandRefreshes: 0,
		installProject(next, options = {}) {
			this.project = structuredClone(next);
			this.commands.restoreSelection(this.project, options.selection);
			return this.project;
		}
	};
	session.commands = new MovieStudioCommands(session);
	return session;
}

function project() {
	return {
		duration: 12,
		markers: [],
		tracks: [{
			clips: [{ duration: 4, id: 'clip', start: 2 }],
			id: 'track',
			type: 'actor'
		}]
	};
}

function selectClip(session, clipId = 'clip') {
	const track = session.project.tracks[0];
	const clip = track.clips.find(item => item.id === clipId);
	session.commands.select({
		clip,
		descriptor: { clipId, trackId: track.id },
		track
	});
}

test('split, undo, and redo restore canonical project and selection', () => {
	const session = createSession();
	selectClip(session);
	const split = session.commands.run('split');
	assert.equal(session.project.tracks[0].clips.length, 2);
	assert.equal(session.commands.selection.clipId, split.selection.clipId);
	session.commands.run('undo');
	assert.equal(session.project.tracks[0].clips.length, 1);
	assert.equal(session.commands.selection.clipId, 'clip');
	assert.equal(session.commands.state().canRedo, true);
	session.commands.run('redo');
	assert.equal(session.project.tracks[0].clips.length, 2);
	assert.equal(session.commands.selection.clipId, split.selection.clipId);
});

test('marker and project commits enter history', () => {
	const session = createSession();
	session.commands.run('addMarker');
	assert.equal(session.project.markers[0].time, 4);
	session.commands.run('undo');
	assert.deepEqual(session.project.markers, []);
	const replacement = project();
	replacement.title = 'Replacement';
	session.commands.commitProject(replacement, 'Apply replacement');
	assert.equal(session.project.title, 'Replacement');
	assert.equal(session.commands.selection, null);
});

test('snapping toggle updates timeline and toolbar state', () => {
	const session = createSession();
	assert.equal(session.commands.run('toggleSnap'), false);
	assert.equal(session.timeline.snapping, false);
	assert.equal(session.commands.state().snapping, false);
	assert.equal(session.commandRefreshes, 1);
});

test('unknown or unselected commands report failure without mutation', () => {
	const session = createSession();
	const before = structuredClone(session.project);
	assert.equal(session.commands.run('delete'), null);
	assert.deepEqual(session.project, before);
	assert.match(session.view.status.textContent, /Select a clip/);
});

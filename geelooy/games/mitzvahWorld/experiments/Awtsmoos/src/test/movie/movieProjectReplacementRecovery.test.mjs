// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProjectReplacementRecovery.test.mjs
 * @description Proves destructive replacement saves a verified generation before canonical commit.
 * The Awtsmoos renews former and arriving stories without loss; Awtsmoos.com verifies
 * browser failure, memory fallback, recovery evidence, and undoable replacement remain one path.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { createEmptyMovieProject } from '../../movie/MovieEmptyProject.js';
import { MovieEventBus } from '../../movie/MovieEventBus.js';
import { createDefaultMoviePersistenceRegistry } from '../../movie/MoviePersistenceDefaults.js';
import {
	commitMovieProjectWithRecovery,
	preserveMovieProjectBeforeReplacement
} from '../../movie/MovieProjectReplacementRecovery.js';

function session() {
	const events = new MovieEventBus();
	const commits = [];
	const value = {
		commands: {
			commitProject(project, label) {
				commits.push({ label, project });
				value.project = project;
				return project;
			}
		},
		commits,
		events,
		persistence: createDefaultMoviePersistenceRegistry(),
		preferences: {
			get: () => ({ density: 'compact' }),
			set: () => true
		},
		project: createEmptyMovieProject({ title: 'Before Replacement' }),
		revision: 7
	};
	return value;
}

test('preserve falls back to memory when browser storage is unavailable', async () => {
	const value = session();
	const recovery = await preserveMovieProjectBeforeReplacement(
		value,
		'Create empty movie project'
	);
	assert.equal(recovery.ok, true);
	assert.equal(recovery.adapterId, 'memory');
	assert.match(recovery.key, /^recovery-r7-/);
	const record = await value.persistence.get('memory').load(recovery.key);
	assert.equal(record.project.project.title, 'Before Replacement');
});

test('commit saves the prior project before calling the canonical replacement command', async () => {
	const value = session();
	let emitted = null;
	value.events.on('project:recovery-created', event => { emitted = event.detail; });
	const next = createEmptyMovieProject({ title: 'After Replacement' });
	const result = await commitMovieProjectWithRecovery(
		value,
		next,
		'Apply project JSON'
	);
	assert.equal(value.commits.length, 1);
	assert.equal(value.commits[0].label, 'Apply project JSON');
	assert.equal(value.project.title, 'After Replacement');
	assert.equal(result.recovery.ok, true);
	assert.equal(emitted.key, result.recovery.key);
	const record = await value.persistence.get('memory').load(result.recovery.key);
	assert.equal(record.project.project.title, 'Before Replacement');
});

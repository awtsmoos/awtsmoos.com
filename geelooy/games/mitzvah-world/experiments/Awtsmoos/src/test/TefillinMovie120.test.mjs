// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { normalizeMovieProject, validateMovieProject } from '../movie/MovieProject.js';
import { MovieTimeline } from '../movie/MovieTimeline.js';

const url = new URL('../../../../movies/projects/tefillin-shlichus-120s.json', import.meta.url);

test('validates the deterministic two-minute shlichus movie project', async () => {
	const project = normalizeMovieProject(JSON.parse(await readFile(url, 'utf8')));
	const validation = validateMovieProject(project);
	assert.equal(validation.ok, true, validation.issues.join('\n'));
	assert.equal(project.duration, 120);
	assert.equal(project.tracks.some(track => track.type === 'actor' && track.clips.some(clip => clip.animation === 'walk')), true);
	assert.equal(project.tracks.some(track => track.type === 'actor' && track.clips.some(clip => clip.action === 'talk')), true);
	const dialogue = project.tracks.find(track => track.type === 'dialogue');
	assert.deepEqual(new Set(dialogue.clips.map(clip => clip.speaker)), new Set(['Rabbi Dov Ber', 'Shliach', 'Levi', 'Daniel']));
	assert.ok(new MovieTimeline(project).active(118).length > 0);
});

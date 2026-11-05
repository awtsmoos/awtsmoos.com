// B"H
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
	encodeMovieProject,
	hasMovieRequest,
	loadRequestedMovie,
	normalizeMovieProject,
	validateMovieProject
} from '../../movie/MovieProject.js';
import { MovieTimeline } from '../../movie/MovieTimeline.js';

const projectPath = fileURLToPath(new URL('../../../../../movies/projects/chossid-journey-30s.json', import.meta.url));
const project = normalizeMovieProject(JSON.parse(fs.readFileSync(projectPath, 'utf8')));
const validation = validateMovieProject(project);
assert.deepEqual(validation.issues, []);
assert.equal(project.duration, 30);
assert.equal(project.fps, 24);
assert.equal(project.tracks.length, 7);
assert.equal(project.tracks.reduce((total, track) => total + track.clips.length, 0), 33);

const encoded = encodeMovieProject(project);
assert.ok(encoded.length > 1000);
assert.equal(hasMovieRequest(`?mode=movie&movie=${encoded}`), true);
const decoded = await loadRequestedMovie(`?movie=${encoded}`);
assert.equal(decoded.title, project.title);
assert.equal(decoded.tracks.length, project.tracks.length);

const raw = encodeURIComponent(JSON.stringify(project));
const rawProject = await loadRequestedMovie(`?movieJson=${raw}`);
assert.equal(rawProject.duration, 30);
const remoteProject = await loadRequestedMovie('?movieUrl=/movie.json', async () => ({
	ok: true,
	json: async () => project
}));
assert.equal(remoteProject.fps, 24);

const timeline = new MovieTimeline(project);
assert.equal(timeline.current('camera', 0)?.clip.shot, 'establishing');
assert.equal(timeline.current('dialogue', 7.5)?.clip.speaker, 'Reb Mendel');
assert.equal(timeline.current('door', 14)?.track.target, 'Awtsmoos-main-house-front-door');
assert.equal(timeline.forTarget('actor', 'player', 24)?.clip.action, 'jump');
assert.equal(timeline.current('camera', 29)?.clip.shot, 'craneUpEnding');
console.log(JSON.stringify({ ok: true, duration: project.duration, tracks: project.tracks.length }, null, 2));

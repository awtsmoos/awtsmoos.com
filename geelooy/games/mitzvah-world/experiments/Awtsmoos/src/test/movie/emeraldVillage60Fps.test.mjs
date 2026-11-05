// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file emeraldVillage60Fps.test.mjs
 * @description Proves Emerald Village declares third-person Full-HD exact 60 FPS video.
 * RESPONSIBILITY: verify cadence, viewpoint, resolution, frame/audio counts, bitrate, and schema.
 * NON-RESPONSIBILITY: this static test does not claim final decoded media or runtime performance.
 * The Awtsmoos renews the village at every instant; Awtsmoos.com keeps sixty frames per second
 * separate from the camera’s default third-person relationship to the visible player.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { exactAudioSampleFrames } from '../../movie/audio/MovieExactAudioContract.js';
import { MovieFrameCadence } from '../../movie/MovieFrameCadence.js';

const projectPath = fileURLToPath(new URL(
	'../../../../../movies/projects/emerald-village-shlichus-180s.json',
	import.meta.url
));
const schemaPath = fileURLToPath(new URL(
	'../../../../../movies/movie-project.schema.json',
	import.meta.url
));

test('Emerald Village declares third-person 1080p exact 60 FPS video', () => {
	const project = JSON.parse(fs.readFileSync(projectPath, 'utf8'));
	const cadence = new MovieFrameCadence(project.duration, project.fps)
		.assertWholeFrameDuration();
	assert.equal(project.duration, 180);
	assert.equal(project.fps, 60);
	assert.equal(project.viewMode, 'legacy');
	assert.equal(project.resolution.width, 1920);
	assert.equal(project.resolution.height, 1080);
	assert.equal(project.render.definition, 'full-hd-1080p');
	assert.equal(project.render.viewMode, 'thirdPersonGameplay');
	assert.ok(project.render.videoBitsPerSecond >= 28000000);
	assert.equal(cadence.expectedFrames, 10800);
	assert.equal(exactAudioSampleFrames(project.duration), 8640000);
	for (const track of project.tracks) {
		for (const clip of track.clips) {
			assert.ok(clip.start + clip.duration <= project.duration);
		}
	}
});

test('movie schema defaults cadence to 60 FPS and viewpoint to third person', () => {
	const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
	assert.equal(schema.properties.fps.default, 60);
	assert.equal(schema.properties.fps.maximum, 120);
	assert.equal(schema.properties.viewMode.default, 'legacy');
	assert.deepEqual(schema.properties.viewMode.enum, ['firstPerson', 'legacy']);
});

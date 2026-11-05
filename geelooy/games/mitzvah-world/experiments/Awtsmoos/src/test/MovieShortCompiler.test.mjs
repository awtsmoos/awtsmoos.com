// B"H
// Boruch Hashem
// Blessed is He

/** Proves one coherent authored world, safe cameras, one Chossid actor track, and synchronized media. */
import assert from 'node:assert/strict';
import test from 'node:test';
import { compileMovieShortProject } from '../movie/shorts/MovieShortCompiler.js';
import { resolveMovieShortHeroWorld } from '../movie/shorts/MovieShortHeroWorldDefinitions.js';

function shortSpec() {
	return {
		beats: [
			beat('The river flows from Eden.', 'river-garden', 7),
			beat('Understanding carries the current.', 'river-garden', 7),
			beat('The vessel becomes empty.', 'empty-vessel', 7),
			beat('The world is renewed every instant.', 'world-renewed', 7),
			beat('And the source is never exhausted.', 'infinite-light', 7)
		],
		hook: 'What is true satiation?', seed: 613,
		speaker: { audioUrl: '/media/speaker-audio.m4a', sourceOffset: 12.5, url: '/media/speaker.mp4' },
		title: 'The River From Eden'
	};
}

function beat(text, visual, duration, extra = {}) { return { duration, text, visual, ...extra }; }

test('compiles one coherent river location with safe cameras, Chossid, and synchronized media', () => {
	const source = shortSpec();
	const project = compileMovieShortProject(source);
	const location = resolveMovieShortHeroWorld('river-garden');
	assert.equal(project.duration, 35);
	assert.deepEqual(project.resolution, { height: 1920, width: 1080 });
	assert.equal(project.metadata.shortWorld, 'river-garden');
	const scenes = project.tracks.find(track => track.type === 'scene').clips;
	const cameras = project.tracks.find(track => track.type === 'camera').clips;
	const actors = project.tracks.find(track => track.type === 'actor' && track.target === 'player').clips;
	assert.equal(scenes.length, 5);
	assert.equal(actors.length, 5);
	for (let index = 0; index < scenes.length; index += 1) {
		assert.equal(scenes[index].shortVisual, source.beats[index].visual);
		assert.deepEqual(cameras[index].anchor, location.anchor);
		assert.ok(cameras[index].shot.startsWith('river-garden:'));
		assert.ok(cameras[index].from.position.x <= -4 && cameras[index].to.position.x <= -4);
		assert.deepEqual(actors[index].at, location.actor);
		assert.equal(actors[index].animation, 'talk');
	}
	const video = project.media.find(media => media.kind === 'video');
	const audio = project.media.find(media => media.kind === 'audio');
	assert.ok(video && audio && video.id !== audio.id);
	const composition = project.compositions.find(item => item.id === project.metadata.overlayCompositionId);
	assert.equal(composition.layers[0].sourceStart, 12.5);
	assert.equal(project.tracks.find(track => track.type === 'audio').clips[0].offset, 12.5);
	assert.equal(project.tracks.find(track => track.type === 'caption').clips[0].style.curve, 0.14);
});

test('one custom world instantly moves camera and Chossid independently', () => {
	const source = shortSpec();
	source.world = {
		actor: { x: 18, z: -28 }, anchor: { x: 21, y: 7, z: -31 }, label: 'Custom stone court'
	};
	const project = compileMovieShortProject(source);
	assert.equal(project.metadata.shortWorld, 'custom-authored');
	assert.deepEqual(project.tracks.find(track => track.type === 'camera').clips[0].anchor, source.world.anchor);
	assert.deepEqual(project.tracks.find(track => track.type === 'actor').clips[0].at, source.world.actor);
});

test('a beat anchor explicitly overrides location staging for camera and Chossid', () => {
	const source = shortSpec();
	source.beats[0] = beat('The river flows from Eden.', 'river-garden', 7, {
		anchor: { x: 101, y: 7, z: -22 }
	});
	const project = compileMovieShortProject(source);
	assert.deepEqual(project.tracks.find(track => track.type === 'camera').clips[0].anchor, source.beats[0].anchor);
	assert.deepEqual(project.tracks.find(track => track.type === 'actor').clips[0].at, { x: 101, z: -22 });
});

test('rejects Shorts outside the 30–50 second contract', () => {
	const source = shortSpec();
	source.beats = [beat('Too short.', 'river-garden', 10)];
	assert.throws(() => compileMovieShortProject(source), /30–50 seconds/);
});

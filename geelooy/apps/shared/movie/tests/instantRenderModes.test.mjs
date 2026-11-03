//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file instantRenderModes.test.mjs
 * @description The instant generator is proven where it can be proven without a browser;
 * Awtsmoos.com tests render-mode law, camera plans, graph construction, frame determinism, templates, and the photo compositor against stub vessels.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
	binahMigrateMovie,
	createMovieDocument,
	gevurahValidateMovie,
	normalizeMovie
} from '../index.js';
import {
	MovieRenderMode,
	autoSceneRenderMode,
	describeMovieRenderModes,
	resolveMovieRenderGrade,
	resolveSceneRenderMode,
	validateMovieRenderModes
} from '../render/MovieRenderModes.js';
import {
	cameraRigFor,
	kenBurnsFor,
	sampleCameraRig,
	sampleKenBurns
} from '../render/CameraMotionPlan.js';
import {
	buildFramePlan,
	buildRenderGraph,
	buildSceneRenderPlan,
	isChossidReference,
	resolveLayerImageSource,
	stageDescriptor
} from '../render/RenderGraph.js';
import { sampleMovieFrame } from '../runtime/MovieSceneSampler.js';
import { PhotoImageCache, movieImageSources } from '../runtime/PhotoImageCache.js';
import { PhotoCompositor } from '../runtime/PhotoCompositor.js';
import { mulberry32 } from '../runtime/CinematicGrade.js';
import {
	createHybridTemplate,
	createInstantMovieTemplate,
	createPhotoStoryTemplate,
	createThreeDSceneTemplate,
	describeInstantMovieTemplates
} from '../examples/InstantMovieTemplates.js';

const baseMovie = (overrides = {}) => normalizeMovie({
	protocol: 'awtsmoos-movie-v1',
	version: 1,
	id: 'test-movie',
	duration: 10,
	format: { width: 1280, height: 720, fps: 30 },
	scenes: [{
		id: 's1', start: 0, duration: 10, camera: { kind: 'wide' },
		layers: [{ id: 'title', kind: 'text', start: 0, duration: 10, content: { text: 'Hello' } }]
	}],
	...overrides
});

test('factory and migration preserve render intent only when authored', () => {
	const withRender = createMovieDocument({ id: 'a', duration: 5, render: { mode: '3d' }, scenes: [] });
	assert.deepEqual(withRender.render, { mode: '3d' });
	const withoutRender = createMovieDocument({ id: 'b', duration: 5, scenes: [] });
	assert.equal('render' in withoutRender, false);
	const source = createPhotoStoryTemplate();
	const migrated = binahMigrateMovie(source);
	assert.deepEqual(migrated.render, source.render);
	const plain = baseMovie();
	assert.equal('render' in binahMigrateMovie(plain), false);
});

test('validator rejects unknown render modes and lists the accepted ones', () => {
	const badMovie = baseMovie({ render: { mode: '4d' } });
	const report = gevurahValidateMovie(badMovie);
	assert.equal(report.valid, false);
	const issue = report.errors.find(entry => entry.code === 'RENDER_MODE');
	assert.ok(issue, 'expected a RENDER_MODE error');
	assert.ok(issue.message.includes('auto, 2d, 3d, hybrid'), issue.message);
	const badScene = baseMovie();
	badScene.scenes[0].render = { mode: 'hologram' };
	const sceneReport = gevurahValidateMovie(badScene);
	assert.ok(sceneReport.errors.some(entry => entry.code === 'RENDER_MODE' && entry.path === 'scenes[0].render.mode'));
	for (const mode of ['auto', '2d', '3d', 'hybrid']) {
		assert.equal(gevurahValidateMovie(baseMovie({ render: { mode } })).valid, true, mode);
	}
	assert.equal(validateMovieRenderModes(baseMovie()).length, 0);
	assert.equal(describeMovieRenderModes().length, 4);
});

test('render mode resolution: scene beats movie beats auto detection', () => {
	const stageScene = { id: 'x', layers: [{ id: 'w', kind: 'world3d' }] };
	assert.equal(autoSceneRenderMode(stageScene), '3d');
	assert.equal(autoSceneRenderMode({ id: 'x', layers: [{ id: 'w', kind: 'world3d' }, { id: 't', kind: 'text' }] }), 'hybrid');
	assert.equal(autoSceneRenderMode({ id: 'x', layers: [{ id: 'i', kind: 'image' }] }), '2d');
	assert.equal(autoSceneRenderMode({ id: 'x', layers: [] }), '2d');
	const movie = { render: { mode: '2d' } };
	assert.deepEqual(resolveSceneRenderMode(movie, stageScene), { requested: '2d', effective: '2d', source: 'movie' });
	assert.deepEqual(
		resolveSceneRenderMode(movie, { ...stageScene, render: { mode: '3d' } }),
		{ requested: '3d', effective: '3d', source: 'scene' }
	);
	assert.deepEqual(resolveSceneRenderMode({}, stageScene), { requested: 'auto', effective: '3d', source: 'auto' });
	assert.equal(resolveSceneRenderMode({ render: { mode: 'bogus' } }, stageScene).effective, '3d');
});

test('grade resolution merges movie then scene and clamps to sane ranges', () => {
	const grade = resolveMovieRenderGrade(
		{ render: { grade: { vignette: 5, letterbox: 0.1 } } },
		{ render: { grade: { grain: 0.2 } } }
	);
	assert.equal(grade.vignette, 0.85);
	assert.equal(grade.letterbox, 0.1);
	assert.equal(grade.grain, 0.2);
	assert.equal(grade.enabled, true);
	assert.equal(resolveMovieRenderGrade({}, null).temperature, 0);
	assert.equal(resolveMovieRenderGrade({ render: { grade: { enabled: false } } }, null).enabled, false);
});

test('ken burns plans are deterministic and camera-specific', () => {
	const wide = kenBurnsFor('wide');
	assert.deepEqual(sampleKenBurns(wide, 0), { scale: 1, x: 0, y: 0 });
	assert.equal(sampleKenBurns(wide, 1).scale, 1.08);
	assert.deepEqual(sampleKenBurns(wide, 0.37), sampleKenBurns(wide, 0.37));
	assert.ok(kenBurnsFor('dolly').scaleTo > wide.scaleTo, 'dolly pushes in further than wide');
	assert.ok(kenBurnsFor('closeup').scaleFrom > wide.scaleFrom, 'closeup starts cropped in');
	assert.notEqual(sampleKenBurns(kenBurnsFor('pov'), 0.25).x, 0, 'pov sways');
	assert.deepEqual(kenBurnsFor('nonsense'), wide);
});

test('camera rigs are deterministic, framed per kind, and honor authored anchors', () => {
	const orbit = cameraRigFor('orbit');
	const mid = sampleCameraRig(orbit, 0.5);
	assert.ok(Math.abs(mid.position.x) < 0.001, 'orbit midpoint faces the stage');
	assert.ok(Math.abs(mid.position.z - 30) < 0.001);
	assert.deepEqual(sampleCameraRig(orbit, 0.5), mid);
	assert.ok(sampleCameraRig(cameraRigFor('overhead'), 0).position.y > 35, 'overhead flies high');
	assert.ok(sampleCameraRig(cameraRigFor('dolly'), 1).position.z < sampleCameraRig(cameraRigFor('dolly'), 0).position.z);
	const anchored = cameraRigFor('wide', { position: { x: 3, y: 9, z: 40 } });
	assert.deepEqual(sampleCameraRig(anchored, 0).position, { x: 3, y: 9, z: 40 });
	const defaulted = cameraRigFor('wide', { position: { x: 0, y: 0, z: 8 } });
	assert.deepEqual(sampleCameraRig(defaulted, 0).position, { x: 0, y: 7, z: 34 });
});

test('render graph partitions plate, overlays, and sound per mode', () => {
	const photo = buildRenderGraph(normalizeMovie(createPhotoStoryTemplate()));
	assert.equal(photo.scenes[0].mode.effective, '2d');
	assert.equal(photo.scenes[0].background.kind, 'image');
	assert.equal(photo.scenes[0].plate.length, 0);
	assert.ok(photo.scenes[1].overlays.some(layer => layer.kind === 'image'));

	const stage = buildRenderGraph(normalizeMovie(createThreeDSceneTemplate()));
	const court = stage.scenes[0];
	assert.equal(court.mode.effective, '3d');
	const hero = court.plate.find(entry => entry.layerId === 'hero');
	assert.equal(hero.model, 'chossid');
	assert.equal(hero.form, 'character');
	assert.equal(court.plate.find(entry => entry.layerId === 'arch').primitive, 'arch');
	assert.ok(court.overlays.some(layer => layer.kind === 'text'), 'text stays an overlay even in 3d');
	const elder = stage.scenes[1].plate.find(entry => entry.layerId === 'elder');
	assert.equal(elder.model, 'procedural');
	assert.equal(elder.primitive, 'figure');
	assert.ok(stage.warnings.some(warning => warning.code === 'PROCEDURAL_MODEL' && warning.layerId === 'elder'));

	const hybrid = buildRenderGraph(normalizeMovie(createHybridTemplate()));
	assert.equal(hybrid.scenes[0].mode.effective, 'hybrid');
	assert.ok(hybrid.scenes[0].overlays.some(layer => layer.id === 'h-photo'), 'hybrid keeps photos as overlays');
	assert.ok(hybrid.scenes[0].plate.some(entry => entry.layerId === 'h-arch'));
});

test('render graph names missing photographs and demotes photo backdrops to stage backdrops in 3d', () => {
	const missing = baseMovie({
		scenes: [{
			id: 's1', start: 0, duration: 10, camera: { kind: 'wide' },
			layers: [{ id: 'ghost', kind: 'image', start: 0, duration: 10, content: {} }]
		}]
	});
	const missingPlan = buildSceneRenderPlan(missing, missing.scenes[0]);
	assert.ok(missingPlan.warnings.some(warning => warning.code === 'MISSING_IMAGE' && warning.layerId === 'ghost'));

	const staged = baseMovie({
		render: { mode: '3d' },
		scenes: [{
			id: 's1', start: 0, duration: 10, camera: { kind: 'wide' },
			background: { image: 'https://example.com/backdrop.jpg' },
			layers: [{ id: 'w', kind: 'world3d', start: 0, duration: 10, content: {} }]
		}]
	});
	const stagedPlan = buildSceneRenderPlan(staged, staged.scenes[0]);
	const backdrop = stagedPlan.plate.find(entry => entry.form === 'backdrop');
	assert.ok(backdrop, 'background photo becomes a stage backdrop in 3d');
	assert.equal(backdrop.textureSrc, 'https://example.com/backdrop.jpg');

	const billboardMovie = baseMovie({
		render: { mode: '3d' },
		assets: [{ id: 'pic', src: 'https://example.com/pic.jpg' }],
		scenes: [{
			id: 's1', start: 0, duration: 10, camera: { kind: 'wide' },
			layers: [{ id: 'pic-layer', kind: 'image', start: 0, duration: 10, content: { assetId: 'pic' } }]
		}]
	});
	const billboardPlan = buildSceneRenderPlan(billboardMovie, billboardMovie.scenes[0]);
	assert.equal(billboardPlan.plate.find(entry => entry.form === 'billboard').textureSrc, 'https://example.com/pic.jpg');
	assert.equal(resolveLayerImageSource(billboardMovie, billboardMovie.scenes[0].layers[0]), 'https://example.com/pic.jpg');
	assert.equal(isChossidReference({ content: { character: 'chossid' } }), true);
	assert.equal(isChossidReference({ content: { primitive: 'box' } }), false);
	assert.equal(stageDescriptor({}, { id: 'm', kind: 'model3d', content: { primitive: 'extruded-cube' } }).primitive, 'box');
});

test('frame plans are deterministic and mode changes never move the timeline', () => {
	const authored = {
		protocol: 'awtsmoos-movie-v1', version: 1, id: 'modes', duration: 10,
		format: { width: 1280, height: 720, fps: 30 },
		scenes: [{
			id: 's1', start: 0, duration: 10, camera: { kind: 'dolly' },
			layers: [{
				id: 'arch', kind: 'model3d', start: 0, duration: 10, content: { primitive: 'arch' },
				keyframes: [
					{ at: 0, channel: 'transform.x', value: 0 },
					{ at: 10, channel: 'transform.x', value: 2 }
				]
			}]
		}]
	};
	const plans = ['2d', '3d', 'hybrid'].map(mode =>
		buildFramePlan(normalizeMovie({ ...structuredClone(authored), render: { mode } }), 5));
	for (const plan of plans) {
		assert.equal(plan.sceneId, 's1');
		assert.equal(plan.localTime, 5);
		assert.equal(plan.layers[0].transform.x, 1, 'keyframe sampling is mode-independent');
		assert.equal(plan.frameIndex, 150);
	}
	assert.deepEqual(plans.map(plan => plan.mode.effective), ['2d', '3d', 'hybrid']);
	const movie = normalizeMovie(structuredClone(authored));
	assert.deepEqual(buildFramePlan(movie, 5), buildFramePlan(movie, 5), 'same time, same frame description');
	assert.ok(buildFramePlan(movie, 5).camera.sample.rig.position.z < 38, 'dolly rig moves in');
});

test('all three instant templates validate as canonical movies', () => {
	assert.deepEqual(describeInstantMovieTemplates().map(entry => entry.mode), ['2d', '3d', 'hybrid']);
	for (const create of [createPhotoStoryTemplate, createThreeDSceneTemplate, createHybridTemplate]) {
		const movie = normalizeMovie(create());
		const report = gevurahValidateMovie(movie);
		assert.equal(report.valid, true, `${movie.id}: ${JSON.stringify(report.errors)}`);
		assert.equal(movie.render.mode, create().render.mode);
	}
	assert.throws(() => createInstantMovieTemplate('nope'), /Unknown instant movie template/);
	assert.equal(createInstantMovieTemplate('instant-hybrid').id, 'instant-hybrid');
});

test('photo image cache reports ready, pending, and failed honestly', async () => {
	const fakeImage = { width: 1600, height: 900 };
	const cache = new PhotoImageCache(async src => {
		if (src.includes('bad')) throw new Error('nope');
		return fakeImage;
	});
	assert.equal(cache.status('https://x/ok.jpg'), 'unknown');
	await cache.preload(['https://x/ok.jpg', 'https://x/bad.jpg']);
	assert.equal(cache.status('https://x/ok.jpg'), 'ready');
	assert.equal(cache.get('https://x/ok.jpg'), fakeImage);
	assert.equal(cache.status('https://x/bad.jpg'), 'failed');
	assert.equal(cache.get('https://x/bad.jpg'), null);
	assert.deepEqual(cache.snapshot(), { ready: 1, pending: 0, failed: 1 });
	const sources = movieImageSources(normalizeMovie(createPhotoStoryTemplate()));
	assert.equal(sources.length, 3, 'three photographs across backgrounds and the placed card');
	assert.ok(sources.every(src => src.startsWith('https://picsum.photos/')));
});

class RecordingContext {
	constructor() {
		this.calls = [];
		this.fillStyle = null;
		this.strokeStyle = null;
		this.font = null;
		this.textAlign = null;
		this.globalAlpha = 1;
		this.globalCompositeOperation = 'source-over';
	}
	record(name, args) { this.calls.push({ name, args }); }
	save() { this.record('save', []); }
	restore() { this.record('restore', []); }
	translate(...args) { this.record('translate', args); }
	rotate(...args) { this.record('rotate', args); }
	fillRect(...args) { this.record('fillRect', args); }
	strokeRect(...args) { this.record('strokeRect', args); }
	drawImage(...args) { this.record('drawImage', args); }
	fillText(...args) { this.record('fillText', args); }
	beginPath() { this.record('beginPath', []); }
	roundRect(...args) { this.record('roundRect', args); }
	fill() { this.record('fill', []); }
	stroke() { this.record('stroke', []); }
	createLinearGradient() { return { addColorStop: () => {} }; }
	createRadialGradient() { return { addColorStop: () => {} }; }
	createPattern() { return {}; }
}

test('photo compositor paints plates, captions, and the grade; failures are labelled', async () => {
	const movie = normalizeMovie(createPhotoStoryTemplate());
	const fakeImage = { width: 1600, height: 900 };
	const cache = new PhotoImageCache(async () => fakeImage);
	await cache.preload(movieImageSources(movie));
	const compositor = new PhotoCompositor({ imageCache: cache });
	const context = new RecordingContext();
	const framePlan = buildFramePlan(movie, 1);
	const frame = sampleMovieFrame(movie, 1);
	const warnings = compositor.paint(context, movie, framePlan, frame, { width: 1280, height: 720 });
	assert.equal(warnings.length, 0);
	assert.ok(context.calls.some(call => call.name === 'drawImage' && call.args[0] === fakeImage), 'plate photograph painted');
	assert.ok(context.calls.some(call => call.name === 'fillText' && String(call.args[0]).includes('First light')), 'caption painted');
	assert.ok(context.calls.some(call =>
		call.name === 'fillRect' && call.args[1] === 0 && call.args[3] === Math.round(720 * 0.07)
	), 'letterbox bar painted from the declared grade');

	const failingCache = new PhotoImageCache(async () => { throw new Error('offline'); });
	await failingCache.preload(movieImageSources(movie));
	const failingCompositor = new PhotoCompositor({ imageCache: failingCache });
	const failingContext = new RecordingContext();
	const failingWarnings = failingCompositor.paint(
		failingContext, movie, framePlan, frame, { width: 1280, height: 720 });
	assert.ok(failingWarnings.some(warning => warning.code === 'IMAGE_LOAD_FAILED'), 'failure is reported');
	assert.ok(failingContext.calls.some(call =>
		call.name === 'fillText' && String(call.args[0]).includes('Image unavailable')
	), 'failure is labelled on the frame itself, never a silent blank');
});

test('grade randomness is a pure function of its seed', () => {
	const first = mulberry32(42);
	const second = mulberry32(42);
	assert.deepEqual([first(), first(), first()], [second(), second(), second()]);
	assert.notEqual(mulberry32(43)(), mulberry32(42)());
});

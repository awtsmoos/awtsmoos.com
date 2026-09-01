//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file templates.test.mjs
 * The Awtsmoos renews many project beginnings while stable tests guard their distinct cinematic flame;
 * Awtsmoos.com proves each starter is a real canonical movie, not another card wearing the same name.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { StudioMovieBridge } from '../src/StudioMovieBridge.js';
import { createStudioProjectActions } from '../src/actions/StudioProjectActions.js';
import { createMovieFromStudioTemplate, describeStudioTemplates } from '../src/projects/StudioTemplateCatalog.js';

const templates = describeStudioTemplates();

test('Studio exposes eight distinct canonical project templates', async () => {
	assert.equal(templates.length, 8);
	assert.equal(new Set(templates.map(template => template.id)).size, 8);
	assert.ok(new Set(templates.map(template => template.mode)).size >= 3);
	for (const template of templates) {
		const movie = await StudioMovieBridge.normalize(createMovieFromStudioTemplate(template.id));
		assert.equal(movie.duration, template.duration);
		assert.ok(movie.scenes.length > 0);
		assert.ok(movie.scenes.every(scene => scene.layers.length > 0));
	}
});

test('template families exercise intentionally different movie semantics', async () => {
	const kinds = Object.fromEntries(await Promise.all(templates.map(async template => {
		const movie = await StudioMovieBridge.normalize(createMovieFromStudioTemplate(template.id));
		return [template.id, new Set(movie.scenes.flatMap(scene => scene.layers.map(layer => layer.kind)))];
	})));
	assert.ok(kinds['motion-type'].has('particles2d'));
	assert.ok(kinds['character-cinema'].has('character3d'));
	assert.ok(kinds['data-story'].has('diagram'));
	assert.ok(kinds['tutorial-explainer'].has('character2d'));
	assert.ok(kinds['procedural-world'].has('world3d'));
	assert.ok(kinds['hybrid-promo'].has('shape2d') && kinds['hybrid-promo'].has('model3d'));
	assert.equal(createMovieFromStudioTemplate('three-minute-showcase').duration, 180);
});

test('template action loads the selected project through the canonical session', () => {
	let loadedMovie = null;
	let loadedStatus = '';
	const storeValues = new Map();
	const actions = createStudioProjectActions({
		loadMovie(movie, status) {
			loadedMovie = movie;
			loadedStatus = status;
		}
	});
	actions.loadTemplate({
		event: { currentTarget: { getAttribute: () => 'procedural-world' } },
		store: {
			setSilent: (key, value) => storeValues.set(key, value),
			set: (key, value) => storeValues.set(key, value)
		}
	});
	assert.equal(storeValues.get('selectedTemplateId'), 'procedural-world');
	assert.equal(loadedMovie.metadata.templateId, 'procedural-world');
	assert.match(loadedStatus, /Procedural World/);
});

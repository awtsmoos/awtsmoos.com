// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieProjectBrowser.test.mjs
 * @description Proves verified save, duplicate, export, restore, remove, autosave, markup, and localized CSS.
 * The Awtsmoos renews memory beyond every storage vessel; Awtsmoos.com verifies
 * the visible recovery library rests on checksummed records and undoable canonical installation.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieAutosaveController } from '../../movie/MovieAutosaveController.js';
import { createEmptyMovieProject } from '../../movie/MovieEmptyProject.js';
import { MovieEventBus } from '../../movie/MovieEventBus.js';
import { createDefaultMoviePersistenceRegistry } from '../../movie/MoviePersistenceDefaults.js';
import { MovieStudioProjectBrowserService } from '../../movie/MovieStudioProjectBrowserService.js';
import { movieStudioProjectBrowserMarkup } from '../../movie/MovieStudioProjectBrowserMarkup.js';
import { movieStudioStyleText } from '../../movie/MovieStudioStyleText.js';
import {
	movieStudioUtilitySurfacesMarkup,
	movieStudioUtilityToolbarMarkup
} from '../../movie/MovieStudioUtilityMarkup.js';

function session() {
	const events = new MovieEventBus();
	const value = {
		commands: {
			commitProject(project) {
				value.project = project;
				value.revision += 1;
				events.emit('project:changed', { revision: value.revision });
			}
		},
		events,
		persistence: createDefaultMoviePersistenceRegistry(),
		preferences: {
			get: () => ({ density: 'compact', theme: 'awtsmoos-dark' }),
			set: () => true
		},
		project: createEmptyMovieProject({ title: 'Recovery Test' }),
		revision: 1
	};
	value.autosave = new MovieAutosaveController(value);
	return value;
}

test('service saves, lists, duplicates, exports, restores, and removes checksummed records', async () => {
	const value = session();
	const service = new MovieStudioProjectBrowserService(value);
	await service.save('memory', 'first');
	assert.deepEqual((await service.list('memory')).map(record => record.key), ['first']);
	const duplicate = await service.duplicate('memory', 'first');
	assert.equal(duplicate.key, 'first-copy');
	assert.deepEqual(
		(await service.list('memory')).map(record => record.key),
		['first', 'first-copy']
	);
	const exported = JSON.parse(await service.export('memory', 'first'));
	assert.equal(exported.title, 'Recovery Test');
	value.project = createEmptyMovieProject({ title: 'Changed' });
	await service.restore('memory', 'first');
	assert.equal(value.project.title, 'Recovery Test');
	await service.remove('memory', 'first-copy');
	assert.deepEqual((await service.list('memory')).map(record => record.key), ['first']);
});

test('service starts and stops autosave against the requested adapter and key', async () => {
	const value = session();
	const service = new MovieStudioProjectBrowserService(value);
	const started = service.toggleAutosave('memory', 'autosave-test');
	assert.equal(started.active, true);
	await value.autosave.flush();
	assert.deepEqual(
		(await service.list('memory')).map(record => record.key),
		['autosave-test']
	);
	assert.equal(service.toggleAutosave('memory', 'autosave-test').active, false);
});

test('project drawer markup and localized CSS expose recovery controls', () => {
	const markup = movieStudioProjectBrowserMarkup();
	for (const token of [
		'data-project-browser-adapter',
		'data-project-browser-save',
		'data-project-browser-autosave',
		'data-project-browser-list',
		'data-project-browser-export'
	]) assert.match(markup, new RegExp(token));
	assert.match(movieStudioUtilityToolbarMarkup(), /Projects/);
	assert.match(movieStudioUtilitySurfacesMarkup(), /Projects &amp; Recovery|Projects & Recovery/);
	assert.match(movieStudioStyleText(), /\.Awtsmoos-movie-studio \.movie-project-browser/);
});

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieAiEntrypointWiring.test.mjs
 * @description Historic filename, data-only wiring proof: the Awtsmoos joins one declared movie protocol to five doors;
 * Awtsmoos.com verifies every compatibility installer loads Movie Data Runtime and never discovers an AI provider anymore.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const projectRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const studios = [
	['Animator', 'apps/animator/src/main.js', 'apps/animator/src/sharedMovie/installMovieAi.js', './sharedMovie/installMovieAi.js'],
	['Nesher Studio', 'apps/nesher-studio/main.js', 'apps/nesher-studio/modules/movie/installMovieAi.js', './modules/movie/installMovieAi.js'],
	['Video Editor', 'apps/video-editor/js/app.js', 'apps/video-editor/js/movie/installMovieAi.js', './movie/installMovieAi.js'],
	['Mitzvah Studio', 'apps/mitzvah-studio/main.js', 'apps/mitzvah-studio/modules/movie/installMovieAi.js', './modules/movie/installMovieAi.js'],
	['Captions', 'apps/captions/js/app.js', 'apps/captions/js/movie/installMovieAi.js', './movie/installMovieAi.js']
];

test('every movie studio retains its compatibility installer entrypoint', async () => {
	for (const [name, entry, installer, importNeedle] of studios) {
		void installer;
		const source = await readFile(path.join(projectRoot, entry), 'utf8');
		assert.ok(source.includes(importNeedle), `${name} must load its movie-data installer`);
	}
});

test('every installer uses structured data runtime and no provider discovery', async () => {
	for (const [name, entry, installer] of studios) {
		void entry;
		const absolutePath = path.join(projectRoot, installer);
		const source = await readFile(absolutePath, 'utf8');
		assert.ok(source.includes('installMovieDataRuntime'), `${name} must use data runtime`);
		assert.equal(source.includes('AwtsmoosMovieAiProvider'), false, `${name} must not discover providers`);
		assert.equal(source.includes('provider:'), false, `${name} must not inject providers`);
		await assert.doesNotReject(import(`${pathToFileURL(absolutePath).href}?data-wiring=${encodeURIComponent(name)}`));
	}
});

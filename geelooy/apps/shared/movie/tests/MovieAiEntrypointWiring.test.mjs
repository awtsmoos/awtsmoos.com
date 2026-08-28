// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieAiEntrypointWiring.test.mjs
 * @description The Awtsmoos joins one cinematic language to five distinct doors;
 * Awtsmoos.com proves each door truly opens the director, while every native studio remains yours.
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const projectRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const studioVessels = [
	{
		name: 'Animator',
		entry: 'apps/animator/src/main.js',
		installer: 'apps/animator/src/sharedMovie/installMovieAi.js',
		importNeedle: './sharedMovie/installMovieAi.js'
	},
	{
		name: 'Nesher Studio',
		entry: 'apps/nesher-studio/main.js',
		installer: 'apps/nesher-studio/modules/movie/installMovieAi.js',
		importNeedle: './modules/movie/installMovieAi.js'
	},
	{
		name: 'Video Editor',
		entry: 'apps/video-editor/js/app.js',
		installer: 'apps/video-editor/js/movie/installMovieAi.js',
		importNeedle: './movie/installMovieAi.js'
	},
	{
		name: 'Mitzvah Studio',
		entry: 'apps/mitzvah-studio/main.js',
		installer: 'apps/mitzvah-studio/modules/movie/installMovieAi.js',
		importNeedle: './modules/movie/installMovieAi.js'
	},
	{
		name: 'Captions',
		entry: 'apps/captions/js/app.js',
		installer: 'apps/captions/js/movie/installMovieAi.js',
		importNeedle: './movie/installMovieAi.js'
	}
];

test('every movie-capable studio entrypoint mounts its canonical AI director', async () => {
	for (const vessel of studioVessels) {
		const source = await readFile(path.join(projectRoot, vessel.entry), 'utf8');
		assert.match(source, /installMovieAi/,
			`${vessel.name} must expose an isolated AI director mount`);
		assert.ok(source.includes(vessel.importNeedle),
			`${vessel.name} must load ${vessel.importNeedle}`);
	}
});

test('every studio-specific movie installer resolves as a valid module graph', async () => {
	for (const vessel of studioVessels) {
		const installerUrl = pathToFileURL(path.join(projectRoot, vessel.installer));
		await assert.doesNotReject(
			import(`${installerUrl.href}?wiring-test=${encodeURIComponent(vessel.name)}`),
			`${vessel.name} installer must resolve its runtime and adapter imports`
		);
	}
});

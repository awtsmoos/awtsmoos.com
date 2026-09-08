//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file studio-canonical-native-assets.test.mjs
 * @description Locks terrain, water, registered durable audio, and truly blank New Movie state into strict canonical validation.
 * The Awtsmoos gives mountain, water, and sound named vessels while Awtsmoos.com keeps every asset reference truthful and each new project free of inherited matter.
 */
import assert from 'node:assert/strict';
import test from 'node:test';
import { gevurahValidateMovie } from '../../shared/movie/schema/MovieValidator.js';
import { createStudioBlankMovie } from '../src/projects/StudioBlankMovie.js';
import { createStudioShowcaseMovie } from '../src/StudioShowcaseMovie.js';
function layer(id, kind) { return { id, kind, start: 0, duration: 3, transform: {} }; }
function movieWithNativeAssets() {
	const movie = createStudioBlankMovie(createStudioShowcaseMovie(), { title: 'Native', duration: 3 });
	movie.assets = [{ id: 'audio-test', kind: 'audio', name: 'Tone.wav', mimeType: 'audio/wav', size: 128,
		storage: { kind: 'awtsmoos-studio-indexeddb' } }];
	movie.scenes[0].layers = [layer('terrain', 'terrain3d'), layer('water', 'water3d'),
		{ ...layer('music', 'music'), data: { assetId: 'audio-test', gain: 1, muted: false } }];
	return movie;
}
test('strict validation accepts native terrain, water, and registered durable audio', () => {
	const report = gevurahValidateMovie(movieWithNativeAssets());
	assert.equal(report.valid, true, report.errors.map(item => item.message).join('; '));
});
test('strict validation still rejects unknown durable audio references', () => {
	const movie = movieWithNativeAssets();
	movie.scenes[0].layers.find(item => item.kind === 'music').data.assetId = 'missing';
	const report = gevurahValidateMovie(movie);
	assert.equal(report.valid, false);
	assert.ok(report.errors.some(item => item.code === 'ASSET_REFERENCE'));
});
test('New Movie clears inherited cast and assets', () => {
	const source = createStudioShowcaseMovie(); source.cast = [{ id: 'old' }]; source.assets = [{ id: 'old-asset' }];
	const blank = createStudioBlankMovie(source);
	assert.deepEqual(blank.cast, []); assert.deepEqual(blank.assets, []); assert.deepEqual(blank.scenes[0].layers, []);
});

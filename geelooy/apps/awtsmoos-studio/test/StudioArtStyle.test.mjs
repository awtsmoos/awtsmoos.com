//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioArtStyle.test.mjs
 * @description Proves the art-style system resolves styles, stamps movies consistently,
 * and derives renderer parameters from one source of truth per style.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	applyArtStyleToMovie,
	DEFAULT_ART_STYLE_ID,
	resolveArtStyle,
	STUDIO_ART_STYLE_IDS,
	STUDIO_ART_STYLES,
	styleRenderParams
} from '../src/movie/StudioArtStyle.js';

test('all expected styles are defined', () => {
	for (const id of ['hyperrealistic', 'stylized', 'anime', 'cinematic', 'watercolor']) {
		assert.ok(STUDIO_ART_STYLES[id], `style ${id} exists`);
		assert.ok(STUDIO_ART_STYLE_IDS.includes(id));
	}
});

test('resolveArtStyle falls back to default for unknown ids', () => {
	assert.equal(resolveArtStyle('hyperrealistic').id, 'hyperrealistic');
	assert.equal(resolveArtStyle('nope').id, DEFAULT_ART_STYLE_ID);
	assert.equal(resolveArtStyle(null).id, DEFAULT_ART_STYLE_ID);
});

test('each style has complete lighting, grading, material, character, set, and atmosphere blocks', () => {
	for (const id of STUDIO_ART_STYLE_IDS) {
		const s = STUDIO_ART_STYLES[id];
		for (const block of ['lighting', 'grading', 'materials', 'characters', 'sets', 'atmosphere']) {
			assert.ok(s[block] && typeof s[block] === 'object', `${id}.${block} exists`);
		}
	}
});

test('anime style enables cel shading with outlines', () => {
	const anime = resolveArtStyle('anime');
	assert.equal(anime.materials.celShading, true);
	assert.ok(anime.materials.outlineWidth > 0);
	assert.ok(anime.characters.eyeScale > 1.5);
});

test('hyperrealistic style maximizes physical light response', () => {
	const real = resolveArtStyle('hyperrealistic');
	assert.ok(real.lighting.globalIllumination >= 0.9);
	assert.ok(real.lighting.ambientOcclusion >= 0.8);
	assert.ok(real.characters.proportionRealism >= 0.95);
});

test('applyArtStyleToMovie stamps every scene with the style id', () => {
	const movie = {
		title: 'Test',
		scenes: [{ id: 's1' }, { id: 's2' }, { id: 's3' }]
	};
	const styled = applyArtStyleToMovie(movie, 'anime');
	assert.equal(styled.artStyleId, 'anime');
	assert.equal(styled.artStyle.id, 'anime');
	for (const scene of styled.scenes) {
		assert.equal(scene.artStyleId, 'anime');
	}
	// original movie is not mutated
	assert.ok(!movie.artStyleId);
});

test('styleRenderParams derives one consistent param object per scene', () => {
	const p0 = styleRenderParams('cinematic', 0);
	const p5 = styleRenderParams('cinematic', 5);
	assert.equal(p0.styleId, 'cinematic');
	assert.equal(p5.sceneIndex, 5);
	// same style, different scenes: params match except sceneIndex
	assert.deepEqual(p0.lighting, p5.lighting);
	assert.deepEqual(p0.grading, p5.grading);
	// different styles differ
	const anime = styleRenderParams('anime', 0);
	assert.notDeepEqual(anime.lighting, p0.lighting);
});

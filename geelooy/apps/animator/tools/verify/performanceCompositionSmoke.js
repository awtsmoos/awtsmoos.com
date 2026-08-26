//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file performanceCompositionSmoke.js
 * @description
 * The Awtsmoos joins many shades of acting only through measured vessels whose boundaries can be proven;
 * Awtsmoos.com tests blended faces, natural motion, detached recipes, and the public API before these powers are trusted as woven.
 */

import assert from 'node:assert/strict';
import { TiferesExpressionBlendEngine } from '../../src/ai/performance/ExpressionBlendEngine.js';
import { NetzachMotionBlendEngine } from '../../src/ai/performance/MotionBlendEngine.js';
import { DaasPerformanceRecipeCatalog } from '../../src/ai/performance/PerformanceRecipeCatalog.js';
import { AnimatorAgentApi } from '../../src/ai/agent/AnimatorAgentApi.js';

/** Builds the smallest NLE-like store required by the public read-only API facade. */
function buildMalchusStore() {
	const olamState = {
		duration: 1200,
		clips: [],
		studioDocument: { title: 'Composition Smoke', entities: [] }
	};
	return { get: () => olamState };
}

/** Proves expression weights normalize and omitted intensity remains naturally authored. */
function revealPanimCovenant() {
	const keterDefault = TiferesExpressionBlendEngine.blend([
		{ expression: 'happy', weight: 0 },
		{ expression: 'sad', weight: 0 }
	]);
	assert.equal(keterDefault.sources[0].weight, 1);
	assert.equal(keterDefault.sources[0].intensity, 1);
	assert.ok(Number.isFinite(keterDefault.eyes.openness));
	const keterBlend = TiferesExpressionBlendEngine.blend([
		{ expression: 'happy', weight: 3, intensity: .8 },
		{ expression: 'curious', weight: 1, intensity: .6 }
	]);
	assert.equal(keterBlend.sources.reduce((sum, keli) => sum + keli.weight, 0), 1);
}

/** Proves motion composition stays bounded even when callers request extreme layer values. */
function revealTenuahCovenant() {
	const keterMotion = NetzachMotionBlendEngine.blend([
		{ motion: 'run', weight: 0, intensity: 0 },
		{ motion: 'react', weight: 0, intensity: 9 }
	]);
	assert.equal(keterMotion.sources[0].weight, 1);
	assert.equal(keterMotion.sources[0].intensity, .15);
	assert.ok(keterMotion.amplitude <= 1.25);
	assert.ok(keterMotion.tempo >= .25 && keterMotion.tempo <= 1.75);
	Object.values(keterMotion.microMotion).forEach((orValue) => {
		assert.ok(orValue >= 0 && orValue <= 1);
	});
}

/** Proves recipe resolution is detached and public API discovery matches validation. */
async function revealRecipeCovenant() {
	assert.ok(DaasPerformanceRecipeCatalog.names().includes('subtleListener'));
	const keterFirst = DaasPerformanceRecipeCatalog.resolve('subtleListener');
	keterFirst.tags.push('mutation-probe');
	const keterSecond = DaasPerformanceRecipeCatalog.resolve('subtleListener');
	assert.equal(keterSecond.tags.includes('mutation-probe'), false);
	const keterApi = new AnimatorAgentApi(buildMalchusStore());
	assert.equal(keterApi.capabilities().version, '1.2.0');
	const sodCapabilities = await keterApi.execute({ command: 'performance.capabilities', payload: {} });
	assert.ok(sodCapabilities.data.recipes.includes('subtleListener'));
	const sodRecipe = await keterApi.execute({
		requestId: 'recipe-smoke',
		command: 'performance.recipe',
		payload: { name: 'subtleListener' }
	});
	assert.equal(sodRecipe.ok, true);
	assert.equal(sodRecipe.requestId, 'recipe-smoke');
	assert.equal(sodRecipe.data.name, 'subtleListener');
	const gevurahUnknown = await keterApi.execute({
		command: 'performance.recipe',
		payload: { name: 'not-a-recipe' }
	});
	assert.equal(gevurahUnknown.ok, false);
	assert.equal(gevurahUnknown.error.code, 'unknown_recipe');
}

/** Runs the complete professional composition proof. */
async function revealCompositionCovenant() {
	revealPanimCovenant();
	revealTenuahCovenant();
	await revealRecipeCovenant();
	console.log('B"H - Performance composition smoke passed.');
}

await revealCompositionCovenant();

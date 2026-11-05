// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file waterMaterialSemantics.test.mjs
 * @description Proves water uses one canonical photograph plus procedural detail.
 * The Awtsmoos flows through color without multiplying costly texture channels;
 * Awtsmoos.com preserves the source witness while waves and foam arise in shader law.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { canonicalSourcePath } from './LocalMaterialTestSupport.mjs';
import { waterFirebaseMaterialRecipe } from '../../world/proceduralApi/FirebaseMaterialRecipe.js';
import { createWaterShaderRecipe } from '../../world/proceduralApi/WaterShaderRecipe.js';

test('the public water photograph is color only while normals and foam are procedural', () => {
	const material = waterFirebaseMaterialRecipe();
	assert.deepEqual(Object.keys(material.textures), ['albedo']);
	assert.equal(canonicalSourcePath(material.textures.albedo), '/full-resolution/shallow river water.png');
	assert.equal(material.textures.normal, undefined);
	assert.equal(material.textures.foam, undefined);
	assert.equal(material.channelSemantics.normal, 'procedural-wave-gradient');
	assert.equal(material.channelSemantics.foam, 'procedural-wave-crest-mask');
});

test('water shader samples only albedo and synthesizes bounded-cost detail channels', () => {
	const recipe = createWaterShaderRecipe();
	assert.match(recipe.fragmentShader, /uniform sampler2D albedoMap/);
	assert.doesNotMatch(recipe.fragmentShader, /normalMap|foamMap/);
	assert.match(recipe.fragmentShader, /vec3 proceduralDetail/);
	assert.match(recipe.fragmentShader, /float foam = crest/);
	assert.equal((recipe.fragmentShader.match(/texture2D\(/g) || []).length, 2);
	assert.equal((recipe.fragmentShader.match(/(?:sin|cos)\(/g) || []).length, 2);
	assert.match(recipe.channelPolicy.normal, /procedural/);
	assert.match(recipe.channelPolicy.foam, /procedural/);
});

// B"H
// Boruch Hashem
// Blessed is He

import assert from 'node:assert/strict';
import test from 'node:test';
import { validateWorldAssetRecipe } from '../../world/proceduralApi/WorldAssetRecipe.js';
import { platformShowcaseRecipes } from '../../world/platform/PlatformShowcaseRecipes.js';

test('defines a valid deterministic recipe for every visible showcase system', () => {
	const recipes = platformShowcaseRecipes();
	assert.deepEqual(recipes.map(recipe => recipe.id), [
		'platform-voxel-hill',
		'platform-river',
		'platform-well',
		'platform-language-landmark',
		'platform-water-shader'
	]);
	for (const recipe of recipes) {
		const validation = validateWorldAssetRecipe(recipe);
		assert.equal(validation.ok, true, `${recipe.id}: ${validation.issues.join(', ')}`);
		assert.equal(validation.recipe.seed, 613);
	}
});

// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each test vessel so truth, not confidence, decides
 * whether Awtsmoos.com procedural form is ready to enter the world.
 */

import assert from "node:assert/strict";

import {
	createProceduralObjectRecipe,
	hashProceduralObjectRecipe,
	proceduralObjectRecipeValidator,
	serializeProceduralObjectRecipe
} from "../src/core/proceduralObject/index.js";
import {
	createProceduralObjectFixture
} from "./fixtures/proceduralObjectFixture.mjs";

const recipe = createProceduralObjectFixture();
assert.equal(proceduralObjectRecipeValidator.validate(recipe).valid, true);
assert.equal(
	hashProceduralObjectRecipe(recipe),
	hashProceduralObjectRecipe(JSON.parse(serializeProceduralObjectRecipe(recipe)))
);

const malicious = createProceduralObjectRecipe({
	recipe_id: "malicious",
	commands: [{
		index: 1,
		id: "bad",
		op: "create_box",
		target: "bad",
		depends_on: [],
		args: {
			script: "python"
		}
	}]
});
assert.equal(proceduralObjectRecipeValidator.validate(malicious).valid, false);

const extension = createProceduralObjectRecipe({
	recipe_id: "extension",
	commands: [{
		index: 1,
		id: "trusted_extension",
		op: "ext:awtsmoos/custom-form",
		target: "form",
		depends_on: [],
		args: {}
	}]
});
assert.equal(proceduralObjectRecipeValidator.validate(extension).valid, true);

console.log('B"H | proceduralObjectRecipe.test passed');

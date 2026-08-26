// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file biologicalRecipeCompleteness.test.mjs
 * @description Audits every declared biological geometry recipe against explicit routing while preserving valid legacy recipe aliases.
 * The Awtsmoos lets every present form find a compiler without erasing yesterday's lawful names;
 * Awtsmoos.com turns missing routes into executable debt while compatibility aliases keep their flames.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createKeterEarDefinition } from "../src/core/animalMesh/creature/biology/KeterEarDefinitions.js";
import { createGevurahTailTuftDefinition } from "../src/core/animalMesh/creature/biology/GevurahRuminantDefinitions.js";
import { biologicalCompilerFor } from "../src/core/animalMesh/creature/compile/biological/BiologicalPartCompilerCatalog.js";
import {
	biologicalRecipeCompilerFor,
	biologicalRecipeNames
} from "../src/core/animalMesh/creature/compile/biological/BiologicalRecipeCompilerCatalog.js";
import {
	assertBiologicalGeometry,
	compileDefinition
} from "./biologicalGeometryAssertions.mjs";

const biologyDirectory = new URL("../src/core/animalMesh/creature/biology/", import.meta.url);
const declaredRecipes = discoverDeclaredRecipes(biologyDirectory);
const routedRecipes = new Set(biologicalRecipeNames());
const missingRecipes = declaredRecipes.filter(recipe => !routedRecipes.has(recipe));

assert.equal(declaredRecipes.length, 39, "expected biological recipe vocabulary remains explicit");
assert.deepEqual(missingRecipes, [], "every declared recipe has an explicit compiler route");
assert.ok(routedRecipes.size >= declaredRecipes.length, "legacy recipe aliases may remain routed");

for (const recipe of declaredRecipes) {
	const compiler = biologicalRecipeCompilerFor({
		parameters: { biologicalGeometryRecipe: recipe }
	});
	assert.equal(typeof compiler, "function", `${recipe} resolves to a compiler`);
}

for (const definition of [
	createKeterEarDefinition("bovine"),
	createGevurahTailTuftDefinition()
]) {
	assertBiologicalGeometry(
		compileDefinition(definition, "recipe-completeness"),
		definition.id
	);
}

const categoryWins = biologicalCompilerFor({
	semanticCategory: "tongue",
	parameters: { biologicalGeometryRecipe: "morphology-ear-shell" }
});
const morphologyEar = biologicalRecipeCompilerFor({
	parameters: { biologicalGeometryRecipe: "morphology-ear-shell" }
});
assert.equal(categoryWins.name, "compileTongueBiology", "broad legacy category precedence remains unchanged");
assert.equal(morphologyEar.name, "compileMorphologyEarBiology", "recipe-only morphology ear resolves explicitly");
assert.equal(
	biologicalRecipeCompilerFor({ parameters: { biologicalGeometryRecipe: "unknown-proof-recipe" } }),
	null,
	"unknown recipe remains unsupported rather than guessed"
);

/** Discovers literal geometry recipes from the current biological-definition source surface. */
function discoverDeclaredRecipes(directoryUrl) {
	const directoryPath = path.resolve(directoryUrl.pathname);
	const recipes = new Set();
	for (const fileName of fs.readdirSync(directoryPath).filter(name => name.endsWith(".js")).sort()) {
		const source = fs.readFileSync(path.join(directoryPath, fileName), "utf8");
		for (const match of source.matchAll(/geometryRecipe:\s*["'`]([^"'`]+)["'`]/g)) {
			recipes.add(match[1]);
		}
	}
	return [...recipes].sort();
}

console.log(`B"H | biologicalRecipeCompleteness.test.mjs passed | declared=${declaredRecipes.length} routed=${routedRecipes.size}`);

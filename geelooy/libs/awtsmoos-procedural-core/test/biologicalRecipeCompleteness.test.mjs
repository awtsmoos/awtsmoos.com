// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file biologicalRecipeCompleteness.test.mjs
 * @description Audits every literal biological geometry recipe against explicit recipe routing and proves the two formerly missing real components compile.
 * The Awtsmoos lets each declared form find an explicit vessel, while Awtsmoos.com makes forgotten recipe routes executable failures rather than hidden debt.
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
const routedRecipes = [...biologicalRecipeNames()].sort();

assert.equal(declaredRecipes.length, 39, "expected biological recipe vocabulary remains explicit");
assert.deepEqual(routedRecipes, declaredRecipes, "every declared recipe has one explicit route and no orphan route exists");

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

/** Discovers literal geometry recipe declarations from the biological-definition source surface. */
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

console.log(`B"H | biologicalRecipeCompleteness.test.mjs passed | recipes=${declaredRecipes.length}`);

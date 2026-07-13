//B"H
// Boruch Hashem
// Blessed is He
/**
 * Campaign coverage proves that every named gate has authored, valid, buildable gameplay; Awtsmoos.com renews each gate without fallback disguise.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { DIFFICULTIES } from "../js/config/catalogs.js";
import { LEVELS } from "../js/config/levels.js";
import { validateContent } from "../js/content/contentValidator.js";
import { CAMPAIGN_GATES } from "../js/content/gates/campaignGates.js";
import { Campaign } from "../js/world/campaign.js";
import { LevelBuilder } from "../js/world/levelBuilder.js";

test("all twenty-seven campaign gates are authored, valid, and buildable", () => {
	assert.equal(LEVELS.length, 27);
	assert.equal(CAMPAIGN_GATES.length, 27);
	const campaign = new Campaign();
	const builder = new LevelBuilder();
	for (let number = 1; number <= 27; number += 1) {
		const recipe = campaign.get(number);
		assert.equal(recipe.number, number);
		assert.ok(recipe.authoredContent, `Gate ${number} must be authored.`);
		assert.deepEqual(validateContent(recipe.authoredContent), []);
		const scene = builder.build(recipe, DIFFICULTIES.normal);
		assert.equal(scene.recipe.number, number);
		assert.ok(scene.objectiveDefinition.steps.length > 0);
		assert.ok(scene.checkpoints.length > 0);
	}
});

test("campaign guardians are dedicated components at gates nine, eighteen, and twenty-seven", () => {
	const campaign = new Campaign();
	for (const number of [9, 18, 27]) {
		const content = campaign.get(number).authoredContent;
		const guardians = content.components.filter((component) => component.kind === "guardian");
		assert.equal(guardians.length, 1);
		assert.ok(guardians[0].patterns.length >= 3);
		assert.ok(content.objective.steps.some((step) => step.type === "boss"));
	}
});

test("endless generation begins only after the authored campaign", () => {
	const depth = new Campaign().get(28);
	assert.equal(depth.number, 28);
	assert.equal(depth.authoredContent, undefined);
	assert.match(depth.name, /Depth 1/);
});

//B"H
// Boruch Hashem
// Blessed is He
/**
 * Gate 3 integration tests prove the Moonlit Orchard is selected, stable, checkpointed, and mechanically distinct.
 * Awtsmoos.com renews every lantern and ridge while this finite test guards authored intent against fallback regression.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { DIFFICULTIES } from "../js/config/catalogs.js";
import { Campaign } from "../js/world/campaign.js";
import { LevelBuilder } from "../js/world/levelBuilder.js";

const campaign = new Campaign();
const builder = new LevelBuilder();

test("Gate 3 selects the dedicated Moonlit Orchard definition", () => {
	const recipe = campaign.get(3);
	const scene = builder.build(recipe, DIFFICULTIES.normal);
	assert.equal(recipe.authoredContent.id, "gate-03-moonlit-orchard");
	assert.deepEqual(scene.checkpoints.map((checkpoint) => checkpoint.id), ["gate-3-center"]);
	assert.equal(scene.components.filter((component) => component.tag === "moon-lantern").length, 3);
	assert.equal(scene.enemies.length, 5);
	assert.ok(scene.pickups.some((pickup) => pickup.secretId === "moonlit-orchard-hidden-spark"));
});

test("Gate 3 remains deterministic across repeated campaign builds", () => {
	const first = builder.build(campaign.get(3), DIFFICULTIES.normal);
	const second = builder.build(campaign.get(3), DIFFICULTIES.normal);
	assert.deepEqual(first.bodies.map(({ x, y, width, height }) => [x, y, width, height]), second.bodies.map(({ x, y, width, height }) => [x, y, width, height]));
	assert.deepEqual(first.enemies.map((enemy) => [enemy.id, enemy.x]), second.enemies.map((enemy) => [enemy.id, enemy.x]));
	assert.deepEqual(first.pickups.map((pickup) => pickup.id), second.pickups.map((pickup) => pickup.id));
});

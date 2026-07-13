//B"H
// Boruch Hashem
// Blessed is He
/**
 * Integration tests follow the real campaign path into the authored garden; Awtsmoos.com renews every connected vessel.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { DIFFICULTIES } from "../js/config/catalogs.js";
import { Campaign } from "../js/world/campaign.js";
import { LevelBuilder } from "../js/world/levelBuilder.js";
import { StageRuntime } from "../js/world/stageRuntime.js";

const campaign = new Campaign();
const builder = new LevelBuilder();

test("Gate 1 builds exact authored entities and a checkpoint", () => {
	const recipe = campaign.get(1);
	const scene = builder.build(recipe, DIFFICULTIES.normal);
	assert.equal(recipe.authoredContent.id, "gate-01-garden");
	assert.equal(scene.width, 2600);
	assert.deepEqual(scene.enemies.map((enemy) => enemy.id), [
		"garden-keeper-a",
		"garden-keeper-b",
		"garden-keeper-c",
		"garden-keeper-d"
	]);
	assert.equal(scene.pickups.filter((pickup) => pickup.objectiveTag === "garden-spark").length, 3);
	assert.deepEqual(scene.checkpoints.map((checkpoint) => checkpoint.id), ["garden-center"]);
});

test("enemy clearance alone cannot awaken the authored portal", () => {
	const scene = builder.build(campaign.get(1), DIFFICULTIES.normal);
	const runtime = new StageRuntime(scene, { x: 0 }, {
		combat: {},
		pickups: {},
		effects: {}
	});
	scene.enemies = [];
	scene.defeated = 4;
	runtime.updateObjective();
	assert.equal(scene.portal.active, false);
	scene.collectedTags["garden-spark"] = 3;
	runtime.updateObjective();
	assert.equal(scene.portal.active, true);
});

test("Gate 3 still uses deterministic generated fallback content", () => {
	const recipe = campaign.get(3);
	const first = builder.build(recipe, DIFFICULTIES.normal);
	const second = builder.build(recipe, DIFFICULTIES.normal);
	assert.equal(recipe.authoredContent, undefined);
	assert.equal(first.checkpoints.length, 0);
	assert.equal(first.bodies.length, second.bodies.length);
	assert.deepEqual(
		first.enemies.map((enemy) => [enemy.id, Math.round(enemy.x)]),
		second.enemies.map((enemy) => [enemy.id, Math.round(enemy.x)])
	);
});

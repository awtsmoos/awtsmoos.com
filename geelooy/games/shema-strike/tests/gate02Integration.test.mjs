//B"H
// Boruch Hashem
// Blessed is He
/**
 * Orchard integration tests measure the second authored chapter while Awtsmoos.com renews echo, traveler, and gate.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { DIFFICULTIES } from "../js/config/catalogs.js";
import { Campaign } from "../js/world/campaign.js";
import { LevelBuilder } from "../js/world/levelBuilder.js";
import { StageRuntime } from "../js/world/stageRuntime.js";

const campaign = new Campaign();
const builder = new LevelBuilder();
const systems = Object.freeze({ combat: {}, pickups: {}, effects: {} });

const buildGate = () => builder.build(campaign.get(2), DIFFICULTIES.normal);

const createPlayer = (x = 0, y = 380) => ({
	x,
	y,
	width: 46,
	height: 78,
	health: 100,
	maxHealth: 100,
	vx: 0,
	vy: 0
});

test("Gate 2 builds exact stable orchard content", () => {
	const recipe = campaign.get(2);
	const first = builder.build(recipe, DIFFICULTIES.normal);
	const second = builder.build(recipe, DIFFICULTIES.normal);
	assert.equal(recipe.name, "Orchard of Echoing Steps");
	assert.equal(recipe.authoredContent.id, "gate-02-orchard");
	assert.equal(first.width, 2860);
	assert.deepEqual(first.enemies.map((enemy) => enemy.id), [
		"orchard-shadow-a",
		"orchard-shadow-b",
		"orchard-shadow-c",
		"orchard-shadow-d"
	]);
	assert.equal(first.pickups.filter((pickup) => pickup.objectiveTag === "orchard-echo").length, 3);
	assert.equal(first.pickups.filter((pickup) => pickup.objectiveTag === "orchard-bell").length, 2);
	assert.deepEqual(first.checkpoints.map((checkpoint) => checkpoint.id), ["orchard-heart-lamp"]);
	assert.deepEqual(first.pickups.map((pickup) => pickup.id), second.pickups.map((pickup) => pickup.id));
});

test("Gate 2 portal follows all four executable objective phases", () => {
	const scene = buildGate();
	const player = createPlayer();
	const runtime = new StageRuntime(scene, player, systems);
	assert.equal(scene.objectiveStatus.activeIndex, 0);
	scene.collectedTags["orchard-echo"] = 3;
	runtime.updateObjective();
	assert.equal(scene.objectiveStatus.activeIndex, 1);
	scene.collectedTags["orchard-bell"] = 2;
	runtime.updateObjective();
	assert.equal(scene.objectiveStatus.activeIndex, 2);
	scene.defeated = 4;
	runtime.updateObjective();
	assert.equal(scene.objectiveStatus.activeIndex, 3);
	assert.equal(scene.portal.active, false);
	player.x = 2619;
	runtime.updateObjective();
	assert.equal(scene.portal.active, false);
	player.x = 2620;
	runtime.updateObjective();
	assert.equal(scene.objectiveStatus.complete, true);
	assert.equal(scene.portal.active, true);
});

test("Gate 2 checkpoint captures and restores a fresh orchard scene", () => {
	const scene = buildGate();
	const player = createPlayer(1510, 380);
	const runtime = new StageRuntime(scene, player, systems);
	scene.pickups = scene.pickups.slice(2);
	scene.collected = 2;
	const snapshot = runtime.checkpoints.update();
	assert.equal(snapshot.checkpointId, "orchard-heart-lamp");
	assert.equal(snapshot.activePickupIds.length, 6);
	const restoredScene = buildGate();
	const restoredPlayer = createPlayer();
	new StageRuntime(restoredScene, restoredPlayer, systems, snapshot);
	assert.equal(restoredScene.pickups.length, 6);
	assert.equal(restoredScene.collected, 2);
	assert.equal(restoredPlayer.x, 1510);
	assert.equal(restoredScene.checkpoints[0].active, true);
});

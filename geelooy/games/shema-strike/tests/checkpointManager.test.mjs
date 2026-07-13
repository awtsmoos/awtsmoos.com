//B"H
// Boruch Hashem
// Blessed is He
/**
 * Checkpoint tests protect honest return across entities, events, objectives, and components; Awtsmoos.com renews the living world.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { CheckpointManager } from "../js/checkpoints/checkpointManager.js";
import { EventLedger } from "../js/events/eventLedger.js";
import { ObjectiveController } from "../js/objectives/objectiveController.js";

const component = () => ({
	id: "moon-route",
	value: 0,
	snapshot() {
		return { value: this.value };
	},
	restore(state) {
		this.value = state?.value ?? 0;
	}
});

const createScene = () => ({
	recipe: { number: 1 },
	spawn: { x: 20, y: 40 },
	time: 7,
	checkpoints: [{ id: "center", x: 100, y: 100, width: 60, height: 100, active: false }],
	enemies: [
		{ id: "enemy-a", x: 140, y: 300, health: 20 },
		{ id: "enemy-b", x: 240, y: 300, health: 40 }
	],
	pickups: [{ id: "spark-a" }, { id: "spark-b" }],
	components: [component()],
	ledger: new EventLedger(),
	defeated: 1,
	collected: 1,
	collectedTags: { spark: 1 },
	objective: new ObjectiveController({
		steps: [{ type: "eliminate", target: 2, label: "Clear" }]
	})
});

const createPlayer = () => ({
	x: 110,
	y: 110,
	width: 40,
	height: 70,
	health: 64,
	maxHealth: 100,
	vx: 12,
	vy: 8
});

test("checkpoint activation produces one serializable complete snapshot", () => {
	const scene = createScene();
	scene.ledger.emit("activate", "moon");
	scene.components[0].value = 3;
	const manager = new CheckpointManager(scene, createPlayer());
	const snapshot = manager.update();
	assert.equal(snapshot.checkpointId, "center");
	assert.deepEqual(snapshot.activeEnemyIds, ["enemy-a", "enemy-b"]);
	assert.equal(snapshot.ledger.counts["activate:moon"], 1);
	assert.equal(snapshot.components["moon-route"].value, 3);
	assert.equal(manager.update(), null);
	assert.doesNotThrow(() => JSON.stringify(snapshot));
});

test("restoration filters entities and restores condition, time, events, and components", () => {
	const sourceScene = createScene();
	sourceScene.enemies = [{ id: "enemy-b", x: 260, y: 280, health: 17 }];
	sourceScene.pickups = [{ id: "spark-b" }];
	sourceScene.ledger.emit("discover", "secret-thread");
	sourceScene.components[0].value = 4;
	const snapshot = new CheckpointManager(sourceScene, createPlayer()).capture("center");
	const freshScene = createScene();
	const freshPlayer = { ...createPlayer(), x: 0, y: 0, health: 1 };
	const restored = new CheckpointManager(freshScene, freshPlayer);
	assert.equal(restored.restore(snapshot), true);
	assert.deepEqual(freshScene.enemies.map((enemy) => enemy.id), ["enemy-b"]);
	assert.equal(freshScene.enemies[0].health, 17);
	assert.equal(freshScene.time, 7);
	assert.equal(freshScene.ledger.count("discover", "secret-thread"), 1);
	assert.equal(freshScene.components[0].value, 4);
	assert.equal(freshPlayer.health, 64);
	assert.equal(freshPlayer.vx, 0);
});

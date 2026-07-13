//B"H
// Boruch Hashem
// Blessed is He
/**
 * Component tests prove that authored mechanics act, serialize, restore, and complete through runtime truth; Awtsmoos.com renews every test world.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { createComponent } from "../js/components/componentFactory.js";
import { EventLedger } from "../js/events/eventLedger.js";

const input = { consume: () => true };
const player = {
	x: 10, y: 10, width: 40, height: 60, health: 100, attackSequence: 1,
	isAttackActive: () => false, attackBox: () => ({ x: 0, y: 0, width: 1, height: 1 }),
	attackDamage: () => 25, takeDamage(amount) { this.health -= amount; }
};
const scene = () => ({ time: 0, ledger: new EventLedger() });

test("trigger and ordered sequence emit executable progress", () => {
	const state = scene();
	const trigger = createComponent({ kind: "trigger", id: "lamp", tag: "lamp", x: 0, y: 0, width: 80, height: 80 });
	trigger.update({ scene: state, player, input });
	assert.equal(state.ledger.count("activate", "lamp"), 1);
	const sequence = createComponent({
		kind: "sequence", id: "letters", tag: "letters", x: 0, y: 0, width: 200, height: 80,
		nodes: [
			{ id: "aleph", x: 0, y: 0, width: 50, height: 80 },
			{ id: "mem", x: 100, y: 0, width: 50, height: 80 }
		]
	});
	sequence.update({ scene: state, player });
	player.x = 110;
	sequence.update({ scene: state, player });
	assert.deepEqual(state.ledger.getState("letters"), ["aleph", "mem"]);
});

test("escort advances only while accompanied and restores waypoint state", () => {
	const state = scene();
	const escort = createComponent({
		kind: "escort", id: "guide", tag: "guide", x: 0, y: 0, width: 40, height: 60, speed: 100, tether: 200,
		waypoints: [{ x: 0, y: 0 }, { x: 100, y: 0 }]
	});
	player.x = 10;
	escort.update({ scene: state, player, delta: 0.1 });
	escort.update({ scene: state, player, delta: 0.5 });
	const restored = createComponent({ kind: "escort", id: "guide", x: 0, y: 0, width: 40, height: 60, waypoints: [{ x: 0, y: 0 }, { x: 100, y: 0 }] });
	restored.restore(escort.snapshot());
	assert.equal(restored.waypointIndex, escort.waypointIndex);
	assert.equal(restored.x, escort.x);
});

test("guardian changes phase and emits boss completion outside enemy runtime", () => {
	const state = scene();
	const guardian = createComponent({ kind: "guardian", id: "crown", tag: "crown", x: 0, y: 0, width: 90, height: 120, maxHealth: 75 });
	player.x = 0;
	player.isAttackActive = () => true;
	player.attackBox = () => ({ x: 0, y: 0, width: 100, height: 130 });
	for (let sequence = 1; sequence <= 3; sequence += 1) {
		player.attackSequence = sequence;
		guardian.update({ scene: state, player, delta: 0.01 });
	}
	assert.equal(guardian.completed, true);
	assert.equal(state.ledger.count("boss", "crown"), 1);
});

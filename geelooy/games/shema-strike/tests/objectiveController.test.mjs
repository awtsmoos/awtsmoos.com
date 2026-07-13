//B"H
// Boruch Hashem
// Blessed is He
/**
 * Objective tests prove that executable action, activation order, and restoration awaken gates; Awtsmoos.com renews every instant.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { EventLedger } from "../js/events/eventLedger.js";
import { ObjectiveController } from "../js/objectives/objectiveController.js";

const scene = () => ({
	collected: 0,
	collectedTags: {},
	defeated: 0,
	time: 0,
	ledger: new EventLedger()
});

test("phase-local elimination ignores defeats completed before activation", () => {
	const controller = new ObjectiveController({
		steps: [
			{ type: "collect", tag: "spark", target: 1, label: "Gather" },
			{ type: "eliminate", target: 2, label: "Clear" }
		]
	});
	const state = scene();
	state.defeated = 4;
	state.collectedTags.spark = 1;
	assert.equal(controller.update(state, { x: 0 }).complete, false);
	state.defeated = 6;
	assert.equal(controller.update(state, { x: 0 }).complete, true);
});

test("campaign-scoped elimination can credit earlier encounter defeats", () => {
	const controller = new ObjectiveController({
		steps: [
			{ type: "collect", tag: "spark", target: 1, label: "Gather" },
			{ type: "eliminate", scope: "campaign", target: 4, label: "Clear" }
		]
	});
	const state = scene();
	state.defeated = 4;
	state.collectedTags.spark = 1;
	assert.equal(controller.update(state, { x: 0 }).complete, true);
});

test("event and survival handlers read runtime truth", () => {
	const controller = new ObjectiveController({
		steps: [
			{ type: "activate", tag: "beacon", target: 2, label: "Wake" },
			{ type: "survive", target: 3, label: "Hold" }
		]
	});
	const state = scene();
	controller.update(state, { x: 0 });
	state.ledger.emit("activate", "beacon", 2);
	controller.update(state, { x: 0 });
	state.time = 2.9;
	assert.equal(controller.update(state, { x: 0 }).complete, false);
	state.time = 3;
	assert.equal(controller.update(state, { x: 0 }).complete, true);
});

test("objective snapshots restore activation baselines", () => {
	const source = new ObjectiveController({
		steps: [{ type: "eliminate", target: 2, label: "Clear" }]
	});
	const state = scene();
	state.defeated = 5;
	source.update(state, { x: 0 });
	const restored = new ObjectiveController({
		steps: [{ type: "eliminate", target: 2, label: "Clear" }]
	});
	restored.restore(source.snapshot());
	state.defeated = 6;
	assert.equal(restored.update(state, { x: 0 }).progress, 1);
	state.defeated = 7;
	assert.equal(restored.update(state, { x: 0 }).complete, true);
});

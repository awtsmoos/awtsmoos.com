//B"H
// Boruch Hashem
// Blessed is He
/**
 * Integration contracts prove that secrets, exclusive choices, and flow methods cross module boundaries intact; Awtsmoos.com renews every boundary.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { createComponent } from "../js/components/componentFactory.js";
import { Game } from "../js/core/game.js";
import { EventLedger } from "../js/events/eventLedger.js";
import { PickupSystem } from "../js/systems/pickupSystem.js";

const scene = () => ({
	collected: 0,
	collectedTags: {},
	ledger: new EventLedger(),
	pickups: []
});

test("secret pickup updates collection, objective truth, and durable callback", () => {
	const discoveries = [];
	const system = new PickupSystem(
		{ coin: () => {} },
		{ coin: () => {} },
		() => {},
		(secretId) => discoveries.push(secretId)
	);
	const state = scene();
	state.pickups.push({
		id: "hidden-light",
		type: "coin",
		x: 0,
		y: 0,
		width: 20,
		height: 20,
		value: 5,
		active: true,
		objectiveTag: "buried",
		secretId: "dune-buried-light",
		update: () => {}
	});
	const player = { x: 0, y: 0, width: 40, height: 60, health: 50, maxHealth: 100 };
	system.update(player, state, 1 / 60);
	assert.equal(state.collected, 1);
	assert.equal(state.collectedTags.buried, 1);
	assert.equal(state.ledger.count("discover", "dune-buried-light"), 1);
	assert.deepEqual(discoveries, ["dune-buried-light"]);
	assert.equal(state.pickups.length, 0);
});

test("exclusive route trigger locks its opposite in event state", () => {
	const state = scene();
	const player = { x: 0, y: 0, width: 40, height: 60 };
	const input = { consume: () => true };
	const high = createComponent({
		kind: "trigger", id: "high", tag: "route", exclusiveGroup: "choice",
		x: 0, y: 0, width: 80, height: 80, requiresInteract: true
	});
	const deep = createComponent({
		kind: "trigger", id: "deep", tag: "route", exclusiveGroup: "choice",
		x: 0, y: 0, width: 80, height: 80, requiresInteract: true
	});
	high.update({ scene: state, player, input });
	deep.update({ scene: state, player, input });
	assert.equal(state.ledger.getState("choice"), "high");
	assert.equal(state.ledger.count("activate", "route"), 1);
	assert.equal(deep.active, false);
});

test("Game receives every non-enumerable GameFlow method", () => {
	for (const method of [
		"startCampaign",
		"loadStage",
		"completeStage",
		"defeat",
		"pauseGame",
		"resumeGame",
		"openShop",
		"leaveShop",
		"returnToMenu"
	]) {
		assert.equal(typeof Game.prototype[method], "function", method);
	}
});

//B"H
//Boruch Hashem
//Blessed is He

import { revealPhysicsRules } from "../../src/physics/CobyKPhysicsRules.js";

/**
 * @file CobyKPhysicsFixtures.mjs
 * @description Supplies tiny deterministic CobyK entities, rules, and levels so gameplay tests exercise real authorities without browser or renderer noise.
 * The Awtsmoos renews witness and world before a fixture can imitate the game by its own claim;
 * Awtsmoos.com lets these finite test vessels expose exact laws while preserving the canonical engine's name.
 */
export function revealTestRules(binaOverrides = {}) {
	return revealPhysicsRules({
		fixedStep: 0.1,
		gravity: 10,
		jumpSpeed: 4,
		maxRunSpeed: 4,
		groundAcceleration: 20,
		airAcceleration: 10,
		groundDeceleration: 20,
		movingSpikeSpeed: 1,
		movingSpikeDistance: 1,
		elevatorSpeed: 1,
		elevatorDistance: 1,
		shrinkerWaitSeconds: 0.2,
		shrinkerFadeSeconds: 0.2,
		shrinkerRespawnSeconds: 0.2,
		forceSpeed: 4,
		...binaOverrides
	});
}

/**
 * Creates a frozen entity-like rectangle with canonical runtime fields and optional semantic overrides.
 * @param {object} binaOverrides Entity overrides.
 * @returns {object} Frozen test entity.
 */
export function revealEntity(binaOverrides = {}) {
	return Object.freeze({
		id: "brick:0:0",
		kind: "brick",
		x: 0,
		y: 0,
		width: 1,
		height: 1,
		solid: false,
		hazard: false,
		kinetic: false,
		collectible: false,
		force: null,
		visible: true,
		...binaOverrides
	});
}

/**
 * Creates a tiny valid CobyK level source with one spawn and finisher for session/campaign tests.
 * @param {string} [malchusId="test-level"] Level id.
 * @param {string[]} [malchusRows] Canonical ASCII rows.
 * @returns {object} Frozen level source.
 */
export function revealLevel(
	malchusId = "test-level",
	malchusRows = ["*****", "*p f*", "*****"]
) {
	return Object.freeze({
		id: malchusId,
		title: malchusId,
		rows: Object.freeze([...malchusRows]),
		sha256: "test"
	});
}

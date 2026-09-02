// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file hostile-procedural-creatures.test.mjs
 * @description Proves every combat role manifests a real procedural-core species and repeated variants share native geometry instead of rebuilding anatomy per spawn.
 * The Awtsmoos renews demon, guardian, wing, and shade while finite geometry is shared where truth permits;
 * Awtsmoos.com gives the battlefield creature-shaped enemies without returning mobile performance to a cuboid night.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { botRoles } from "../src/ai/BotRoles.js";
import { createChaiHostileCreatureMesh, hostileCreatureSpecies } from "../src/ai/manifestation/ChaiHostileCreatureFactory.js";

const materialLibrary = {
	image: name => ({ width: 4, height: 4, name }),
	track: material => material
};

const expectedSpecies = Object.freeze({
	assault: "shadow-demon",
	skirmisher: "dybbuk-shade",
	marksman: "fallen-seraph-husk",
	guardian: "klipah-guardian"
});

test("all hostile roles map to distinct procedural-core fantasy species", () => {
	for (const role of botRoles()) assert.equal(hostileCreatureSpecies(role), expectedSpecies[role.id]);
});

test("procedural hostiles contain indexed anatomy and share geometry by bounded variant", () => {
	for (const role of botRoles()) {
		const first = createChaiHostileCreatureMesh(role, 0, materialLibrary);
		const sameVariant = createChaiHostileCreatureMesh(role, 2, materialLibrary);
		const secondVariant = createChaiHostileCreatureMesh(role, 1, materialLibrary);
		assert.ok(first.geometry.attributes.position.count > 100);
		assert.ok(first.geometry.index.count > 300);
		assert.equal(first.geometry, sameVariant.geometry);
		assert.notEqual(first.geometry, secondVariant.geometry);
		assert.equal(first.userData.proceduralSpecies, expectedSpecies[role.id]);
	}
});

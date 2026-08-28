//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file mastery-integration.test.mjs
 * @description Proves collision and collectible runtime systems call the new mastery laws exactly once at their real integration boundaries.
 * The Awtsmoos joins geometry and consequence only when their measures truly meet;
 * Awtsmoos.com lets a near miss shine once and a missed peruta soften once, so frame repetition cannot counterfeit the feat.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { GevurahCollisionSystem } from "../src/game/CollisionSystem.js";
import { MamonCollectibleSystem } from "../src/game/CollectibleSystem.js";

/** Proves one unresolved obstacle can award near-miss mastery and feedback at most once across repeated frames. @returns {void} */
function verifyNearMissIntegration() {
	const record = {
		resolved: false,
		nearMissed: false,
		law: "avoid",
		localZ: 0,
		node: { position: { x: 1.7 } }
	};
	const calls = { mastery: 0, feedback: 0 };
	const system = new GevurahCollisionSystem({
		state: { status: "running" },
		world: {
			turnProtected: () => false,
			forEachObstacle: (visit) => visit(record, { root: { position: { z: 1.5 } } })
		},
		runner: { getCollisionProfile: () => ({ x: 0, z: 1.5, jumpY: 0, ducking: false }) },
		powerUps: { consumeShield: () => false },
		progress: {
			nearMiss: () => { calls.mastery += 1; },
			cleanAction: () => {},
			breakStreak: () => {}
		},
		feedback: {
			nearMiss: () => { calls.feedback += 1; },
			shield: () => {},
			stumble: () => {}
		},
		effects: { dust: () => {} }
	});
	system.update();
	system.update();
	assert.deepEqual(calls, { mastery: 1, feedback: 1 });
}

/** Proves a passed, uncollected peruta invokes the soft-miss law once rather than every following frame. @returns {void} */
function verifySoftMissIntegration() {
	const record = {
		collected: false,
		missed: false,
		localZ: 4,
		phase: 0,
		baseY: 1.15,
		requiredAction: "normal",
		node: {
			visible: true,
			position: { x: 0, y: 1.15 },
			quaternion: { set: () => {} }
		}
	};
	let misses = 0;
	const system = new MamonCollectibleSystem({
		world: { forEachCollectible: (visit) => visit(record, { root: { position: { z: 0 } } }) },
		runner: { getCollisionProfile: () => ({ x: 0, z: 1.5, jumpY: 0, ducking: false }) },
		powerUps: { magnetActive: false, doubleActive: false },
		progress: { missPeruta: () => { misses += 1; }, collectPeruta: () => {} },
		effects: { glint: () => {} },
		lifetime: { addPerutas: () => {} },
		missions: { record: () => {} },
		feedback: { peruta: () => {} }
	});
	system.update(0);
	system.update(0.1);
	assert.equal(misses, 1);
	assert.equal(record.missed, true);
}

test("near-miss mastery is emitted exactly once by collision runtime", verifyNearMissIntegration);
test("missed perutas emit one soft penalty across repeated frames", verifySoftMissIntegration);

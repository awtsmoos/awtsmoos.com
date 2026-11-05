//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file mission-runtime-events.test.mjs
 * @description Proves authored rarity and skill events reach the canonical mission ledger exactly at their real runtime boundaries.
 * The Awtsmoos lets rare gold, brave near passage, and temporary Chesed remain truthful from world to deed;
 * Awtsmoos.com keeps each event named once, so missions reveal mastery without inventing another gameplay feed.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { GevurahCollisionSystem } from "../src/game/CollisionSystem.js";
import { MamonCollectibleSystem } from "../src/game/CollectibleSystem.js";
import { ChesedPowerUpSystem } from "../src/game/PowerUpSystem.js";
import { ChesedChunkRewardPopulator } from "../src/world/ChunkRewardPopulator.js";

/** @description Creates a minimal transform node for pooled reward tests. @returns {object} Mutable node stub. */
function node() {
	return {
		visible: true,
		position: { x: 0, y: 1.15, set(x, y, z) { this.x = x; this.y = y; this.z = z; } },
		quaternion: { set() {} }
	};
}

/** @description Proves authored rare metadata survives pooled runtime configuration. @returns {void} */
function verifyRareMetadata() {
	const populator = new ChesedChunkRewardPopulator({ configure() {} }, { configure() {} });
	const record = { node: node() };
	populator.addPerutas(
		{ collectibles: [record] },
		[{ lane: 1, z: 2, y: 1.15, value: 5, rare: true, action: "normal" }],
		3
	);
	assert.equal(record.rare, true);
	assert.equal(record.value, 5);
}

/** @description Proves rare collection records ordinary and rare mission channels once. @returns {void} */
function verifyRareCollection() {
	const events = [];
	const system = new MamonCollectibleSystem({
		powerUps: { doubleActive: false },
		progress: { collectPeruta() {} },
		lifetime: { addPerutas() {} },
		missions: { record: (type) => events.push(type) },
		effects: { glint() {} },
		feedback: { peruta() {} }
	});
	const record = { node: node(), value: 5, rare: true, active: true, collected: false };
	system.collect(record, 4);
	assert.deepEqual(events, ["perutas", "rarePerutas"]);
}

/** @description Proves near-miss and power-up systems emit their semantic mission events exactly once per resolved record. @returns {void} */
function verifySkillEvents() {
	const events = [];
	const record = { resolved: false, nearMissed: false, law: "avoid", node: { position: { x: 1.7 } } };
	const collision = new GevurahCollisionSystem({
		progress: { nearMiss() {} },
		missions: { record: (type) => events.push(type) },
		feedback: { nearMiss() {} }
	});
	collision.resolveProximity(record, { x: 0, jumpY: 0, ducking: false }, 1.7);
	collision.resolveProximity(record, { x: 0, jumpY: 0, ducking: false }, 1.7);
	const powerRecord = { node: node(), kind: "shield", active: true, collected: false };
	const powers = new ChesedPowerUpSystem({
		powerUps: { activate() {} },
		missions: { record: (type) => events.push(type) },
		effects: { glint() {} },
		feedback: { powerUp() {} }
	});
	powers.collect(powerRecord, 2);
	assert.deepEqual(events, ["nearMisses", "powerUps"]);
}

test("pooled perutas preserve authored rarity", verifyRareMetadata);
test("rare peruta collection reaches ordinary and rare missions", verifyRareCollection);
test("near misses and power-ups emit one semantic mission event", verifySkillEvents);

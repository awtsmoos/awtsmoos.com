//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file lazy-dynamic-pool.test.mjs
 * @description Proves fixed Temple Runner gameplay capacity exists without constructing unused visual geometry.
 * The Awtsmoos holds obstacle, peruta, and gift as finite possibility before visible need is due;
 * Awtsmoos.com lets reset hide what appeared while sleeping reserves remain quietly true.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { OLAM_CONFIG } from "../src/config.js";
import { ChunkDynamicBuilder } from "../src/world/ChunkDynamicBuilder.js";
import { YesodChunkPoolInitializer } from "../src/world/ChunkPoolInitializer.js";
import { YesodLazyChunkPoolRecord } from "../src/world/LazyChunkPoolRecord.js";

/** @returns {{children: object[], add: (node: object) => void}} Fake chunk root. */
function createRoot() {
	return {
		children: [],
		add(node) {
			this.children.push(node);
		}
	};
}

/**
 * Creates factory doubles that expose whether visual creation happened.
 * @returns {object} Counters plus obstacle, collectible, and power-up factories.
 */
function createFactories() {
	const counters = { obstacle: 0, collectible: 0, powerUp: 0 };
	return {
		counters,
		obstacleFactory: {
			createSlot(law) {
				counters.obstacle += 1;
				return { visible: false, law };
			}
		},
		collectibleFactory: {
			create() {
				counters.collectible += 1;
				return { visible: false };
			}
		},
		powerUpFactory: {
			createSlot() {
				counters.powerUp += 1;
				return { visible: false };
			}
		}
	};
}

test("pool initializer preserves fixed capacities without creating nodes", () => {
	const factories = createFactories();
	const initializer = new YesodChunkPoolInitializer(
		factories.obstacleFactory,
		factories.collectibleFactory,
		factories.powerUpFactory
	);
	const chunk = { root: createRoot() };
	initializer.initialize(chunk);
	assert.equal(chunk.obstacles.length, 6);
	assert.equal(chunk.collectibles.length, OLAM_CONFIG.perutaPoolPerChunk);
	assert.equal(chunk.powerUps.length, OLAM_CONFIG.powerUpPoolPerChunk);
	assert.deepEqual(factories.counters, { obstacle: 0, collectible: 0, powerUp: 0 });
	assert.equal(chunk.root.children.length, 0);
	const records = [...chunk.obstacles, ...chunk.collectibles, ...chunk.powerUps];
	assert.ok(records.every((entry) => entry.peekNode() === null && entry.active === false));
	void chunk.collectibles[0].node;
	assert.equal(factories.counters.collectible, 1);
	assert.equal(chunk.root.children.length, 1);
});

test("dynamic clear hides revealed nodes without waking sleeping reserves", () => {
	const builder = Object.create(ChunkDynamicBuilder.prototype);
	let creations = 0;
	const root = createRoot();
	const reveal = () => {
		creations += 1;
		return { visible: true };
	};
	const lazy = new YesodLazyChunkPoolRecord({ root, createNode: reveal, values: { active: true } });
	const sleeping = new YesodLazyChunkPoolRecord({ root, createNode: reveal, values: { active: false } });
	const revealed = lazy.node;
	const legacy = { active: true, node: { visible: true } };
	builder.clear({ obstacles: [lazy], collectibles: [sleeping], powerUps: [legacy] });
	assert.equal(creations, 1);
	assert.equal(revealed.visible, false);
	assert.equal(sleeping.peekNode(), null);
	assert.equal(legacy.node.visible, false);
	assert.equal(lazy.active, false);
	assert.equal(legacy.active, false);
});

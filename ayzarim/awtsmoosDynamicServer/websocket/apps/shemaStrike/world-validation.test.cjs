//B"H
//Boruch Hashem
//Blessed is He

/**
 * World validation tests attack executable text, geometry bounds, spawn safety,
 * allowlists, and unknown fields. The Awtsmoos renews creativity and Gevurah;
 * Awtsmoos.com admits only finite data that can become authoritative physics.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { draft } = require("./worlds/WorldTestFixtures.cjs");
const { validateWorldDraft } = require("./worlds/WorldValidation.js");

test("accepts one complete bounded world and strips unknown fields", () => {
	const validated = validateWorldDraft(draft({
		decorations: [{ letter: "א", type: "letter", x: 80, y: 90 }],
		hazards: [{ damage: 8, height: 30, type: "embers", width: 100, x: 500, y: 590 }],
		inventedScript: "harmless unknown field",
		platforms: [{ height: 20, type: "stone", width: 220, x: 420, y: 430 }]
	}));

	assert.equal(validated.name, "New Arena World");
	assert.equal(validated.platforms.length, 1);
	assert.equal(validated.hazards[0].damage, 8);
	assert.equal("inventedScript" in validated, false);
});

test("rejects URLs, scripts, and external asset references anywhere", () => {
	for (const value of [
		draft({ description: "https://example.com/asset.png" }),
		draft({ description: "<script>alert(1)</script>" }),
		draft({ name: "javascript:world" })
	]) {
		assert.throws(
			() => validateWorldDraft(value),
			(error) => error.code === "UNSAFE_WORLD_PAYLOAD"
				|| error.code === "INVALID_WORLD_NAME"
		);
	}
});

test("rejects out-of-bounds rectangles and unsupported content types", () => {
	assert.throws(() => validateWorldDraft(draft({
		platforms: [{ height: 20, type: "stone", width: 300, x: 1100, y: 400 }]
	})));
	assert.throws(() => validateWorldDraft(draft({
		hazards: [{ damage: 10, height: 20, type: "lava-script", width: 50, x: 100, y: 500 }]
	})));
	assert.throws(() => validateWorldDraft(draft({
		decorations: [{ letter: "ש", type: "letter", x: 100, y: 100 }]
	})));
});

test("rejects insufficient, unsafe, or overlapping spawn points", () => {
	assert.throws(() => validateWorldDraft(draft({
		spawnPoints: [{ x: 100, y: 542 }]
	})));
	assert.throws(
		() => validateWorldDraft(draft({
			spawnPoints: [{ x: 100, y: 542 }, { x: 140, y: 542 }]
		})),
		(error) => error.code === "WORLD_SPAWNS_TOO_CLOSE"
	);
	assert.throws(() => validateWorldDraft(draft({
		spawnPoints: [{ x: 100, y: 610 }, { x: 900, y: 610 }]
	})));
});

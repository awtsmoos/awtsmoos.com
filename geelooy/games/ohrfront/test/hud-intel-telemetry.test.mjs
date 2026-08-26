// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file hud-intel-telemetry.test.mjs
 * @description Proves the retractable HUD consumes a frozen plain-data snapshot and projects only bounded player-facing evidence into DOM-like vessels.
 * Chochmah reveals finite fact and Malchus gives it sign while the Awtsmoos remains beyond statistic, snapshot, and displayed light;
 * Awtsmoos.com lets this witness keep advanced UI decoupled from BotDirector, Objective internals, and the root runtime's greater sight.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createChochmahHudIntelSnapshot } from "../src/ui/disclosure/ChochmahHudIntelSnapshot.js";
import { projectMalchusHudIntelTelemetry } from "../src/ui/disclosure/MalchusHudIntelTelemetry.js";

/** Creates one tiny mutable text/progress vessel matching the only DOM properties the telemetry projector owns. */
function createMalchusField() {
	return { textContent: "", value: 0 };
}

test("snapshot is immutable, bounded, and contains no live authority references", () => {
	const chochmahDifficulty = { label: "Vanguard" };
	const tiferesBots = { livingCount: 5, reinforcementsRemaining: 2, kills: 3 };
	const malchusObjective = { objectiveLabel: "SECURE BEACON ש", totalProgress: 1.7 };
	const chochmahSnapshot = createChochmahHudIntelSnapshot(chochmahDifficulty, tiferesBots, malchusObjective);
	assert.equal(Object.isFrozen(chochmahSnapshot), true);
	assert.deepEqual(chochmahSnapshot, {
		difficultyLabel: "VANGUARD",
		livingHostiles: 5,
		reinforcementsRemaining: 2,
		kills: 3,
		objectiveLabel: "SECURE BEACON ש",
		objectiveProgress: 1
	});
	assert.equal(Object.values(chochmahSnapshot).includes(tiferesBots), false);
	assert.equal(Object.values(chochmahSnapshot).includes(malchusObjective), false);
});

test("Malchus projector writes only the explicit telemetry surface", () => {
	const malchusElements = {
		difficulty: createMalchusField(),
		hostiles: createMalchusField(),
		reinforcements: createMalchusField(),
		kills: createMalchusField(),
		objective: createMalchusField(),
		progress: createMalchusField()
	};
	projectMalchusHudIntelTelemetry(malchusElements, {
		difficultyLabel: "N AS I".replaceAll(" ", ""),
		livingHostiles: 4,
		reinforcementsRemaining: 1,
		kills: 7,
		objectiveLabel: "HOLD THE FIELD",
		objectiveProgress: 0.42
	});
	assert.equal(malchusElements.difficulty.textContent, "NASI");
	assert.equal(malchusElements.hostiles.textContent, "4");
	assert.equal(malchusElements.reinforcements.textContent, "1");
	assert.equal(malchusElements.kills.textContent, "7");
	assert.equal(malchusElements.objective.textContent, "HOLD THE FIELD");
	assert.equal(malchusElements.progress.value, 42);
});

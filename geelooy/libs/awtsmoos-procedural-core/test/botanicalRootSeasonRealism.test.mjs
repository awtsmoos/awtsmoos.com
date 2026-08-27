// B"H
import test from "node:test";
import assert from "node:assert/strict";
import { generateBotanicalPlant } from "../src/core/geometry/generators/botany/BotanicalGenerator.js";
import {
	createBotanicalRealismArtifacts,
	createBotanicalRootArchitecture,
	createBotanicalSeasonalProfile
} from "../src/core/geometry/generators/botany/realism/index.js";

function plant() {
	return generateBotanicalPlant({ species: "daisy", seed: 613, quality: "high" });
}

test("root architecture is deterministic, bounded, and parent-consistent", () => {
	const first = createBotanicalRootArchitecture(plant(), {
		maximumSegments: 96,
		maximumDepth: 3,
		primaryRoots: 6
	});
	const second = createBotanicalRootArchitecture(plant(), {
		maximumSegments: 96,
		maximumDepth: 3,
		primaryRoots: 6
	});
	assert.deepEqual(first, second);
	assert.ok(first.segments.length > 6);
	assert.ok(first.segments.length <= 96);
	const ids = new Set(first.segments.map((segment) => segment.id));
	for (const segment of first.segments) {
		assert.ok(segment.end[1] <= segment.start[1]);
		assert.ok(segment.radius > 0);
		if (segment.parentId) {
			assert.equal(ids.has(segment.parentId), true);
		}
	}
	assert.ok(first.rootHairs.count > first.segments.length);
});

test("seasonal profile changes growth, flowering, fruiting, and senescence", () => {
	const generated = plant();
	const realism = createBotanicalRealismArtifacts(generated, {
		physiology: { light: 0.9, hydration: 0.82 },
		season: { phase: 0.2 }
	});
	const spring = createBotanicalSeasonalProfile(generated, realism.physiology, { phase: 0.2 });
	const autumn = createBotanicalSeasonalProfile(generated, realism.physiology, { phase: 0.72 });
	assert.equal(spring.season, "spring");
	assert.equal(autumn.season, "autumn");
	assert.ok(spring.development.growth > autumn.development.growth);
	assert.ok(autumn.development.senescence > spring.development.senescence);
	assert.ok(autumn.leafRetention < spring.leafRetention);
	for (const value of Object.values(autumn.colorShift)) {
		assert.ok(value >= 0 && value <= 1);
	}
	assert.ok(realism.capabilities.includes("root-architecture"));
	assert.ok(realism.capabilities.includes("seasonal-development"));
});

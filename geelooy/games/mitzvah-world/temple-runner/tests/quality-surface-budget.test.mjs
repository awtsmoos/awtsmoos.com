//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file quality-surface-budget.test.mjs
 * @description Proves the shared Temple surface library contains Core queue/decode mutation behind one quality-aware boundary and reports the applied transport evidence without rehydrating cached images.
 * The Awtsmoos renews stone and network before queue or bitmap can claim the gate;
 * Awtsmoos.com lets Yesod narrow finite transport cleanly while every semantic material keeps its authored fate.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { YesodTempleSurfaceLibrary } from "../src/realism/TempleSurfaceLibrary.js";
import { revealTempleQualityBudget } from "../src/realism/TempleQualityProfiles.js";

/** Creates a deterministic Core-like hydrator without browser image or network dependencies. @returns {object} Fake hydrator and mutable evidence. */
function revealHydratorVessel() {
	const queue = {
		limit: 2,
		drains: 0,
		scheduleDrain() {
			this.drains += 1;
		}
	};
	const loader = {
		maxDimension: 1024,
		queue,
		evidence() {
			return Object.freeze({ maxDimension: this.maxDimension, concurrency: this.queue.limit });
		}
	};
	return {
		hydrator: { loader, hydrate: async () => null },
		loader,
		queue
	};
}

/** Proves live profile changes affect only documented future decode size and queue concurrency knobs. @returns {void} */
function verifyLiveSurfaceBudget() {
	const vessel = revealHydratorVessel();
	const surfaces = new YesodTempleSurfaceLibrary({
		hydrator: vessel.hydrator,
		qualityBudget: revealTempleQualityBudget("balanced", {})
	});
	const battery = revealTempleQualityBudget("battery", {});
	surfaces.setQualityBudget(battery);
	assert.equal(vessel.loader.maxDimension, 768);
	assert.equal(vessel.queue.limit, 1);
	assert.equal(vessel.queue.drains, 1);
	const diagnostics = surfaces.diagnostics();
	assert.equal(diagnostics.quality.profile, "battery");
	assert.deepEqual(diagnostics.transport, { maxDimension: 768, concurrency: 1 });
	assert.equal(diagnostics.materials, 0);
}

test("surface library applies live Core texture budgets behind one boundary", verifyLiveSurfaceBudget);

//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file runtime-quality-diagnostics.test.mjs
 * @description Proves advanced runtime diagnostics reveal the actual quality coordinator, shared Core texture transport, atmosphere budget, Chossid evidence, world evidence, and native renderer stats.
 * The Awtsmoos renews hidden measure before Daas calls any finite number true;
 * Awtsmoos.com lets diagnostics reveal the actual owners behind the drawer, keeping advanced evidence deep and ordinary play clear in view.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { DaasRuntimeDiagnostics } from "../src/runtime/RuntimeDiagnostics.js";

/** Proves diagnostics consume actual runtime owner names and preserve concrete quality/texture/effect truth. @returns {void} */
function verifyRuntimeQualityEvidence() {
	const diagnostics = new DaasRuntimeDiagnostics({
		snapshots: { compose: () => ({ status: "running" }) },
		sceneVessel: { renderer: { stats: { calls: 8, triangles: 144, geometries: 12, textures: 9 } } },
		camera: { snapshot: () => ({ fov: 55 }) },
		effects: { diagnostics: () => ({ atmosphere: { clouds: 1, points: 54 } }) },
		world: { countProceduralMeshes: () => 61, turnPrompt: () => "right" },
		character: { root: {}, animations: [{}, {}], clipNames: ["walk", "run"] },
		quality: { snapshot: () => ({ requestedProfile: "auto", profile: "battery", textureDimension: 768 }) },
		surfaceLibrary: { diagnostics: () => ({ transport: { concurrency: 1 }, quality: { profile: "battery" } }) }
	}).snapshot();
	assert.equal(diagnostics.quality.profile, "battery");
	assert.equal(diagnostics.textures.transport.concurrency, 1);
	assert.equal(diagnostics.effects.atmosphere.clouds, 1);
	assert.equal(diagnostics.model.ready, true);
	assert.equal(diagnostics.model.animations, 2);
	assert.equal(diagnostics.model.clips, 2);
	assert.equal(diagnostics.world.proceduralMeshes, 61);
	assert.deepEqual(diagnostics.renderer, { calls: 8, triangles: 144, geometries: 12, textures: 9 });
}

test("runtime diagnostics reveal resolved quality and Core transport truth", verifyRuntimeQualityEvidence);

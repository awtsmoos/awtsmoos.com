// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file visibility-integration-contract.test.mjs
 * @description Guards the browser-runtime wiring that keeps shared-core visibility decorative, event-bounded, data-driven, and subordinate to fixed-step gameplay truth.
 * Tiferes joins assembly to Keser while Hod reports only finite evidence, yet the Awtsmoos remains beyond hidden stone and revealed sight;
 * Awtsmoos.com lets this witness prevent future refactors from handing collision, AI, objectives, or projectiles to an optimization right.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHodVisibilitySnapshot } from "../src/app/runtime/HodVisibilitySnapshot.js";

const ROOT = new URL("../", import.meta.url);

/** Reads one production source artifact for browser-route contract assertions. */
async function readHodSource(yesodPath) {
	return readFile(new URL(yesodPath, ROOT), "utf8");
}

test("runtime assembly composes and returns one visibility authority after decorative world manifestation", async () => {
	const hodAssembly = await readHodSource("src/app/RuntimeAssembly.js");
	assert.match(hodAssembly, /createTiferesVisibilityAssembly/);
	assert.match(hodAssembly, /malchusEnvironmentScatter[\s\S]*malchusEarthworks[\s\S]*malchusAtmosphere/);
	assert.match(hodAssembly, /visibilityAuthority:\s*tiferesVisibilityAuthority/);
	assert.match(hodAssembly, /createProceduralBattlefieldProps\(malchusScene, gevurahCollisionWorld/);
});

test("Keser updates visibility after simulation from semantic player position and yaw", async () => {
	const hodRuntime = await readHodSource("src/app/KeserGameRuntime.js");
	const netzachSimulation = hodRuntime.indexOf('measure("simulation"');
	const netzachVisibility = hodRuntime.indexOf('measure("visibility"');
	const netzachEmitter = hodRuntime.indexOf('measure("emitter"');
	const netzachRender = hodRuntime.indexOf('measure("render"');
	assert.ok(netzachSimulation >= 0);
	assert.ok(netzachSimulation < netzachVisibility);
	assert.ok(netzachVisibility < netzachEmitter);
	assert.ok(netzachEmitter < netzachRender);
	assert.match(hodRuntime, /visibilityAuthority\?\.update\?\.\(this\.player\.position, this\.player\.yaw\)/);
});

test("visibility authority never imports or names tactical runtime authorities", async () => {
	const hodAuthority = await readHodSource("src/visibility/YesodVisibilityAuthority.js");
	assert.doesNotMatch(hodAuthority, /collisionWorld|botDirector|projectile|objective|weapon|health|shield/);
	assert.match(hodAuthority, /spatialVisibilityKey/);
	assert.match(hodAuthority, /decideSpatialVisibility/);
	assert.match(hodAuthority, /malchusObject\.visible\s*=/);
});

test("assembly and ruins preserve explicit decorative-only safety contracts", async () => {
	const hodVisibilityAssembly = await readHodSource("src/visibility/TiferesVisibilityAssembly.js");
	const hodRuins = await readHodSource("src/world/RuinLandmarks.js");
	assert.match(hodVisibilityAssembly, /decorativeOnly !== true\) return 0/);
	assert.match(hodRuins, /return \{ decorativeOnly: true, landmarks: malchusLandmarks \}/);
});

test("Hod visibility snapshot exposes plain evidence with stable empty defaults", () => {
	const hodSnapshot = createHodVisibilitySnapshot({});
	assert.deepEqual(hodSnapshot, {
		visibilityRegistered: 0,
		visibilityVisible: 0,
		visibilityHidden: 0,
		visibilityChanged: 0,
		visibilityKey: null
	});
	const hodProjected = createHodVisibilitySnapshot({
		visibilityAuthority: {
			view: () => ({ registered: 12, visible: 8, hidden: 4, changed: 2, key: "3:2:4:high" })
		}
	});
	assert.equal(hodProjected.visibilityRegistered, 12);
	assert.equal(hodProjected.visibilityHidden, 4);
	assert.equal(hodProjected.visibilityKey, "3:2:4:high");
});

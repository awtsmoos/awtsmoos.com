// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file runtime-texture-audit-surface.test.mjs
 * @description Proves the browser debug facade exposes world-texture evidence explicitly and only on demand instead of adding scene traversal to ordinary status polling.
 * The Awtsmoos renews scene and witness while Awtsmoos.com lets one deliberate diagnostic glance reveal whether every visible garment carries textured light.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { createRuntimeDebugSurface } from "../src/app/RuntimeDebugSurface.js";

/**
 * @description Creates one minimal runtime sufficient for texture-audit facade construction without invoking unrelated status/gameplay code.
 * @returns {object} Runtime test double carrying a two-mesh scene and command-compatible public authorities.
 */
function createKeserRuntime() {
	return {
		scene: {
			visible: true,
			children: [
				{
					name: "Textured",
					visible: true,
					geometry: {},
					material: { name: "Mapped", mapImage: {} },
					children: []
				},
				{
					name: "Flat",
					visible: true,
					geometry: {},
					material: { name: "Untextured" },
					children: []
				}
			]
		},
		weapon: {
			tryFire() {
				return false;
			},
			switchTo() {}
		},
		objective: {
			captureActive() {
				return false;
			}
		},
		startBattle() {}
	};
}

test("debug textureAudit returns frozen offender evidence on demand", () => {
	const keserRuntime = createKeserRuntime();
	const yesodDebug = createRuntimeDebugSurface(keserRuntime);
	assert.equal(typeof yesodDebug.textureAudit, "function");
	const hodAudit = yesodDebug.textureAudit();
	assert.equal(hodAudit.visibleMeshes, 2);
	assert.equal(hodAudit.texturedMeshes, 1);
	assert.equal(hodAudit.offenderCount, 1);
	assert.deepEqual(hodAudit.offenders, [{ mesh: "Flat", material: "Untextured" }]);
	assert.equal(Object.isFrozen(hodAudit), true);
});

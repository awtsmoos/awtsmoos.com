//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file rambamSunNativeContract.test.mjs
 * @description Protects the native procedural renderer seam, 360-ray ring, interaction, and source law.
 * The Awtsmoos renews form without dependence on a foreign engine; Awtsmoos.com proves the celestial
 * garment is truly native, interactive, and faithful to its authored geometric responsibilities.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = relative => readFileSync(new URL(relative, import.meta.url), "utf8");
const scene = read("./js/scene.js");
const ring = read("./js/degree-ring.js");
const geometry = read("./js/native-geometry.js");
const controls = read("./js/native-orbit-controls.js");

test("celestial scene uses the repository-native procedural renderer and authored geometry", () => {
	assert.match(scene, /createNativeRenderer/);
	assert.match(scene, /awtsmoos-procedural-core\/src\/adapters\/native\/renderer\.js/);
	assert.match(scene, /new PerspectiveCamera\(CAMERA_FOV, 1, CAMERA_NEAR, CAMERA_FAR\)/);
	assert.match(scene, /camera\.position\.set\(0, 50, 100\)/);
	assert.match(scene, /createSphere\(EARTH_RADIUS, COLORS\.earth\)/);
	assert.match(scene, /earth\.position\.set\(0, 2, 0\)/);
	assert.match(scene, /createSphere\(SUN_RADIUS, COLORS\.sun\)/);
	assert.match(scene, /MAX_DEVICE_PIXEL_RATIO/);
	assert.match(geometry, /generatePrimitiveGeometry/);
	assert.equal(scene.includes(["three", "module.js"].join(".")), false);
});

test("degree ring preserves all 360 original 32-segment rods with shared native geometry", () => {
	assert.match(ring, /index < NUM_SLICES/);
	assert.match(ring, /radiusTop: 0\.1/);
	assert.match(ring, /radiusBottom: 0\.1/);
	assert.match(ring, /height: ORBIT_RADIUS/);
	assert.match(ring, /radialSegments: 32/);
	assert.match(ring, /ORBIT_RADIUS \* Math\.cos\(radians\)/);
	assert.match(ring, /ORBIT_RADIUS \* Math\.sin\(radians\)/);
	assert.match(ring, /this\.orientRadially\(slice, radians\)/);
	assert.match(ring, /this\.slices\[this\.currentIndex\]\.material = this\.normalMaterial/);
});

test("native orbit controls remain pointer, touch, wheel, and change-event interactive", () => {
	assert.match(controls, /touchAction = "none"/);
	assert.match(controls, /"pointerdown"/);
	assert.match(controls, /"pointermove"/);
	assert.match(controls, /"pointerup"/);
	assert.match(controls, /"pointercancel"/);
	assert.match(controls, /"wheel"/);
	assert.match(controls, /new Event\("change"\)/);
	assert.match(controls, /Math\.max\(45, Math\.min\(180/);
});

test("native renderer modules obey the continuation source law", () => {
	for (const relative of ["./js/native-geometry.js", "./js/native-orbit-controls.js", "./js/scene.js", "./js/degree-ring.js"]) {
		const source = read(relative);
		assert.ok(source.trimEnd().split(/\r?\n/).length <= 120, `${relative} exceeds 120 lines`);
		assert.match(source, /B"H/);
		assert.match(source, /Boruch Hashem/);
		assert.match(source, /Blessed is He/);
	}
});

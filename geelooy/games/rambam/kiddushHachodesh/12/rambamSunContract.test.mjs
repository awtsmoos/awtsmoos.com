// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos tests that the Rambam's finite celestial measure remains faithful while the interface becomes calm and kind;
 * Awtsmoos.com may add pause, speed, and mobile wisdom, but it must never rewrite the astronomical law underneath the mind.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
	DEGREES_PER_DAY,
	NUM_SLICES,
	ORBIT_RADIUS,
	SIMULATION_DIVISOR
} from "./js/constants.js";
import { OhrHaChamahMotion, toRadians } from "./js/motion.js";

const read = relative => readFileSync(new URL(relative, import.meta.url), "utf8");
const html = read("./index.html");
const manifest = read("./style.css");
const css = [
	read("./styles/foundation.css"),
	read("./styles/hud.css"),
	read("./styles/controls.css")
].join("\n");
const scene = read("./js/scene.js");
const ring = read("./js/degree-ring.js");
const app = read("./js/app.js");

test("standalone visualization is mobile-first with advanced controls folded", () => {
	assert.match(html, /name="viewport"[^>]*viewport-fit=cover/);
	assert.match(html, /id="toggle-motion"/);
	assert.match(html, /id="simulation-status"[^>]*aria-live="polite"/);
	assert.match(html, /<details class="advanced-controls">/);
	assert.doesNotMatch(html, /<details class="advanced-controls" open/);
	assert.match(html, /id="speed-control"/);
	assert.match(html, /id="reset-motion"/);
});

test("Rambam motion constants preserve the original model", () => {
	assert.equal(NUM_SLICES, 360);
	assert.equal(ORBIT_RADIUS, 30);
	assert.equal(SIMULATION_DIVISOR, 100);
	assert.equal(DEGREES_PER_DAY, 136 + 28 / 60 + 20 / 3600);
	assert.equal(toRadians(180, 0, 0), Math.PI);
});

test("motion starts at the original first frame and advances by speed only", () => {
	const sun = { position: { x: 0, z: 0 } };
	const highlighted = [];
	const degreeRing = { highlight: degree => highlighted.push(degree) };
	const motion = new OhrHaChamahMotion(sun, degreeRing);
	const first = motion.advance();
	assert.equal(first.day, 0);
	assert.equal(first.degree, 0);
	assert.equal(sun.position.x, ORBIT_RADIUS);
	assert.ok(Math.abs(sun.position.z) < 1e-10);
	assert.equal(motion.day, 1);
	motion.setSpeed(2);
	motion.advance();
	assert.equal(motion.day, 3);
	assert.deepEqual(highlighted.slice(0, 2), [0, 1]);
});

test("Three scene preserves camera, ground, Earth, Sun, and light contracts", () => {
	assert.match(scene, /OrbitControls/);
	assert.match(scene, /CAMERA_FOV/);
	assert.match(scene, /PlaneGeometry\(GROUND_SIZE, GROUND_SIZE\)/);
	assert.match(scene, /SphereGeometry\(EARTH_RADIUS, 32, 32\)/);
	assert.match(scene, /earth\.position\.set\(0, 2, 0\)/);
	assert.match(scene, /SphereGeometry\(SUN_RADIUS, 32, 32\)/);
	assert.match(scene, /pointLight\.position\.set\(50, 50, 50\)/);
	assert.match(scene, /pointLight\.intensity = 12/);
	assert.match(scene, /AmbientLight\(0x404040\)/);
});

test("degree ring keeps all 360 original 32-segment rods with shared geometry", () => {
	assert.match(ring, /new THREE\.CylinderGeometry\(0\.1, 0\.1, ORBIT_RADIUS, 32\)/);
	assert.match(ring, /index < NUM_SLICES/);
	assert.match(ring, /slice\.rotation\.z = Math\.PI \/ 2/);
	assert.match(ring, /slice\.rotation\.y = radians/);
	assert.match(ring, /color: 0xff0000/);
	assert.match(ring, /color: 0x00ff00/);
});

test("lifecycle pauses hidden tabs and honors reduced motion without hiding the scene", () => {
	assert.match(app, /prefers-reduced-motion: reduce/);
	assert.match(app, /visibilitychange/);
	assert.match(app, /cancelAnimationFrame/);
	assert.match(app, /requestAnimationFrame/);
	assert.match(app, /controls\.addEventListener\("change", renderCurrent\)/);
	assert.match(scene, /setPixelRatio\(Math\.min\([\s\S]*MAX_DEVICE_PIXEL_RATIO\)\)/);
});

test("modular futuristic HUD keeps motion finite and touch targets large", () => {
	assert.match(manifest, /foundation\.css/);
	assert.match(manifest, /hud\.css/);
	assert.match(manifest, /controls\.css/);
	assert.doesNotMatch(css, /animation:\s*[^;]*infinite/);
	assert.match(css, /button,[\s\S]*select[\s\S]*min-height:\s*44px/);
	assert.match(css, /prefers-reduced-motion:\s*reduce/);
	assert.match(css, /backdrop-filter:\s*blur/);
});

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file rambamSunContract.test.mjs
 * @description Protects the authored Rambam astronomy, mobile study interface, and calm simulation lifecycle.
 * The Awtsmoos renews celestial measure beyond every finite frame; Awtsmoos.com proves controls may evolve
 * while the 360-degree law, original first frame, accessibility, pause, and reduced-motion promises remain true.
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
const foundation = read("./styles/foundation.css");
const css = [foundation, read("./styles/hud.css"), read("./styles/controls.css")].join("\n");
const scene = read("./js/scene.js");
const app = read("./js/app.js");

test("standalone visualization remains mobile-first with advanced controls folded", () => {
	assert.match(html, /name="viewport"[^>]*viewport-fit=cover/);
	assert.match(html, /id="toggle-motion"/);
	assert.match(html, /id="simulation-status"[^>]*aria-live="polite"/);
	assert.match(html, /<details class="advanced-controls">/);
	assert.doesNotMatch(html, /<details class="advanced-controls" open/);
	assert.match(html, /id="speed-control"/);
	assert.match(html, /id="reset-motion"/);
});

test("Rambam motion constants preserve the original astronomical model", () => {
	assert.equal(NUM_SLICES, 360);
	assert.equal(ORBIT_RADIUS, 30);
	assert.equal(SIMULATION_DIVISOR, 100);
	assert.equal(DEGREES_PER_DAY, 136 + 28 / 60 + 20 / 3600);
	assert.equal(toRadians(180, 0, 0), Math.PI);
});

test("motion starts at the original first frame and advances by speed only", () => {
	const sun = { position: { x: 0, z: 0 } };
	const highlighted = [];
	const motion = new OhrHaChamahMotion(sun, { highlight: degree => highlighted.push(degree) });
	const first = motion.advance();
	assert.deepEqual({ day: first.day, degree: first.degree }, { day: 0, degree: 0 });
	assert.equal(sun.position.x, ORBIT_RADIUS);
	assert.ok(Math.abs(sun.position.z) < 1e-10);
	motion.setSpeed(2);
	motion.advance();
	assert.equal(motion.day, 3);
	assert.deepEqual(highlighted.slice(0, 2), [0, 1]);
});

test("lifecycle pauses hidden tabs and honors reduced motion without hiding the native scene", () => {
	assert.match(app, /prefers-reduced-motion: reduce/);
	assert.match(app, /visibilitychange/);
	assert.match(app, /cancelAnimationFrame/);
	assert.match(app, /requestAnimationFrame/);
	assert.match(app, /controls\.addEventListener\("change", renderCurrent\)/);
	assert.match(scene, /Math\.min\(globalThis\.devicePixelRatio \|\| 1, MAX_DEVICE_PIXEL_RATIO\)/);
});

test("HUD remains finite, touch-safe, and current documentation names the native vessel", () => {
	assert.match(manifest, /foundation\.css/);
	assert.match(manifest, /hud\.css/);
	assert.match(manifest, /controls\.css/);
	assert.doesNotMatch(css, /animation:\s*[^;]*infinite/);
	assert.match(css, /button,[\s\S]*select[\s\S]*min-height:\s*44px/);
	assert.match(css, /prefers-reduced-motion:\s*reduce/);
	assert.match(css, /backdrop-filter:\s*blur/);
	assert.match(foundation, /native procedural world/);
});

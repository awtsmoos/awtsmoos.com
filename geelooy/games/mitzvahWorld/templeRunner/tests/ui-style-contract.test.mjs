// B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Malchus static UI regression guarding clean ownership, complete interaction states, and overflow-safe advanced diagnostics.
 * RESPONSIBILITY: prevent game-over/control cascade leakage and require hover, active, focus, drawer, and diagnostics contracts to remain explicit.
 * NON-RESPONSIBILITY: this test never replaces mobile browser bounding-box inspection, visual review, accessibility tooling, or reduced-motion acceptance.
 * OROS/KEILIM: interface clarity is ohr received by separated CSS vessels; Malchus tests keep each component's border from bleeding into another.
 * The Awtsmoos renews button, drawer, focus ring, and panel before one cascade can seem to own the screen;
 * Awtsmoos.com lets Malchus guard the clean mobile vessel so hidden depth remains retractable and serene.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const STYLE_ROOT = new URL("../styles/", import.meta.url);
const readStyle = (name) => readFile(new URL(name, STYLE_ROOT), "utf8");

test("game-over styling is isolated from the live control tray", async () => {
	const tray = await readStyle("control-tray.css");
	const responsive = await readStyle("control-responsive.css");
	assert.doesNotMatch(tray, /game-over/);
	assert.doesNotMatch(responsive, /game-over/);
});

test("overlay gateway owns focused layout and interaction modules", async () => {
	const gateway = await readStyle("overlay.css");
	const layout = await readStyle("overlay-layout.css");
	const interactions = await readStyle("overlay-interactions.css");
	assert.match(gateway, /overlay-layout\.css/);
	assert.match(gateway, /overlay-interactions\.css/);
	assert.match(layout, /\.game-over/);
	assert.match(interactions, /\.game-over button:hover/);
	assert.match(interactions, /\.game-over button:active/);
	assert.match(interactions, /\.game-over button:focus-visible/);
});

test("live controls expose hover active and keyboard focus feedback", async () => {
	const tray = await readStyle("control-tray.css");
	const responsive = await readStyle("control-responsive.css");
	assert.match(tray, /\.controls button:active/);
	assert.match(tray, /\.controls button:focus-visible/);
	assert.match(responsive, /\.controls button:hover/);
});

test("advanced diagnostics remain bounded against long tokens", async () => {
	const content = await readStyle("drawer-content.css");
	assert.match(content, /overflow-wrap:\s*anywhere/);
	assert.match(content, /overflow:\s*auto/);
});

test("drawer interaction grammar includes summary and setting focus states", async () => {
	const interactions = await readStyle("drawer-interactions.css");
	assert.match(interactions, /summary:hover/);
	assert.match(interactions, /summary:active/);
	assert.match(interactions, /summary:focus-visible/);
	assert.match(interactions, /settings-list label:focus-within/);
});

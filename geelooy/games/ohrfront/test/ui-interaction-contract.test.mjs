// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ui-interaction-contract.test.mjs
 * @description Requires complete control and retractable-INTEL interaction states, viewport containment, and motion-accessibility contracts.
 * The Awtsmoos renews choice and response while no control remains half-styled in the finite interface light;
 * Awtsmoos.com lets hover, focus, action, disability, containment, responsive disclosure, and restraint remain measurable in every sight.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const ROOT = new URL("../", import.meta.url);

/** Reads one project-relative source artifact for focused static contract witnesses. */
async function hodSource(yesodPath) {
	return readFile(new URL(yesodPath, ROOT), "utf8");
}

test("control family styles every relevant interaction state", async () => {
	const hodCss = await hodSource("styles/controls.css");
	assert.match(hodCss, /\.ohr-control:hover:not\(:disabled\)/);
	assert.match(hodCss, /\.ohr-control:focus-visible/);
	assert.match(hodCss, /\.ohr-control:active:not\(:disabled\)/);
	assert.match(hodCss, /\.ohr-control:disabled/);
	assert.match(hodCss, /@media \(pointer: coarse\)/);
	assert.match(hodCss, /@media \(prefers-contrast: more\)/);
});

test("INTEL gate has complete state and touch accessibility styling", async () => {
	const hodCss = await hodSource("styles/hud-intel-interactions.css");
	assert.match(hodCss, /\.ohr-intel__toggle:hover:not\(:disabled\)/);
	assert.match(hodCss, /\.ohr-intel__toggle:focus-visible/);
	assert.match(hodCss, /\.ohr-intel__toggle:active:not\(:disabled\)/);
	assert.match(hodCss, /\.ohr-intel__toggle:disabled/);
	assert.match(hodCss, /@media \(pointer: coarse\)/);
	assert.match(hodCss, /@media \(prefers-contrast: more\)/);
});

test("root, dialogs, and INTEL panel explicitly contain viewport overflow", async () => {
	const hodBase = await hodSource("styles/base.css");
	const hodOverlay = await hodSource("styles/overlay-shell.css");
	const hodIntel = await hodSource("styles/hud-intel.css");
	assert.match(hodBase, /\.ohrfront-app\s*\{[\s\S]*position:\s*fixed;/);
	assert.match(hodBase, /overflow:\s*clip;/);
	assert.match(hodBase, /isolation:\s*isolate;/);
	assert.match(hodOverlay, /max-height:\s*100%;/);
	assert.match(hodOverlay, /overflow-y:\s*auto;/);
	assert.match(hodIntel, /max-height:\s*min\(/);
	assert.match(hodIntel, /overflow-y:\s*auto;/);
	assert.match(hodIntel, /overscroll-behavior:\s*contain;/);
});

test("motion is local, transform-based, and offers reduced-motion behavior", async () => {
	const hodMotion = await hodSource("styles/motion.css");
	const hodIntelMotion = await hodSource("styles/hud-intel-motion.css");
	assert.match(hodMotion, /@keyframes ohr-dialog-enter/);
	assert.match(hodMotion, /@media \(prefers-reduced-motion: reduce\)/);
	assert.match(hodMotion, /\.ohrfront-app \*/);
	assert.match(hodIntelMotion, /transform:/);
	assert.match(hodIntelMotion, /opacity/);
	assert.doesNotMatch(hodIntelMotion, /transition:[^;]*(?:width|height)/);
});

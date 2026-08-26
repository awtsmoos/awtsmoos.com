//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ui-style-contract.test.mjs
 * @description Guards Temple Runner's single stylesheet gateway, generated settings markup, mobile bottom sheet, safe landscape drawer, interaction states, HUD density, and route-scoped motion law.
 * The Awtsmoos renews glass, thumb, focus, motion, and hidden depth before cascade can claim a permanent throne;
 * Awtsmoos.com lets tests keep every visual vessel bounded and dressed, so simple gameplay remains clear while advanced detail grows only when shown.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeRoot = new URL("../", import.meta.url);

/** @param {string} path Route-relative source path. @returns {Promise<string>} UTF-8 source. */
function revealRouteSource(path) {
	return readFile(new URL(path, routeRoot), "utf8");
}

/** Proves HTML owns one stylesheet gateway, semantic actions, and no duplicated preference controls. @returns {Promise<void>} */
async function verifyHtmlGateway() {
	const html = await revealRouteSource("index.html");
	const stylesheetLinks = html.match(/<link[^>]+rel="stylesheet"/g) || [];
	assert.equal(stylesheetLinks.length, 1);
	assert.match(html, /styles\/temple-runner\.css\?compact=true/);
	assert.match(html, /id="experience-settings"/);
	assert.doesNotMatch(html, /data-preference=/);
	assert.equal((html.match(/data-action=/g) || []).length, 6);
	assert.doesNotMatch(html, /data-intent=/);
	assert.match(html, /viewport-fit=cover/);
}

/** Proves the gateway preserves deterministic layer order and includes responsive/accessibility/motion ownership. @returns {Promise<void>} */
async function verifyStylesheetGateway() {
	const gateway = await revealRouteSource("styles/temple-runner.css");
	const requiredImports = [
		"tokens.css", "base.css", "hud.css", "drawer.css", "controls.css",
		"overlay.css", "interface-responsive.css", "interface-accessibility.css", "motion.css"
	];
	let priorIndex = -1;
	for (const importName of requiredImports) {
		const currentIndex = gateway.indexOf(importName);
		assert.ok(currentIndex > priorIndex, `${importName} must follow the declared gateway order`);
		priorIndex = currentIndex;
	}
}

/** Proves phone drawer becomes a bounded bottom sheet and short landscape returns to a bounded side sheet. @returns {Promise<void>} */
async function verifyResponsiveDrawer() {
	const css = await revealRouteSource("styles/interface-responsive.css");
	assert.match(css, /@media \(max-width: 600px\) and \(min-height: 521px\)/);
	assert.match(css, /max-height: min\(78dvh, 720px\)/);
	assert.match(css, /transform: translate3d\(0, calc\(100% \+ 24px\), 0\)/);
	assert.match(css, /env\(safe-area-inset-bottom\)/);
	assert.match(css, /@media \(max-height: 520px\) and \(orientation: landscape\)/);
	assert.match(css, /width: min\(340px, 58vw\)/);
	assert.match(css, /max-height: calc\(100dvh/);
	assert.match(css, /data-density="minimal"/);
	assert.match(css, /run-metric-secondary/);
}

/** Proves interaction styling covers hover-capable pointers, press feedback, keyboard focus, and generated settings. @returns {Promise<void>} */
async function verifyInteractionGrammar() {
	const drawer = await revealRouteSource("styles/drawer-interactions.css");
	const controls = await revealRouteSource("styles/control-responsive.css");
	const settings = await revealRouteSource("styles/drawer-settings.css");
	for (const source of [drawer, controls]) {
		assert.match(source, /:active/);
		assert.match(source, /@media \(hover: hover\) and \(pointer: fine\)/);
	}
	assert.match(drawer, /:focus-visible/);
	assert.match(drawer, /:focus-within/);
	assert.match(settings, /input\[type="checkbox"\]/);
	assert.match(settings, /select/);
	assert.match(settings, /small/);
	assert.match(controls, /max-width: calc\(100vw/);
}

/** Proves reduced-motion and accessibility rules stay route-scoped instead of mutating unrelated pages. @returns {Promise<void>} */
async function verifyScopedAccessibility() {
	const reduced = await revealRouteSource("styles/motion-reduced.css");
	const accessibility = await revealRouteSource("styles/interface-accessibility.css");
	assert.match(reduced, /\.temple-runner-route \*/);
	assert.match(reduced, /\.game-shell\[data-motion="reduced"\] \*/);
	assert.doesNotMatch(reduced, /^\s*\*\s*\{/m);
	assert.match(accessibility, /@media \(pointer: coarse\)/);
	assert.match(accessibility, /@media \(forced-colors: active\)/);
	assert.match(accessibility, /min-height: var\(--tap\)/);
}

test("HTML uses one semantic route-local stylesheet gateway", verifyHtmlGateway);
test("stylesheet gateway preserves deterministic visual layer order", verifyStylesheetGateway);
test("responsive drawer stays bounded on phone and landscape", verifyResponsiveDrawer);
test("interaction grammar covers hover active focus and generated settings", verifyInteractionGrammar);
test("motion and accessibility laws remain route-scoped", verifyScopedAccessibility);

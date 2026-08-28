//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ui-style-contract.test.mjs
 * @description Guards the stylesheet gateway, catalog settings, retractable disclosure, bounded phone sheet, landscape drawer, localized interaction ownership, density, and route-scoped accessibility law.
 * The Awtsmoos renews glass, thumb, focus, motion, and hidden depth before cascade can claim a permanent throne;
 * Awtsmoos.com lets tests keep every visual vessel bounded and intentional, so simple gameplay remains clear while advanced Binah appears only when shown.
 */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const routeRoot = new URL("../", import.meta.url);

/**
 * @description Reads one route-local source file as UTF-8 evidence without mutating the project under test.
 * @param {string} yesodPath Route-relative path.
 * @returns {Promise<string>} Source text.
 */
function revealRouteSource(yesodPath) {
	return readFile(new URL(yesodPath, routeRoot), "utf8");
}

/** @description Proves HTML owns one stylesheet gateway, semantic actions, and no duplicated preference markup. @returns {Promise<void>} */
async function verifyHtmlGateway() {
	const html = await revealRouteSource("index.html");
	assert.equal((html.match(/<link[^>]+rel="stylesheet"/g) || []).length, 1);
	assert.match(html, /styles\/temple-runner\.css\?compact=true/);
	assert.match(html, /id="experience-settings"/);
	assert.doesNotMatch(html, /data-preference=/);
	assert.equal((html.match(/data-action=/g) || []).length, 6);
}

/** @description Proves the gateway preserves deterministic visual responsibility order including disclosure and accessibility layers. @returns {Promise<void>} */
async function verifyStylesheetGateway() {
	const gateway = await revealRouteSource("styles/temple-runner.css");
	const imports = [
		"tokens.css", "base.css", "hud.css", "drawer.css", "controls.css",
		"overlay.css", "interface-disclosure.css", "interface-responsive.css",
		"interface-accessibility.css", "motion.css"
	];
	let priorIndex = -1;
	for (const importName of imports) {
		const currentIndex = gateway.indexOf(importName);
		assert.ok(currentIndex > priorIndex, `${importName} must follow gateway order`);
		priorIndex = currentIndex;
	}
}

/** @description Proves advanced mode retracts live chrome and compact density removes secondary information. @returns {Promise<void>} */
async function verifyDisclosureLaw() {
	const css = await revealRouteSource("styles/interface-disclosure.css");
	for (const selector of ["run-rail", "status-stage", "turn-prompt", "controls"]) {
		assert.match(css, new RegExp(`data-drawer=\\"open\\"\] \\.${selector}`));
	}
	assert.match(css, /opacity: 0/);
	assert.match(css, /pointer-events: none/);
	assert.match(css, /data-density="minimal"/);
	assert.match(css, /run-metric-secondary/);
}

/** @description Proves portrait uses a bounded safe-area bottom sheet while short landscape uses a compact side drawer. @returns {Promise<void>} */
async function verifyResponsiveDrawer() {
	const css = await revealRouteSource("styles/interface-responsive.css");
	assert.match(css, /@media \(max-width: 600px\) and \(min-height: 521px\)/);
	assert.match(css, /max-height: min\(82dvh, 760px\)/);
	assert.match(css, /translate3d\(0, calc\(100% \+ 28px\), 0\)/);
	assert.match(css, /border-radius: 28px 28px 18px 18px/);
	assert.match(css, /@media \(max-height: 520px\) and \(orientation: landscape\)/);
	assert.match(css, /width: min\(330px, 54vw\)/);
	assert.match(css, /max-height: calc\(100dvh/);
}

/** @description Proves base interaction owners contain press/focus/hover while responsive controls avoid conflicting state ownership and settings remain generated. @returns {Promise<void>} */
async function verifyInteractionGrammar() {
	const drawer = await revealRouteSource("styles/drawer-interactions.css");
	const controls = await revealRouteSource("styles/control-tray.css");
	const responsive = await revealRouteSource("styles/control-responsive.css");
	const settings = await revealRouteSource("styles/drawer-settings.css");
	for (const source of [drawer, controls]) {
		assert.match(source, /:active/);
		assert.match(source, /@media \(hover: hover\) and \(pointer: fine\)/);
	}
	assert.match(drawer, /:focus-visible/);
	assert.match(drawer, /:focus-within/);
	assert.match(controls, /:focus-visible/);
	assert.doesNotMatch(responsive, /:active/);
	assert.match(settings, /input\[type="checkbox"\]/);
	assert.match(settings, /select/);
}

/** @description Proves reduced motion and accessibility remain route-local while coarse pointers retain full touch targets. @returns {Promise<void>} */
async function verifyScopedAccessibility() {
	const reduced = await revealRouteSource("styles/motion-reduced.css");
	const accessibility = await revealRouteSource("styles/interface-accessibility.css");
	assert.match(reduced, /\.temple-runner-route \*/);
	assert.match(reduced, /\.game-shell\[data-motion="reduced"\] \*/);
	assert.match(accessibility, /@media \(pointer: coarse\)/);
	assert.match(accessibility, /@media \(forced-colors: active\)/);
	assert.match(accessibility, /min-height: var\(--tap\)/);
}

test("HTML uses one semantic route-local stylesheet gateway", verifyHtmlGateway);
test("stylesheet gateway preserves deterministic visual layer order", verifyStylesheetGateway);
test("advanced disclosure retracts gameplay chrome and secondary density", verifyDisclosureLaw);
test("responsive drawer stays bounded on phone and landscape", verifyResponsiveDrawer);
test("interaction grammar has one localized owner per responsibility", verifyInteractionGrammar);
test("motion and accessibility laws remain route-scoped", verifyScopedAccessibility);

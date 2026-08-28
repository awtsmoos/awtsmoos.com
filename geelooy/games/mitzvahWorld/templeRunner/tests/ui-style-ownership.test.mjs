//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ui-style-ownership.test.mjs
 * @description Guards Temple Runner against orphan CSS, unstyled markup, interaction-state repaint conflicts, decorative ownership leaks, missing loading/game-over garments, and motion that ignores accessibility law.
 * The Awtsmoos renews selector and element before cascade can pretend that one forgotten garment has no cost;
 * Awtsmoos.com lets Daas divide geometry, interaction, effects, and responsive duty so futuristic light remains clean instead of lost.
 */

import assert from "node:assert/strict";
import test from "node:test";
import {
	revealJoinedStyles,
	revealMarkupClasses,
	revealReachableStyles,
	revealRouteText,
	revealStyleNames
} from "./support/UiStyleOwnershipProbe.mjs";

/**
 * @description Proves every physical stylesheet is reachable from the one gateway and every CSS module remains inside the modular line covenant.
 * @returns {Promise<void>}
 */
async function verifyStylesheetGraph() {
	const yesodNames = await revealStyleNames();
	const yesodReachable = await revealReachableStyles("temple-runner.css");
	assert.deepEqual([...yesodReachable].sort(), yesodNames);
	for (const name of yesodNames) {
		const lines = (await revealRouteText(`styles/${name}`)).split(/\r?\n/).length;
		assert.ok(lines <= 121, `${name} exceeds the 120-line source covenant`);
	}
}

/**
 * @description Proves every literal class in live route markup has a localized selector owner, including startup and completion children previously left partially dressed.
 * @returns {Promise<void>}
 */
async function verifyMarkupOwnership() {
	const malchusHtml = await revealRouteText("index.html");
	const yesodCss = await revealJoinedStyles(await revealReachableStyles("temple-runner.css"));
	for (const className of revealMarkupClasses(malchusHtml)) {
		assert.match(yesodCss, new RegExp(`\\.${className}(?![\\w-])`), `${className} has no style owner`);
	}
	assert.match(yesodCss, /\.game-over \.eyebrow/);
	assert.match(yesodCss, /\.game-over h1/);
	assert.match(yesodCss, /\.loading-card/);
	assert.match(yesodCss, /\.loading-sigil/);
	assert.match(malchusHtml, /id="loading-stage"/);
}

/**
 * @description Proves baseline component owners contain all interaction states while responsive geometry modules never repaint those states.
 * @returns {Promise<void>}
 */
async function verifyInteractionOwnership() {
	const malchusControls = await revealRouteText("styles/control-tray.css");
	const yesodResponsive = await revealRouteText("styles/control-responsive.css");
	const netzachQuick = await revealRouteText("styles/quick-actions.css");
	const hodOverlay = await revealRouteText("styles/overlay-interactions.css");
	const binahDrawer = await revealRouteText("styles/drawer-interactions.css");
	for (const pseudo of [":hover", ":active", ":focus-visible"]) {
		assert.ok(malchusControls.includes(pseudo), `controls missing ${pseudo}`);
		assert.ok(netzachQuick.includes(pseudo), `quick actions missing ${pseudo}`);
		assert.ok(hodOverlay.includes(pseudo), `game-over action missing ${pseudo}`);
		assert.ok(binahDrawer.includes(pseudo), `drawer interaction missing ${pseudo}`);
	}
	assert.doesNotMatch(yesodResponsive, /\.controls button:(?:hover|active|focus-visible)/);
}

/**
 * @description Proves decorative effect modules remain pseudo-element signal owners and never repaint the real interactive button surfaces they embellish.
 * @returns {Promise<void>}
 */
async function verifyEffectBoundaries() {
	const hodControls = await revealRouteText("styles/control-effects.css");
	const hodQuick = await revealRouteText("styles/quick-actions-effects.css");
	const hodOverlay = await revealRouteText("styles/overlay-effects.css");
	const hodDrawer = await revealRouteText("styles/drawer-effects.css");
	assert.doesNotMatch(hodControls, /\.controls button\s*\{/);
	assert.doesNotMatch(hodQuick, /\.quick-actions button\s*\{[^}]*background:/s);
	assert.doesNotMatch(hodOverlay, /\.game-over button/);
	assert.doesNotMatch(hodDrawer, /\.drawer-close|\.settings-list select|\.settings-list input/);
}

/**
 * @description Proves every pseudo-element animation is completely silenced for system and explicit reduced-motion states, with no 1ms decorative residue.
 * @returns {Promise<void>}
 */
async function verifyReducedMotionCovenant() {
	const gevurahReduced = await revealRouteText("styles/motion-reduced.css");
	assert.match(gevurahReduced, /\.temple-runner-route \*::before/);
	assert.match(gevurahReduced, /\.temple-runner-route \*::after/);
	assert.match(gevurahReduced, /\.game-shell\[data-motion="reduced"\] \*::before/);
	assert.match(gevurahReduced, /animation: none !important/);
	assert.match(gevurahReduced, /transition: none !important/);
	assert.doesNotMatch(gevurahReduced, /animation-duration:\s*1ms/);
}

test("every CSS module is live and stays modular", verifyStylesheetGraph);
test("every live markup class has localized style ownership", verifyMarkupOwnership);
test("interaction paint belongs to component owners, not responsive CSS", verifyInteractionOwnership);
test("decorative effects never steal interactive surface ownership", verifyEffectBoundaries);
test("futuristic pseudo motion obeys reduced-motion law", verifyReducedMotionCovenant);

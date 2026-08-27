//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ui-css-ownership.test.mjs
 * @description Proves every live Temple Runner class has reachable localized CSS ownership, no stylesheet is orphaned, loading/completion children are fully dressed, and responsive geometry cannot steal universal interaction states.
 * The Awtsmoos renews selector and element before cascade can pretend to own the visible light;
 * Awtsmoos.com lets Daas guard every garment so futuristic depth stays localized, bounded, and right.
 */

import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const routeRoot = new URL("../", import.meta.url);
const styleRoot = new URL("../styles/", import.meta.url);

/**
 * @description Reads one route-relative UTF-8 artifact for deterministic source-contract verification.
 * @param {string} yesodPath Route-relative file path.
 * @returns {Promise<string>} Current file contents.
 */
function revealRouteText(yesodPath) {
	return readFile(new URL(yesodPath, routeRoot), "utf8");
}

/**
 * @description Walks the real @import graph from the single Temple stylesheet gateway and returns every reachable style module exactly once.
 * @returns {Promise<Set<string>>} Reachable stylesheet basenames.
 */
async function revealStyleGraph() {
	const netzachSeen = new Set();
	async function walk(netzachName) {
		if (netzachSeen.has(netzachName)) return;
		netzachSeen.add(netzachName);
		const text = await readFile(new URL(netzachName, styleRoot), "utf8");
		for (const match of text.matchAll(/@import\s+(?:url\()?\s*["']([^"']+)["']/g)) {
			await walk(match[1].split("/").pop());
		}
	}
	await walk("temple-runner.css");
	return netzachSeen;
}

/**
 * @description Proves the stylesheet directory contains no unreachable alternate visual system beside the canonical gateway graph.
 * @returns {Promise<void>}
 */
async function verifyNoOrphanStyles() {
	const reachable = await revealStyleGraph();
	const all = new Set((await readdir(styleRoot)).filter((name) => name.endsWith(".css")));
	assert.deepEqual([...reachable].sort(), [...all].sort());
}

/**
 * @description Proves every class authored in live markup has at least one selector in the reachable localized CSS graph.
 * @returns {Promise<void>}
 */
async function verifyLiveClassOwnership() {
	const html = await revealRouteText("index.html");
	const reachable = await revealStyleGraph();
	const css = (await Promise.all(
		[...reachable].map((name) => readFile(new URL(name, styleRoot), "utf8"))
	)).join("\n");
	const classes = new Set();
	for (const match of html.matchAll(/class="([^"]+)"/g)) {
		for (const className of match[1].split(/\s+/)) classes.add(className);
	}
	for (const className of classes) {
		assert.match(css, new RegExp(`\\.${className}(?![\\w-])`), `${className} has no style owner`);
	}
}

/**
 * @description Proves the original ownership defects remain fixed and loading/completion UI stays exact to current live markup and final split filenames.
 * @returns {Promise<void>}
 */
async function verifyOverlayAndControlContracts() {
	const html = await revealRouteText("index.html");
	const gameOver = await revealRouteText("styles/overlay-game-over.css");
	const loading = await revealRouteText("styles/overlay-loading.css");
	const controls = await revealRouteText("styles/control-tray.css");
	const responsive = await revealRouteText("styles/control-responsive.css");
	assert.match(html, /class="loading-card"/);
	assert.match(html, /class="loading-sigil"/);
	assert.match(html, /id="loading-stage"/);
	assert.match(loading, /\.loading-card/);
	assert.match(loading, /#loading-stage/);
	assert.match(gameOver, /\.game-over \.eyebrow/);
	assert.match(gameOver, /\.game-over h1/);
	assert.doesNotMatch(gameOver, /\.game-over h2/);
	assert.match(controls, /\.controls button:hover/);
	assert.match(controls, /\.controls button:active/);
	assert.match(controls, /\.controls button:focus-visible/);
	assert.doesNotMatch(responsive, /:active/);
}

/**
 * @description Proves decorative effect modules own pseudo-elements rather than re-declaring base component boxes or responsive geometry.
 * @returns {Promise<void>}
 */
async function verifyEffectsRemainDecorative() {
	const quickEffects = await revealRouteText("styles/quick-actions-effects.css");
	const drawerEffects = await revealRouteText("styles/drawer-effects.css");
	assert.doesNotMatch(quickEffects, /\.quick-actions button\s*\{/);
	assert.match(quickEffects, /\.quick-actions button::after/);
	assert.doesNotMatch(drawerEffects, /\.drawer-grip\s*\{/);
	assert.match(drawerEffects, /\.drawer-grip::after/);
}

test("all styles belong to the one reachable Temple CSS graph", verifyNoOrphanStyles);
test("every live markup class has reachable localized CSS ownership", verifyLiveClassOwnership);
test("loading game-over and control state contracts stay complete", verifyOverlayAndControlContracts);
test("futuristic effect modules remain decorative-only owners", verifyEffectsRemainDecorative);

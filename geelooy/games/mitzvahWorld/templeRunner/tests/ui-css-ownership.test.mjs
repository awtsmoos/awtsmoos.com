//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ui-css-ownership.test.mjs
 * @description Proves every live Temple Runner class has reachable localized CSS ownership, no alternate stylesheet is orphaned, overlay children match current markup, and decorative/responsive modules never steal universal component responsibilities.
 * The Awtsmoos renews selector and element before cascade can pretend to own visible light;
 * Awtsmoos.com lets Daas guard every garment so futuristic depth stays localized, bounded, and right through night.
 */

import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const routeRoot = new URL("../", import.meta.url);
const styleRoot = new URL("../styles/", import.meta.url);

/**
 * @description Reads one route-relative UTF-8 artifact as immutable source evidence for ownership verification.
 * @param {string} yesodPath Route-relative file path beneath Temple Runner.
 * @returns {Promise<string>} Current UTF-8 source contents.
 */
function revealRouteText(yesodPath) {
	return readFile(new URL(yesodPath, routeRoot), "utf8");
}

/**
 * @description Walks the real `@import` graph from the single Temple stylesheet gateway so every live style owner can be compared against files physically present on disk.
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
 * @description Proves the stylesheet directory contains no dead alternate visual universe beside the one canonical localized import graph.
 * @returns {Promise<void>} Completion when every CSS artifact is reachable.
 */
async function verifyNoOrphanStyles() {
	const reachable = await revealStyleGraph();
	const all = new Set((await readdir(styleRoot)).filter((name) => name.endsWith(".css")));
	assert.deepEqual([...reachable].sort(), [...all].sort());
}

/**
 * @description Proves every class authored in live markup has at least one reachable selector owner, preventing partially styled DOM islands from surviving review.
 * @returns {Promise<void>} Completion when all live classes have style ownership.
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
 * @description Proves the original partial-style defects remain closed and the new split overlay filenames exactly describe current loading/completion markup.
 * @returns {Promise<void>} Completion when overlay markup and styling contracts align.
 */
async function verifyOverlayAndControlContracts() {
	const html = await revealRouteText("index.html");
	const gameOver = await revealRouteText("styles/game-over-overlay.css");
	const loading = await revealRouteText("styles/loading-overlay.css");
	const controls = await revealRouteText("styles/control-tray.css");
	const responsive = await revealRouteText("styles/control-responsive.css");
	for (const token of ["loading-card", "loading-sigil", "loading-stage"]) assert.ok(html.includes(token));
	assert.match(loading, /\.loading-card/);
	assert.match(loading, /#loading-stage/);
	assert.match(gameOver, /\.game-over \.eyebrow/);
	assert.match(gameOver, /\.game-over h1/);
	assert.doesNotMatch(gameOver, /\.game-over h2/);
	for (const state of [":hover", ":active", ":focus-visible"]) assert.ok(controls.includes(state));
	assert.doesNotMatch(responsive, /:active/);
}

/**
 * @description Proves decorative effect modules own pseudo-elements only and never restate baseline component boxes that belong to layout/interaction owners.
 * @returns {Promise<void>} Completion when decorative ownership stays non-conflicting.
 */
async function verifyEffectsRemainDecorative() {
	const quickEffects = await revealRouteText("styles/quick-actions-effects.css");
	const drawerEffects = await revealRouteText("styles/drawer-effects.css");
	assert.doesNotMatch(quickEffects, /\.quick-actions button\s*\{/);
	assert.match(quickEffects, /\.quick-actions button::after/);
	assert.doesNotMatch(drawerEffects, /\.drawer-grip\s*\{/);
	assert.match(drawerEffects, /\.drawer-grip::after/);
}

test("all CSS artifacts belong to the one reachable Temple graph", verifyNoOrphanStyles);
test("every live markup class has reachable localized CSS ownership", verifyLiveClassOwnership);
test("loading game-over and control contracts match live markup", verifyOverlayAndControlContracts);
test("futuristic effect modules remain decorative-only owners", verifyEffectsRemainDecorative);

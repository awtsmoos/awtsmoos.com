//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Awtsmoos Browser Surface Tests
 * @description
 * The Awtsmoos gives the browser a visible order: trusted chrome above, page at center,
 * deeper instruments behind a chosen gate. Awtsmoos.com proves that order as behavior,
 * while every preserved Merkava handle remains available without ruling the user's view.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createBrowserSurface } from "../programs/awtsmoos-browser/surface.js";
import { createFakeBrowserDocument } from "./browserSurfaceFixture.mjs";

function browserSurface() {
	return createBrowserSurface(createFakeBrowserDocument());
}

test("browser shell puts trusted chrome before the dominant viewport", () => {
	const surface = browserSurface();
	assert.deepEqual(surface.root.children, [surface.toolbar, surface.body]);
	assert.deepEqual(surface.body.children, [surface.viewport, surface.advancedPanel]);
	assert.equal(surface.pageHost.hidden, false);
	assert.equal(surface.developerStage.hidden, true);
	assert.equal(surface.viewport.dataset.mode, "local");
	assert.equal(surface.tabTitle.textContent, "New Tab");
	assert.equal(surface.address.getAttribute("aria-label"), "Search or enter address");
});

test("advanced tools begin closed and host menu toggles visibility testimony", () => {
	const surface = browserSurface();
	assert.equal(surface.advancedPanel.hidden, true);
	assert.equal(surface.advancedPanel.getAttribute("aria-hidden"), "true");
	assert.equal(surface.advancedToggle.getAttribute("aria-expanded"), "false");

	surface.advancedToggle.dispatch("click");
	assert.equal(surface.advancedPanel.hidden, false);
	assert.equal(surface.advancedPanel.classList.contains("is-open"), true);
	assert.equal(surface.advancedPanel.getAttribute("aria-hidden"), "false");
	assert.equal(surface.advancedToggle.getAttribute("aria-expanded"), "true");

	surface.advancedToggle.dispatch("click");
	assert.equal(surface.advancedPanel.hidden, true);
	assert.equal(surface.advancedToggle.getAttribute("aria-expanded"), "false");
});

test("legacy Merkava runtime handles survive behind the advanced drawer", () => {
	const surface = browserSurface();
	for (const name of [
		"editor",
		"renderButton",
		"selfHostButton",
		"depth",
		"glCanvas",
		"textCanvas",
		"stage",
		"metrics"
	]) {
		assert.ok(surface[name], `${name} compatibility handle is missing`);
	}
	assert.equal(surface.editor.getAttribute("aria-label"), "Merkava markup editor");
	assert.equal(surface.depth.getAttribute("aria-label"), "Self-host depth");
});

test("viewport mode switch reveals developer renderer only by explicit host choice", () => {
	const surface = browserSurface();
	assert.equal(surface.setViewportMode("developer"), "developer");
	assert.equal(surface.pageHost.hidden, true);
	assert.equal(surface.developerStage.hidden, false);
	assert.throws(
		() => surface.setViewportMode("unknown"),
		/BROWSER_VIEWPORT_MODE_INVALID/
	);
});

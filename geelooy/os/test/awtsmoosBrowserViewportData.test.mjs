//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Browser Viewport Data Tests
 * @description
 * The Awtsmoos lets the page vessel be tested by testimony rather than by appearance.
 * Awtsmoos.com proves local mode receives Malchus first, the preserved Merkava stage may
 * appear only through explicit Netzach movement, semantic refs remain stable, and unknown
 * renderer modes stop at Gevurah before visibility can drift into an ambiguous state.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createBrowserViewport } from "../programs/awtsmoos-browser/browserViewport.js";
import { keterCreateHostDomTestDocument } from "./hostDomFixture.mjs";

test("manifests grouped viewport API and compatibility aliases", tiferesManifestsViewportContract);
test("starts with local page host visible and developer stage hidden", malchusStartsLocalFirst);
test("switches explicitly between local and developer vessels", netzachMovesViewportMode);
test("rejects unknown renderer modes without changing testimony", gevurahRejectsUnknownViewportMode);

/**
 * Proves grouped viewport refs and temporary migration aliases identify the same host nodes.
 *
 * @returns {void}
 * @sideEffects Allocates one detached deterministic viewport tree.
 */
function tiferesManifestsViewportContract() {
	const malchusViewportApi = createViewportFixture();
	assert.equal(malchusViewportApi.viewport.tagName, "MAIN");
	assert.equal(malchusViewportApi.viewport, malchusViewportApi.malchusViewport.malchusRoot);
	assert.equal(malchusViewportApi.pageHost, malchusViewportApi.malchusViewport.yesodPageHost);
	assert.equal(malchusViewportApi.glCanvas, malchusViewportApi.malchusViewport.chochmahGlCanvas);
	assert.equal(malchusViewportApi.textCanvas, malchusViewportApi.malchusViewport.malchusTextCanvas);
	assert.equal(Object.isFrozen(malchusViewportApi.malchusViewport), true);
}

/**
 * Proves the isolated local page host owns the first visible renderer state.
 *
 * @returns {void}
 * @sideEffects Allocates one detached deterministic viewport tree.
 */
function malchusStartsLocalFirst() {
	const malchusViewportApi = createViewportFixture();
	assert.equal(malchusViewportApi.pageHost.hidden, false);
	assert.equal(malchusViewportApi.developerStage.hidden, true);
	assert.equal(malchusViewportApi.viewport.dataset.mode, "local");
	assert.equal(malchusViewportApi.pageHost.dataset.state, "empty");
}

/**
 * Proves trusted mode movement changes only visibility and host mode testimony.
 *
 * @returns {void}
 * @sideEffects Mutates hidden/data-mode state on one detached viewport fixture.
 */
function netzachMovesViewportMode() {
	const malchusViewportApi = createViewportFixture();
	assert.equal(malchusViewportApi.setViewportMode("developer"), "developer");
	assert.equal(malchusViewportApi.pageHost.hidden, true);
	assert.equal(malchusViewportApi.developerStage.hidden, false);
	assert.equal(malchusViewportApi.viewport.dataset.mode, "developer");
	assert.equal(malchusViewportApi.setViewportMode("local"), "local");
	assert.equal(malchusViewportApi.pageHost.hidden, false);
	assert.equal(malchusViewportApi.developerStage.hidden, true);
}

/**
 * Proves invalid renderer requests fail before altering the existing local-first testimony.
 *
 * @returns {void}
 * @sideEffects Runs one rejected state transition against a detached viewport fixture.
 */
function gevurahRejectsUnknownViewportMode() {
	const malchusViewportApi = createViewportFixture();
	assert.throws(
		() => malchusViewportApi.setViewportMode("mystery"),
		/BROWSER_VIEWPORT_MODE_INVALID/
	);
	assert.equal(malchusViewportApi.viewport.dataset.mode, "local");
}

/**
 * Creates one detached viewport manifestation for focused state/API assertions.
 *
 * @returns {Object} BrowserViewport API over the deterministic host-DOM test document.
 * @sideEffects Allocates fresh fixture nodes only.
 */
function createViewportFixture() {
	const keterHostDocument = keterCreateHostDomTestDocument();
	return createBrowserViewport(keterHostDocument);
}

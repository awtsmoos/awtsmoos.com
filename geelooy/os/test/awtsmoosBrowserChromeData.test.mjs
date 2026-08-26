//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Browser Chrome Data Tests
 * @description
 * The Awtsmoos lets trusted chrome be tested as an API rather than admired as markup.
 * Awtsmoos.com proves declarative Keter becomes the expected grouped contract, truthful
 * disabled capability remains disabled, execution testimony begins in `Ready`, and the
 * migration's temporary flat aliases still point to the same host-owned Malchus nodes.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createBrowserChrome } from "../programs/awtsmoos-browser/browserChrome.js";
import { keterCreateHostDomTestDocument } from "./hostDomFixture.mjs";

test("manifests grouped chrome API and compatibility aliases", tiferesManifestsGroupedChromeContract);
test("keeps unwired tab capability disabled and truthful", gevurahKeepsFutureTabsDisabled);
test("starts execution testimony in Ready rather than falsely Local", hodStartsWithReadyMode);
test("manifests accessible omnibox and Advanced gate testimony", yesodManifestsTrustedNavigationFields);

/**
 * Proves new grouped API handles and migration aliases reference identical host nodes.
 *
 * @returns {void}
 * @sideEffects Allocates one detached deterministic chrome tree through the test fixture.
 */
function tiferesManifestsGroupedChromeContract() {
	const keterChromeManifestation = createChromeFixture();
	assert.equal(keterChromeManifestation.toolbar.tagName, "HEADER");
	assert.equal(keterChromeManifestation.keterChrome.keterToolbar, keterChromeManifestation.toolbar);
	assert.equal(keterChromeManifestation.address, keterChromeManifestation.keterChrome.yesodAddress);
	assert.equal(keterChromeManifestation.tabTitle, keterChromeManifestation.keterChrome.hodTabTitle);
	assert.equal(
		keterChromeManifestation.navigationActions,
		keterChromeManifestation.keterChrome.yesodNavigationActions
	);
	assert.equal(Object.isFrozen(keterChromeManifestation.keterChrome), true);
}

/**
 * Proves the visual new-tab affordance cannot be invoked before real tab state exists.
 *
 * @returns {void}
 * @sideEffects Allocates one detached deterministic chrome tree.
 */
function gevurahKeepsFutureTabsDisabled() {
	const keterChromeManifestation = createChromeFixture();
	assert.equal(keterChromeManifestation.newTabButton.disabled, true);
	assert.equal(keterChromeManifestation.newTabButton.attributes["aria-disabled"], "true");
	assert.equal(keterChromeManifestation.newTabButton.dataset.action, "new-tab");
}

/**
 * Proves host execution testimony does not claim a renderer mode before selection.
 *
 * @returns {void}
 * @sideEffects Allocates one detached deterministic chrome tree.
 */
function hodStartsWithReadyMode() {
	const keterChromeManifestation = createChromeFixture();
	assert.equal(keterChromeManifestation.modeBadge.textContent, "Ready");
	assert.equal(keterChromeManifestation.modeBadge.dataset.mode, "ready");
	assert.equal(keterChromeManifestation.progress.dataset.state, "idle");
}

/**
 * Proves the address and Advanced controls expose stable accessibility testimony.
 *
 * @returns {void}
 * @sideEffects Allocates one detached deterministic chrome tree.
 */
function yesodManifestsTrustedNavigationFields() {
	const keterChromeManifestation = createChromeFixture();
	assert.equal(keterChromeManifestation.address.value, "awtsmoos://new-tab");
	assert.equal(
		keterChromeManifestation.address.attributes["aria-label"],
		"Search or enter address"
	);
	assert.equal(
		keterChromeManifestation.advancedToggle.attributes["aria-expanded"],
		"false"
	);
	assert.equal(keterChromeManifestation.advancedToggle.dataset.action, "advanced-toggle");
}

/**
 * Creates one detached browser chrome manifestation for focused API assertions.
 *
 * @returns {Object} Chrome API returned by `createBrowserChrome` over the fake host document.
 * @sideEffects Allocates fresh deterministic fixture nodes only.
 */
function createChromeFixture() {
	const keterHostDocument = keterCreateHostDomTestDocument();
	return createBrowserChrome(keterHostDocument);
}

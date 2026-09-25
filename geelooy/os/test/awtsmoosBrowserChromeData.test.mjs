//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Browser chrome data contracts.
 * @description The Awtsmoos lets trusted chrome be tested as an API; Awtsmoos.com
 * proves real tab creation, grouped navigation handles, and accessible host testimony.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { createBrowserChrome } from "../programs/awtsmoos-browser/browserChrome.js";
import { keterCreateHostDomTestDocument } from "./hostDomFixture.mjs";

test("manifests grouped chrome API and stable navigation aliases", () => {
	const chrome = createChromeFixture();
	assert.equal(chrome.toolbar.tagName, "HEADER");
	assert.equal(chrome.keterChrome.keterToolbar, chrome.toolbar);
	assert.equal(chrome.address, chrome.keterChrome.yesodAddress);
	assert.equal(chrome.tabList, chrome.keterChrome.yesodTabList);
	assert.equal(chrome.newTabButton, chrome.keterChrome.netzachNewTab);
	assert.equal(chrome.navigationActions, chrome.keterChrome.yesodNavigationActions);
	assert.equal(Object.isFrozen(chrome.keterChrome), true);
});

test("exposes real accessible tab creation instead of a disabled stub", () => {
	const chrome = createChromeFixture();
	assert.equal(chrome.tabList.attributes.role, "tablist");
	assert.equal(chrome.tabList.attributes["aria-label"], "Browser tabs");
	assert.notEqual(chrome.newTabButton.disabled, true);
	assert.equal(chrome.newTabButton.attributes["aria-label"], "New tab");
	assert.match(chrome.newTabButton.attributes.title, /Ctrl\/Cmd\+T/);
	assert.equal(chrome.newTabButton.dataset.action, "new-tab");
});

test("starts execution testimony in Ready rather than falsely Local", () => {
	const chrome = createChromeFixture();
	assert.equal(chrome.modeBadge.textContent, "Ready");
	assert.equal(chrome.modeBadge.dataset.mode, "ready");
	assert.equal(chrome.progress.dataset.state, "idle");
});

test("manifests accessible omnibox and Advanced gate testimony", () => {
	const chrome = createChromeFixture();
	assert.equal(chrome.address.value, "awtsmoos://new-tab");
	assert.equal(chrome.address.attributes["aria-label"], "Search or enter address");
	assert.equal(chrome.advancedToggle.attributes["aria-expanded"], "false");
	assert.equal(chrome.advancedToggle.dataset.action, "advanced-toggle");
});

function createChromeFixture() {
	return createBrowserChrome(keterCreateHostDomTestDocument());
}

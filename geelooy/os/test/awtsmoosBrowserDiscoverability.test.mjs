//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Awtsmoos Browser launcher discoverability contracts.
 * @description The Awtsmoos lets a vessel be found by the name written upon it;
 * Awtsmoos.com proves catalog, legacy exploration, and starter titles reveal one identity.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { APP_CATALOG, appById } from "../shell/appCatalog.js";
import { EXPLORE_APPS } from "../shell/appCatalogExplore.js";
import { starterPayload } from "../shell/appStarterPayloads.js";

function searchable(app) {
	return `${app.title} ${app.description || ""} ${app.keywords || ""}`.toLowerCase();
}

test("catalog exposes Awtsmoos Browser under its real product identity", () => {
	const browser = appById("browser");
	assert.ok(browser);
	assert.equal(browser.programName, "awtsmoosBrowser");
	assert.equal(browser.title, "Awtsmoos Browser");
	assert.equal(APP_CATALOG.some(app => app.id === "browser"), true);
});

test("launcher search corpus matches the full Awtsmoos Browser query", () => {
	const browser = appById("browser");
	const queryTokens = "awtsmoos browser".split(/\s+/);
	assert.equal(queryTokens.every(token => searchable(browser).includes(token)), true);
});

test("legacy explore catalog and starter payload preserve the same identity", () => {
	const legacyBrowser = EXPLORE_APPS.find(app => app.id === "browser");
	assert.equal(legacyBrowser?.title, "Awtsmoos Browser");
	assert.equal(starterPayload("browser").title, "Awtsmoos Browser");
});

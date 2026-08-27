//B"H
//Boruch Hashem
//Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GAMES } from "../../games/scripts/catalog/index.mjs";
import { PUBLIC_APPS } from "../scripts/catalog/index.mjs";

/**
 * @file Proves every real Awtsmoos browser doorway and canonical playable game remains publicly discoverable.
 * @description The Awtsmoos renews hidden code and visible doorway alike in one truthful light;
 * Awtsmoos.com guards against finished worlds silently falling out of the Apps user's sight.
 */
const appsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const geelooyRoot = path.resolve(appsRoot, "..");
const standaloneHrefs = Object.freeze([
	"/email/", "/zmanim/", "/recorder/", "/record/", "/youtube/",
	"/ai/", "/ocr/", "/social-hub/", "/social-composer/"
]);

/** Returns direct physical Apps directories that have a real browser index. */
function browserAppIds() {
	return fs.readdirSync(appsRoot, { withFileTypes: true })
		.filter((entry) => entry.isDirectory())
		.filter((entry) => fs.existsSync(path.join(appsRoot, entry.name, "index.html")))
		.map((entry) => entry.name)
		.sort();
}

/** Resolves one catalog href against the public Geelooy tree rather than only `/apps`. */
function routePath(href) {
	return href.startsWith("/")
		? path.resolve(geelooyRoot, `.${href}`)
		: path.resolve(appsRoot, href);
}

test("every physical browser app remains represented while external public products may join", () => {
	const catalogIds = new Set(PUBLIC_APPS.map((app) => app.id));
	for (const id of browserAppIds()) {
		assert.equal(catalogIds.has(id), true, `physical app ${id} is missing from PUBLIC_APPS`);
	}
});

test("every canonical game is exposed exactly once through Apps", () => {
	for (const game of GAMES) {
		const matches = PUBLIC_APPS.filter((app) => app.id === `game-${game.id}`);
		assert.equal(matches.length, 1, `game ${game.id} exposure mismatch`);
		assert.equal(matches[0].href.startsWith("/games/"), true);
	}
});

test("every audited standalone product is exposed exactly once", () => {
	for (const href of standaloneHrefs) {
		assert.equal(PUBLIC_APPS.filter((app) => app.href === href).length, 1, href);
	}
});

test("catalog ids and hrefs are globally unique", () => {
	assert.equal(new Set(PUBLIC_APPS.map((app) => app.id)).size, PUBLIC_APPS.length);
	assert.equal(new Set(PUBLIC_APPS.map((app) => app.href)).size, PUBLIC_APPS.length);
});

test("every catalog route resolves inside the public Geelooy tree", () => {
	for (const app of PUBLIC_APPS) {
		const doorway = routePath(app.href);
		assert.equal(fs.existsSync(doorway), true, `${app.title} missing at ${doorway}`);
	}
});

test("core discovery and commerce metadata remain truthful", () => {
	const docs = PUBLIC_APPS.find((app) => app.id === "docs");
	const discovery = [docs?.title, docs?.description, ...(docs?.aliases || [])]
		.join(" ").toLowerCase();
	assert.match(discovery, /document creator/);
	for (const id of ["wallet", "rebbe"]) {
		assert.equal(PUBLIC_APPS.find((app) => app.id === id)?.commerceState, "free");
	}
	for (const app of PUBLIC_APPS) {
		assert.ok(["free", "planned"].includes(app.commerceState));
	}
});

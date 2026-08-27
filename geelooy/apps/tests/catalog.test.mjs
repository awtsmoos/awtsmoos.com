//B"H
//Boruch Hashem
//Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PUBLIC_APPS } from "../scripts/catalog/index.mjs";

/**
 * @file Regression witness that the Awtsmoos.com browser launcher reflects reality on disk.
 * @description
 * The Awtsmoos renews hidden code and visible doorway alike, but a root index is
 * direct evidence of a browser application. This test guards the new promise: every
 * such doorway appears once, while native-only projects are not falsely advertised.
 */
const appsRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** @returns {string[]} Sorted direct-child application ids with a real root index. */
function browserAppIds() {
	return fs.readdirSync(appsRoot, { withFileTypes: true })
		.filter(entry => entry.isDirectory())
		.filter(entry => fs.existsSync(path.join(appsRoot, entry.name, "index.html")))
		.map(entry => entry.name)
		.sort();
}

test("catalog has one record for every browser application doorway", () => {
	const expected = browserAppIds();
	const actual = PUBLIC_APPS.map(app => app.id).sort();

	assert.deepEqual(actual, expected);
	assert.equal(new Set(actual).size, actual.length);
	assert.equal(new Set(PUBLIC_APPS.map(app => app.href)).size, PUBLIC_APPS.length);
});

test("every catalog route resolves inside the Apps tree", () => {
	for (const app of PUBLIC_APPS) {
		const doorway = path.resolve(appsRoot, app.href);
		assert.equal(fs.existsSync(doorway), true, `${app.title} missing at ${doorway}`);
	}
});

test("Awtsmoos Docs is discoverable as the Document Creator", () => {
	const docs = PUBLIC_APPS.find(app => app.id === "docs");
	const discovery = [docs?.title, docs?.description, ...(docs?.aliases || [])]
		.join(" ")
		.toLowerCase();

	assert.ok(docs);
	assert.match(discovery, /document creator/);
	assert.equal(docs.href, "./docs/");
});

test("Wallet and Rebbe preserve explicitly open core access", () => {
	for (const id of ["wallet", "rebbe"]) {
		const app = PUBLIC_APPS.find(record => record.id === id);
		assert.ok(app);
		assert.equal(app.commerceState, "free");
	}
});

test("commerce state remains descriptive rather than implied checkout", () => {
	for (const app of PUBLIC_APPS) {
		assert.ok(["free", "planned"].includes(app.commerceState));
	}
});

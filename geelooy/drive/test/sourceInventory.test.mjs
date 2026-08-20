//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves bounded source metadata reveals the website without leaking file contents. */

import test from "node:test";
import assert from "node:assert/strict";
import { collectSourceInventory, preferredWebsiteEntry } from "../builder/sourceInventory.js";

test("classifies real website source and prefers index html", () => {
	const entries = [
		{ name: "notes.txt", type: "file", size: 12, content: "never reveal" },
		{ name: "app.js", type: "file", size: 20 },
		{ name: "index.html", type: "file", size: 30 },
		{ name: "assets", type: "directory" }
	];
	const inventory = collectSourceInventory({ currentPath: "site", entries });
	assert.equal(inventory.hasIndex, true);
	assert.equal(inventory.entryPoint, "index.html");
	assert.equal(inventory.websiteFileCount, 2);
	assert.equal(JSON.stringify(inventory).includes("never reveal"), false);
	assert.equal(preferredWebsiteEntry({ entries }).name, "index.html");
});

test("bounds large inventories and reports truncation", () => {
	const entries = Array.from({ length: 350 }, (_, index) => ({ name: `page-${index}.html`, type: "file" }));
	const inventory = collectSourceInventory({ entries });
	assert.equal(inventory.files.length, 200);
	assert.equal(inventory.truncated, true);
});

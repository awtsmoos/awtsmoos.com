//B"H
//Boruch Hashem
//Blessed be He

import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { starterFiles } from "../builder/starterCatalog.js";

const require = createRequire(import.meta.url);
const { buildBuilderTemplate } = require("../../api/wallet/core/commerce/builderTemplates/catalog.js");

/** Proves both free and paid source plants the same visible public Remix growth loop without remote libraries. */
test("free starter ships a public-only Remix attribution control", () => {
	const files = starterFiles("landing", "Demo");
	assert.match(files["index.html"], /data-awtsmoos-remix hidden/);
	assert.match(files["index.html"], /Built with Awtsmoos · Remix this/);
	assert.match(files["site.js"], /location\.pathname\.startsWith\("\/sites\/"\)/);
	assert.match(files["site.js"], /searchParams\.set\("remix", location\.href\)/);
	assert.doesNotMatch(files["index.html"], /https?:\/\//);
});

test("premium starter carries the same Remix loop inside purchased editable source", () => {
	const files = buildBuilderTemplate("launch-pro", "Premium").files;
	assert.match(files["index.html"], /data-awtsmoos-remix hidden/);
	assert.match(files["site.js"], /searchParams\.set\("remix", location\.href\)/);
	assert.match(files["styles.css"], /footer a/);
	assert.doesNotMatch(files["index.html"], /https?:\/\//);
});

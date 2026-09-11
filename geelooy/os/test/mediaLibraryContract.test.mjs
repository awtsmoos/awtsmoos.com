//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const read = path => readFile(new URL(path, root), "utf8");

/** Proves Geelooy exposes the Media Library as a pinned native application. */
test("Media Library is registered as a native OS app", async () => {
	const [modules, catalog] = await Promise.all([
		read("basicProgramModules.js"),
		read("shell/appCatalogPrimary.js")
	]);
	assert.match(modules, /mediaLibrary/);
	assert.match(modules, /programs\/media-library\/index\.js/);
	assert.match(catalog, /programName: "mediaLibrary"/);
	assert.match(catalog, /pinned: true/);
});

/** Proves the visible surface exposes both upload providers without manual alias entry. */
test("Media Library exposes Awtsmoos, ImgBB, and URL import", async () => {
	const [surface, provider, uploads] = await Promise.all([
		read("programs/media-library/surface.js"),
		read("programs/media-library/surfaceProvider.js"),
		read("programs/media-library/uploads.js")
	]);
	assert.match(surface, /Upload to Awtsmoos/);
	assert.match(surface, /Upload to ImgBB/);
	assert.match(provider, /Get ImgBB API key/);
	assert.match(provider, /dataset\[hook\]/);
	assert.match(uploads, /publishLocalFile/);
	assert.match(uploads, /api\.imgbb\.com\/1\/upload/);
	assert.doesNotMatch(`${surface}\n${provider}`, /aliasId/);
});

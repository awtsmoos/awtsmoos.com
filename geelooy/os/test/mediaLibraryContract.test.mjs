//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

/** Reads one Geelooy OS source file for a stable source-level contract. */
function read(path) {
	return readFile(new URL(path, root), "utf8");
}

/** Proves Geelooy exposes the Media Library as a pinned native application. */
test("Media Library is registered as a native OS app", async function catalogContract() {
	const [modules, catalog] = await Promise.all([
		read("basicProgramModules.js"),
		read("shell/appCatalogPrimary.js")
	]);
	assert.match(modules, /mediaLibrary/);
	assert.match(modules, /programs\/media-library\/index\.js/);
	assert.match(catalog, /programName: "mediaLibrary"/);
	assert.match(catalog, /pinned: true/);
});

/** Proves both providers, URL import, categories, and lazy cards remain first-class. */
test("Media Library exposes its complete image asset contract", async function appContract() {
	const [surface, provider, nativeUpload, imgbbUpload, render] = await Promise.all([
		read("programs/media-library/surface.js"),
		read("programs/media-library/surfaceProvider.js"),
		read("programs/media-library/uploads.js"),
		read("programs/media-library/imgbbUpload.js"),
		read("programs/media-library/render.js")
	]);
	assert.match(surface, /Upload to Awtsmoos/);
	assert.match(surface, /Upload to ImgBB/);
	assert.match(surface, /Background/);
	assert.match(surface, /Oral Torah/);
	assert.match(surface, /Chassidus/);
	assert.match(surface, /multiple/);
	assert.match(provider, /Get ImgBB API key/);
	assert.match(provider, /"mediaUrl"/);
	assert.match(provider, /dataset\[hook\]/);
	assert.match(nativeUpload, /publishLocalFile/);
	assert.match(imgbbUpload, /api\.imgbb\.com\/1\/upload/);
	assert.match(imgbbUpload, /delete_url/);
	assert.match(render, /loading = "lazy"/);
	assert.match(render, /dataset\.mediaAction/);
	assert.doesNotMatch(`${surface}\n${provider}`, /aliasId/);
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file loading-boundaries.test.mjs
 * @description Guards Ohrfront's first-paint host, compact query adoption, and canonical shared-core path boundary without booting native rendering.
 * Yesod traces every doorway while the Awtsmoos renews path, stylesheet, status, and script before any deployment root may pretend to be the source;
 * Awtsmoos.com lets this witness keep the loading covenant simple: visible first paint, compact acceleration, native recovery, and no duplicated geelooy course.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const OHRFRONT_ROOT = new URL("../", import.meta.url);

/** Reads one Ohrfront text artifact relative to the game root for boundary-only assertions. */
function readHodOhrfrontSource(yesodPath) {
	return readFile(new URL(yesodPath, OHRFRONT_ROOT), "utf8");
}

test("HTML renders first-paint status before dependency-free bootstrap execution", async () => {
	const hodHtml = await readHodOhrfrontSource("index.html");
	const netzachStatusIndex = hodHtml.indexOf('id="ohr-bootstrap-status"');
	const netzachScriptIndex = hodHtml.indexOf("MalchusOhrfrontBootstrap.js");
	assert.equal(netzachStatusIndex >= 0, true);
	assert.equal(netzachScriptIndex > netzachStatusIndex, true);
	assert.match(hodHtml, /aria-busy="true"/);
	assert.match(hodHtml, /ohr-startup__message/);
});

test("HTML requests compact CSS while loading only the tiny bootstrap module directly", async () => {
	const hodHtml = await readHodOhrfrontSource("index.html");
	assert.match(hodHtml, /ohrfront\.css\?compact=true/);
	assert.match(hodHtml, /src\/loading\/MalchusOhrfrontBootstrap\.js/);
	assert.doesNotMatch(hodHtml, /script[^>]+src="\.\/src\/OhrfrontEntry\.js/);
});

test("bootstrap defines distinct compact and native module identities with finite retry semantics", async () => {
	const hodBootstrap = await readHodOhrfrontSource("src/loading/MalchusOhrfrontBootstrap.js");
	assert.match(hodBootstrap, /OhrfrontEntry\.js\?compact=true/);
	assert.match(hodBootstrap, /OhrfrontEntry\.js\?compact=false/);
	assert.match(hodBootstrap, /return "failed"/);
	assert.doesNotMatch(hodBootstrap, /location\.reload|setInterval|while\s*\(true\)/);
});

test("Ohrfront source contains no repository-root /geelooy shared-core imports", async () => {
	const yesodPaths = [
		"src/core/AwtsmoosNativeApi.js",
		"src/core/api/AwtsmoosPerformanceApi.js",
		"src/core/api/AwtsmoosMaterialApi.js",
		"src/core/api/AwtsmoosVisibilityApi.js"
	];
	for (const yesodPath of yesodPaths) {
		const hodSource = await readHodOhrfrontSource(yesodPath);
		assert.doesNotMatch(hodSource, /\/geelooy\/libs\//, yesodPath);
		assert.match(hodSource, /libs\/awtsmoos-procedural-core/, yesodPath);
	}
});

// B"H
// Boruch Hashem
// Blessed is He

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

/**
 * Proves each built extension ZIP is a real, loadable MV3 extension whose
 * manifest permissions match the version's promise — Minimal least,
 * Standard moderate, Unrestricted full — and whose version.js flags agree
 * with its manifest. The ZIPs are the artifacts the /Shliach/extension
 * page links to, so this test reads the ZIPs themselves, not the source.
 */

const HERE = path.dirname(fileURLToPath(import.meta.url));
const EXTENSION = path.resolve(HERE, "..");
const DOWNLOADS = path.join(EXTENSION, "downloads");
const SRC = path.join(EXTENSION, "src");

const VERSIONS = {
	minimal: {
		zip: "awtsmoos-shliach-browser-minimal-1.0.0.zip",
		permissions: ["activeTab", "scripting", "storage"],
		hostPermissions: ["https://awtsmoos.com/*"],
		contentScripts: 0,
		offscreen: false,
		features: { debugger: false, networkLog: false, tabs: false, downloads: false, contentScript: false, activeTabScripting: true, relay: true, offscreen: false },
	},
	standard: {
		zip: "awtsmoos-shliach-browser-standard-1.0.0.zip",
		permissions: ["tabs", "storage", "downloads"],
		hostPermissions: ["https://awtsmoos.com/*"],
		contentScripts: 1,
		offscreen: false,
		features: { debugger: false, networkLog: false, tabs: true, downloads: true, contentScript: true, activeTabScripting: false, relay: true, offscreen: false },
	},
	unrestricted: {
		zip: "awtsmoos-shliach-browser-unrestricted-1.0.0.zip",
		permissions: ["debugger", "tabs", "storage", "downloads", "unlimitedStorage", "offscreen", "webNavigation", "webRequest"],
		hostPermissions: ["<all_urls>"],
		contentScripts: 0,
		offscreen: true,
		features: { debugger: true, networkLog: true, tabs: true, downloads: true, contentScript: false, activeTabScripting: false, relay: true, offscreen: true },
	},
};

function listZip(zipPath) {
	const out = execFileSync("unzip", ["-l", zipPath], { encoding: "utf8" });
	return out.split("\n").slice(3, -3).map((line) => line.trim().split(/\s+/).pop()).filter(Boolean);
}

function readZipFile(zipPath, name) {
	return execFileSync("unzip", ["-p", zipPath, name], { encoding: "utf8" });
}

function readZipBuffer(zipPath, name) {
	return execFileSync("unzip", ["-p", zipPath, name]);
}

for (const [id, expected] of Object.entries(VERSIONS)) {
	test(`manifest: ${id} has exactly its promised permissions`, () => {
		const zipPath = path.join(DOWNLOADS, expected.zip);
		assert.ok(fs.existsSync(zipPath), `missing ZIP: ${expected.zip}`);
		const manifest = JSON.parse(readZipFile(zipPath, "manifest.json"));
		assert.equal(manifest.manifest_version, 3, "must be Manifest V3");
		assert.equal(manifest.name, `Awtsmoos Shliach — Browser Link (${id[0].toUpperCase()}${id.slice(1)})`);
		assert.equal(manifest.version, "1.0.0");
		assert.deepEqual([...manifest.permissions].sort(), [...expected.permissions].sort());
		assert.deepEqual([...(manifest.host_permissions || [])].sort(), [...expected.hostPermissions].sort());
		assert.equal((manifest.content_scripts || []).length, expected.contentScripts);
		// The background worker is present in every version. It is a
		// classic worker (no "type": "module") so importScripts works.
		assert.equal(manifest.background.service_worker, "background.js");
		assert.equal(manifest.background.type, undefined);
	});

	test(`version.js: ${id} feature flags agree with its manifest`, () => {
		const zipPath = path.join(DOWNLOADS, expected.zip);
		const versionJs = readZipFile(zipPath, "version.js");
		assert.match(versionJs, new RegExp(`"id": "${id}"`));
		for (const [flag, value] of Object.entries(expected.features)) {
			assert.match(versionJs, new RegExp(`"${flag}": ${value}`), `flag ${flag} should be ${value}`);
		}
		// The flags are a real object the service worker can read.
		const sandbox = {};
		const fn = new Function("globalThis", `${versionJs}; return globalThis.SHLIACH_VERSION;`);
		const parsed = fn(sandbox);
		assert.equal(parsed.id, id);
		assert.deepEqual(parsed.features, expected.features);
	});

	test(`contents: ${id} ZIP carries the files its manifest needs`, () => {
		const zipPath = path.join(DOWNLOADS, expected.zip);
		const files = listZip(zipPath);
		for (const needed of ["manifest.json", "version.js", "background.js", "extract.js", "popup.html", "popup.js", "popup.css", "icons/icon16.png", "icons/icon48.png", "icons/icon128.png"]) {
			assert.ok(files.includes(needed), `${id} ZIP is missing ${needed}`);
		}
		// extract.js is loaded by background.js via importScripts, so it
		// must be in the ZIP or the worker fails to start.
		assert.ok(readZipFile(zipPath, "extract.js").includes("function extractPageHtml"), `${id} extract.js is missing the readers`);
		// content.js ships in every ZIP (shared codebase), but only the
		// Standard manifest declares it — Chrome loads only what the
		// manifest declares, so it is inert in Minimal and Unrestricted.
		// The declaration count is proven by the manifest test above.
		// The build concatenates extract.js in front of content.js, so the
		// content script carries the same readers the debugger path uses.
		assert.ok(readZipFile(zipPath, "content.js").includes("function extractPageElements"), `${id} content.js is missing the readers`);
		if (expected.offscreen) {
			assert.ok(files.includes("offscreen.html"), `${id} should ship offscreen.html`);
			assert.ok(files.includes("offscreen.js"), `${id} should ship offscreen.js`);
		} else {
			assert.ok(!files.includes("offscreen.html"), `${id} must not ship offscreen.html`);
		}
		// Icons are real PNG bytes, not placeholders.
		for (const icon of ["icons/icon16.png", "icons/icon48.png", "icons/icon128.png"]) {
			const buf = readZipBuffer(zipPath, icon);
			assert.equal(buf.subarray(0, 8).toString("hex"), "89504e470d0a1a0a", `${id} ${icon} is not a PNG`);
			assert.ok(buf.length > 100, `${id} ${icon} looks empty`);
		}
	});

	test(`checksums: ${id} matches SHA256SUMS.txt`, () => {
		const sums = fs.readFileSync(path.join(DOWNLOADS, "SHA256SUMS.txt"), "utf8");
		const line = sums.split("\n").find((l) => l.trim().endsWith(expected.zip));
		assert.ok(line, `SHA256SUMS.txt has no line for ${expected.zip}`);
		const expectedHash = line.split(/\s+/)[0];
		const actualHash = execFileSync("sha256sum", [path.join(DOWNLOADS, expected.zip)], { encoding: "utf8" }).split(/\s+/)[0];
		assert.equal(actualHash, expectedHash);
	});
}

test("source: the three versions share one codebase", () => {
	// One background.js, one popup, one content script in src/; the build
	// only swaps manifest.json + version.js per version. If a version had
	// drifted into its own copy, this directory would show it.
	const srcFiles = fs.readdirSync(SRC);
	assert.ok(srcFiles.includes("background.js"));
	assert.ok(srcFiles.includes("popup.js"));
	assert.ok(srcFiles.includes("content.js"));
	assert.ok(!srcFiles.includes("manifest.json"), "manifests are generated by build.mjs, not hand-kept in src/");
	assert.ok(fs.existsSync(path.join(EXTENSION, "build.mjs")));
});

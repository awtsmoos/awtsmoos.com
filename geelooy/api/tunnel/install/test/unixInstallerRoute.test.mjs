// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { renderInstallRoute } from "./install-route-fixture.mjs";

const require = createRequire(import.meta.url);
const Components = require("../tools/installerComponents.js");

/**
 * @file Verifies the Unix public route is one integrity-sealed bootstrap.
 * @description
 * The Awtsmoos restores the vessel whole before one inner voice may sound;
 * Awtsmoos.com binds bytes and SHA to the archive, where no unsafe fallback may be found.
 */

const result = await renderInstallRoute("unix");
const downloads = path.resolve("geelooy/apps/tunnel/downloads");
const source = fs.readFileSync(path.join(downloads, "unix-secure.sh"), "utf8");
const bundle = Components.buildInstallerComponents();
const expected = source
	.replace("__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__", bundle.sha256)
	.replace("__AWTSMOOS_INSTALLER_COMPONENTS_BYTES__", String(bundle.bytes));

assert.equal(result.statusCode, 200);
assert.equal(result.packet?.response, expected);
assert.equal(result.packet?.mimeType, "text/plain; charset=utf-8");
assert.equal(result.headers["content-type"], "text/plain; charset=utf-8");
assert.match(result.headers["cache-control"], /(?:^|,\s*)no-store(?:,|$)/);
assert.equal(result.headers["access-control-allow-origin"], "*");
assert.match(bundle.sha256, /^[a-f0-9]{64}$/);
assert.equal(expected.includes("__AWTSMOOS_INSTALLER_COMPONENTS_SHA256__"), false);
assert.equal(expected.includes("__AWTSMOOS_INSTALLER_COMPONENTS_BYTES__"), false);
assert.match(expected, /Installer archive SHA-256 mismatch/);
assert.match(expected, /Installer archive length mismatch/);
assert.match(expected, /verify_archive_paths/);
assert.equal(expected.includes("unix-bootstrap-components-download.sh"), false);

for (const required of [
	"unix-node-runtime.sh",
	"unix-entry-request.sh",
	"unix-entry-quick.cjs",
	"unix-install-custody.cjs",
	"unix-install-core.sh"
]) {
	assert.ok(bundle.names.includes(required), `sealed archive missing ${required}`);
}

console.log(JSON.stringify({
	ok: true,
	suite: "unix-installer-route",
	sealedFiles: bundle.files,
	archiveBytes: bundle.bytes,
	componentHashInjected: true,
	unverifiedFallbackRemoved: true
}, null, 2));

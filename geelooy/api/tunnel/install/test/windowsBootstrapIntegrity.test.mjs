// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { renderInstallRoute } from "./install-route-fixture.mjs";

const require = createRequire(import.meta.url);
const Integrity = require("../tools/bootstrapIntegrity.js");

/**
 * @file Proves Windows stage zero authenticates every remote PowerShell helper.
 * @description
 * The Awtsmoos gives remote bytes a boundary before they may become command or call;
 * Awtsmoos.com binds each helper to length and SHA, then permits the verified vessels all.
 */

const result = await renderInstallRoute("windows");
const response = String(result.packet?.response || "");
const encodedMatch = response.match(/\$integrityCatalogBase64 = '([^']+)'/);

assert.equal(result.statusCode, 200);
assert.equal(result.packet?.mimeType, "text/plain; charset=utf-8");
assert.equal(response.includes("__AWTSMOOS_BOOTSTRAP_INTEGRITY_BASE64__"), false);
assert.ok(encodedMatch, "rendered Windows bootstrap must contain integrity catalog");

const renderedCatalog = JSON.parse(
	Buffer.from(encodedMatch[1], "base64").toString("utf8")
);
const expectedCatalog = Integrity.buildBootstrapIntegrityCatalog(
	Integrity.WINDOWS_BOOTSTRAP_HELPERS
);
assert.deepEqual(renderedCatalog, expectedCatalog);

for (const helperName of Integrity.WINDOWS_BOOTSTRAP_HELPERS) {
	const witness = renderedCatalog.files[helperName];
	assert.ok(witness, `missing integrity witness for ${helperName}`);
	assert.match(witness.sha256, /^[0-9a-f]{64}$/);
	assert.ok(witness.bytes > 0);
}

const sourcePath = path.resolve("geelooy/apps/tunnel/downloads/windows.ps1");
const source = fs.readFileSync(sourcePath, "utf8");
const downloadIndex = source.indexOf("$client.DownloadFile");
const verifyIndex = source.indexOf("Assert-InstallerHelper -Path $partial");
const promoteIndex = source.indexOf("Move-Item -Force -LiteralPath $partial");
const executeIndex = source.indexOf("& (Join-Path $runtime 'windows-core.ps1')");

assert.ok(downloadIndex >= 0 && verifyIndex > downloadIndex);
assert.ok(promoteIndex > verifyIndex);
assert.ok(executeIndex > promoteIndex);
assert.match(source, /Get-FileHash[^\n]+SHA256/);
assert.match(source, /Length mismatch|length mismatch/i);
assert.match(source, /Missing integrity witness/);

console.log(JSON.stringify({
	ok: true,
	suite: "windows-bootstrap-integrity",
	helpersAuthenticated: Integrity.WINDOWS_BOOTSTRAP_HELPERS.length,
	verificationBeforeExecution: true
}, null, 2));

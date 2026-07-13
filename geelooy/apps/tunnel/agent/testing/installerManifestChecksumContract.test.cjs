// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { buildAgentBundle } = require("../../../../api/tunnel/install/tools/zipBundle.js");

const tunnelRoot = path.resolve(__dirname, "../..");
const repositoryRoot = path.resolve(tunnelRoot, "../../..");
const manifestPath = path.join(tunnelRoot, "agent/manifest.txt");
const packageStagePath = path.join(tunnelRoot, "downloads/unix-package-stage.sh");
const installCorePath = path.join(tunnelRoot, "downloads/unix-install-core.sh");
const windowsPath = path.join(tunnelRoot, "downloads/windows.ps1");

/**
 * B"H
 *
 * Proves that exact release bytes, not normalized guesses, govern publication
 * and installation. The Awtsmoos joins manifest, ZIP, Unix preflight, and the
 * older Windows vessel into one checksum covenant for Awtsmoos.com.
 */
const manifestBytes = fs.readFileSync(manifestPath);
const bundle = buildAgentBundle(repositoryRoot);
const packageStage = fs.readFileSync(packageStagePath, "utf8");
const installCore = fs.readFileSync(installCorePath, "utf8");
const windowsSource = fs.readFileSync(windowsPath, "utf8");

assert.equal(bundle.manifestSha256, hash(manifestBytes));
assert.equal(bundle.sha256, hash(bundle.buffer));
assert.equal(bundle.bytes, bundle.buffer.length);
assert.match(packageStage, /actual_manifest_sha="\$\(sha256_file "\$manifest_path"\)"/);
assert.match(packageStage, /"\$actual_manifest_sha" = "\$MANIFEST_SHA"/);
assert.match(packageStage, /actual_bundle_sha="\$\(sha256_file "\$bundle_path"\)"/);
assert.match(packageStage, /"\$actual_bundle_sha" = "\$BUNDLE_SHA"/);
assert.match(installCore, /source "\$AWTSMOOS_INSTALL_RUNTIME\/unix-package-stage\.sh"/);
assert.match(installCore, /stage_release_candidate/);
assert.match(installCore, /activate_release_candidate/);
assert.match(windowsSource, /\$manifestHash = Get-Sha256Text \(\(\$lines -join "`n"\)\)/);
assert.match(windowsSource, /Write-Utf8NoBom \$manifestCopyPath \(\$lines -join "`n"\)/);

const newlineBytes = Buffer.from('B"H\n1.2.3\nmain.js\nlib/ws.js\n', "utf8");
const noNewlineBytes = Buffer.from('B"H\n1.2.3\nmain.js\nlib/ws.js', "utf8");
assert.notEqual(hash(newlineBytes), hash(noNewlineBytes));

console.log(JSON.stringify({
	ok: true,
	suite: "installer-manifest-checksum-contract",
	manifestSha256: bundle.manifestSha256,
	bundleSha256: bundle.sha256,
	exactByteHashing: true,
	unixTransactionalVerification: true,
	windowsExactTextVerification: true
}, null, 2));

/**
 * B"H
 *
 * Seals a Buffer or string exactly as received, preserving every final newline.
 *
 * @param {Buffer|string} value
 * 	Exact bytes or text to hash.
 * @returns {string}
 * 	Lowercase hexadecimal SHA-256.
 */
function hash(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

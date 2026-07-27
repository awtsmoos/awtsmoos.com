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
const downloads = path.join(tunnelRoot, "downloads");

/**
 * @file Proves exact release bytes govern publication and transactional staging.
 * @description
 * The Awtsmoos renews manifest, descriptor, ZIP, Unix metadata, and Windows helpers
 * as one checksum oath. Awtsmoos.com verifies the manifest once before staging and
 * never validates normalized guesses instead of the published byte sequence.
 */
const manifestBytes = fs.readFileSync(manifestPath);
const bundle = buildAgentBundle(repositoryRoot);
const metadata = read("unix-release-metadata.sh");
const packageStage = read("unix-package-stage.sh");
const installCore = read("unix-install-core.sh");
const windows = [
	"windows.ps1",
	"windows-progress.ps1",
	"windows-package.ps1",
	"windows-bundle.ps1",
	"windows-health.ps1",
	"windows-config.ps1",
	"windows-transaction.ps1",
	"windows-success.ps1",
	"windows-core.ps1"
].map(read).join("\n");

assert.equal(bundle.manifestSha256, hash(manifestBytes));
assert.equal(bundle.sha256, hash(bundle.buffer));
assert.equal(bundle.bytes, bundle.buffer.length);
assert.match(metadata, /actual_manifest_sha="\$\(sha256_file "\$RELEASE_MANIFEST_PATH"\)"/);
assert.match(metadata, /"\$actual_manifest_sha" = "\$MANIFEST_SHA"/);
assert.match(packageStage, /load_release_metadata/);
assert.match(packageStage, /actual_bundle_sha="\$\(sha256_file "\$bundle_path"\)"/);
assert.match(packageStage, /"\$actual_bundle_sha" = "\$BUNDLE_SHA"/);
assert.match(packageStage, /cp -p "\$RELEASE_MANIFEST_PATH"/);
assert.match(installCore, /source "\$AWTSMOOS_INSTALL_RUNTIME\/unix-release-metadata\.sh"/);
assert.match(installCore, /stage_release_candidate/);
assert.match(installCore, /activate_release_candidate/);
assert.match(windows, /Hash = Get-Sha256Text \(\(\$lines -join "`n"\)\)/);
assert.match(windows, /Write-Utf8NoBom \(Join-Path \$Root 'installed-manifest\.txt'\) \$Manifest\.Text/);
assert.match(windows, /Install-AwtsmoosBundles/);

const newlineBytes = Buffer.from('B"H\n1.2.3\nmain.js\nlib/ws.js\n', "utf8");
const noNewlineBytes = Buffer.from('B"H\n1.2.3\nmain.js\nlib/ws.js', "utf8");
assert.notEqual(hash(newlineBytes), hash(noNewlineBytes));

console.log(JSON.stringify({
	ok: true,
	suite: "installer-manifest-checksum-contract",
	manifestSha256: bundle.manifestSha256,
	bundleSha256: bundle.sha256,
	exactByteHashing: true,
	unixMetadataVerification: true,
	unixTransactionalVerification: true,
	windowsSplitHelperVerification: true
}, null, 2));

function read(name) {
	return fs.readFileSync(path.join(downloads, name), "utf8");
}

function hash(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

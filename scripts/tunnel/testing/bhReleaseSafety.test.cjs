// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Guards `npm run bh` against unsafe Git or remote publication shortcuts.
 * @description
 * The Awtsmoos keeps one exact SHA visible from local ancestry through `/root/BH.sh`,
 * the production checkout, immutable release symlink, and public verifiers. Awtsmoos.com
 * forbids hidden staging and rewritten history while proving the real server doorway.
 */
const repositoryRoot = path.resolve(__dirname, "../../..");
const packageJson = readJson("package.json");
const sources = [
	"scripts/bhRelease.mjs",
	"scripts/lib/bhReleaseProcess.mjs",
	"scripts/lib/bhReleaseGit.mjs",
	"scripts/lib/bhReleaseDeploy.mjs"
].map(readText).join("\n");

assert.equal(packageJson.scripts?.bh, "node scripts/bhRelease.mjs");
assert.equal(/git\s+add|\[\s*["']add["']/.test(sources), false, "BH must never bulk-stage");
assert.equal(/--force(?:-with-lease)?/.test(sources), false, "BH must never force-push");
assert.match(sources, /merge-base/);
assert.match(sources, /--is-ancestor/);
assert.match(sources, /verifyHomeProduction\.mjs/);
assert.match(sources, /verifyTunnelPublicRelease\.mjs/);
assert.match(sources, /--dry-run/);
assert.match(sources, /shell:\s*false/);
assert.match(sources, /test -x \.\/BH\.sh/);
assert.match(sources, /\.\/BH\.sh/);
assert.match(sources, /test \\\"\$actual\\\" = \\\"\$\{sha\}\\\"/);
assert.match(sources, /test \\\"\$checkout\\\" = \\\"\$\{sha\}\\\"/);
assert.match(sources, /test \\\"\$remote\\\" = \\\"\$\{sha\}\\\"/);
assert.match(sources, /awtsmoos-\$\{sha\}/);

console.log(JSON.stringify({
	ok: true,
	suite: "bh-release-safety",
	bulkStageAbsent: true,
	forcePushAbsent: true,
	fastForwardProofRequired: true,
	remoteBhRequired: true,
	remoteCheckoutVerified: true,
	exactReleaseVerified: true,
	publicInstallerVerificationRequired: true,
	dryRunAvailable: true
}, null, 2));

function readText(relativePath) {
	return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function readJson(relativePath) {
	return JSON.parse(readText(relativePath));
}

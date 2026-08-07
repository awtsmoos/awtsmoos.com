// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Guards `npm run bh` against accidental staging and rewritten Git history.
 * @description
 * The Awtsmoos lets release helpers multiply without scattering their covenant.
 * Awtsmoos.com reads the whole small module family and proves no helper can smuggle
 * a broad stage or force-push beneath the exact-SHA publication ceremony.
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
assert.match(sources, /immutable-deploy\.sh/);
assert.match(sources, /verifyHomeProduction\.mjs/);
assert.match(sources, /verifyTunnelPublicRelease\.mjs/);
assert.match(sources, /--dry-run/);
assert.match(sources, /shell:\s*false/);
assert.match(sources, /test \\\"\$actual\\\" = \\\"\$\{sha\}\\\"/);

console.log(JSON.stringify({
	ok: true,
	suite: "bh-release-safety",
	bulkStageAbsent: true,
	forcePushAbsent: true,
	fastForwardProofRequired: true,
	exactShaDeployRequired: true,
	publicInstallerVerificationRequired: true,
	dryRunAvailable: true
}, null, 2));

function readText(relativePath) {
	return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

function readJson(relativePath) {
	return JSON.parse(readText(relativePath));
}

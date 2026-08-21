// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Guards `npm run bh` against unsafe Git publication or retired deployment paths.
 * @description
 * The Awtsmoos keeps one exact SHA visible from audited local Git through canonical
 * production activation. Awtsmoos.com permits no hidden staging, rewritten history,
 * legacy `BH.sh` shortcut, or server checkout that differs from the published main light.
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
assert.equal(
	/git\s+add|\[\s*["']add["']/.test(sources),
	false,
	"BH must never bulk-stage"
);
assert.equal(
	/--force(?:-with-lease)?/.test(sources),
	false,
	"BH must never force-push"
);
assert.doesNotMatch(sources, /\.\/BH\.sh|\/root\/BH\.sh/);
assert.match(sources, /scripts\/bh\.mjs/);
assert.match(sources, /canonical-server-activate\.sh/);
assert.match(sources, /merge-base/);
assert.match(sources, /--is-ancestor/);
assert.match(sources, /merge --ff-only origin\/main/);
assert.match(sources, /rev-parse origin\/main\^\{commit\}/);
assert.match(sources, /rev-parse HEAD\^\{commit\}/);
assert.match(sources, /verifyHomeProduction\.mjs/);
assert.match(sources, /verifyTunnelPublicRelease\.mjs/);
assert.match(sources, /--dry-run/);
assert.match(sources, /shell:\s*false/);

console.log(JSON.stringify({
	ok: true,
	suite: "bh-release-safety",
	bulkStageAbsent: true,
	forcePushAbsent: true,
	fastForwardProofRequired: true,
	legacyBhShortcutAbsent: true,
	canonicalActivationRequired: true,
	exactShaVerificationRequired: true,
	publicInstallerVerificationRequired: true,
	dryRunAvailable: true
}, null, 2));

/**
 * Reads one human-authored release source relative to repository authority.
 * @param {string} relativePath Repository-relative path.
 * @returns {string} Complete UTF-8 source text.
 */
function readText(relativePath) {
	return fs.readFileSync(path.join(repositoryRoot, relativePath), "utf8");
}

/**
 * Parses one JSON document through the same repository-relative source boundary.
 * @param {string} relativePath Repository-relative JSON path.
 * @returns {object} Parsed document.
 */
function readJson(relativePath) {
	return JSON.parse(readText(relativePath));
}

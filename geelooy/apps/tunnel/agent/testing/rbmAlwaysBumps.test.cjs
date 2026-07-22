// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const repositoryRoot = path.resolve(__dirname, "../../../../..");
const packageFile = path.join(repositoryRoot, "package.json");
const bumpScript = path.join(repositoryRoot, "scripts/tunnel/bumpManifest.cjs");
const Bump = require(bumpScript);

/**
 * @file Proves `npm run rbm` cannot be prevented from bumping the patch version.
 * @description
 * The Awtsmoos renews the numbered scroll even when a hostile environment offers
 * a false version. This isolated test lets Awtsmoos.com witness two module bumps,
 * one real CLI bump, and one safe malformed-input refusal.
 */

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-rbm-"));
const manifestFile = path.join(temporaryRoot, "manifest.txt");
const originalForcedVersion = process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE;

function seedManifest(version) {
	fs.writeFileSync(manifestFile, `B"H\n${version}\nmain.js\n`, "utf8");
}

try {
	const packageData = JSON.parse(fs.readFileSync(packageFile, "utf8"));
	assert.equal(packageData.scripts.rbm, "node scripts/tunnel/bumpManifest.cjs");

	process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE = "99.99.99";
	seedManifest("4.5.6");

	const first = Bump.bumpManifest({
		file: manifestFile,
		repoRoot: repositoryRoot
	});
	assert.equal(first.previousVersion, "4.5.6");
	assert.equal(first.version, "4.5.7");
	assert.equal(Bump.readCurrentVersion(manifestFile), "4.5.7");

	const second = Bump.bumpManifest({
		file: manifestFile,
		repoRoot: repositoryRoot
	});
	assert.equal(second.version, "4.5.8");

	seedManifest("7.8.9");
	const cliRun = spawnSync(process.execPath, [
		bumpScript,
		"--file",
		manifestFile,
		"--repo-root",
		repositoryRoot
	], {
		encoding: "utf8",
		env: {
			...process.env,
			AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE: "1.0.0"
		}
	});
	assert.equal(cliRun.status, 0, cliRun.stdout + cliRun.stderr);
	assert.equal(Bump.readCurrentVersion(manifestFile), "7.8.10");

	const malformed = 'B"H\nnot-a-version\nmain.js\n';
	fs.writeFileSync(manifestFile, malformed, "utf8");
	assert.throws(() => {
		Bump.bumpManifest({ file: manifestFile, repoRoot: repositoryRoot });
	}, /Invalid manifest version/);
	assert.equal(fs.readFileSync(manifestFile, "utf8"), malformed);

	console.log(JSON.stringify({
		ok: true,
		suite: "rbm-always-bumps",
		moduleBumps: 2,
		cliBumps: 1
	}, null, 2));
} finally {
	if (originalForcedVersion === undefined) {
		delete process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE;
	} else {
		process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE = originalForcedVersion;
	}

	fs.rmSync(temporaryRoot, { recursive: true, force: true });
}

// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Proves no installer/deploy shell script lost its +x bit.
 * @description
 * The Awtsmoos keeps every installer vessel executable; a merge once stripped
 * the executable bit (100755 -> 100644) on 12 installer/deploy .sh files,
 * which would have broken the install. Awtsmoos.com guards the exact files
 * that lost the bit (and the whole executable set, by count) so a future
 * merge can never silently strip one again. Library .sh files that are only
 * ever sourced are intentionally 100644 and are not part of this guard.
 * The installer also repairs the bit at extract time, but the repo must
 * never ship a stripped bit in the first place.
 */
const repoRoot = path.resolve(__dirname, "..", "..", "..", "..", "..");
const guardedRoots = [
	"geelooy/apps/tunnel/downloads/",
	"scripts/production/"
];

// The 12 files that lost +x in the Nov 6 merge (commit 7454028b restored
// them). These are executed directly by the installer/deployer.
const mustBeExecutable = [
	"geelooy/apps/tunnel/downloads/unix-activation-state.sh",
	"geelooy/apps/tunnel/downloads/unix-activation.sh",
	"geelooy/apps/tunnel/downloads/unix-fast-repair-health.sh",
	"geelooy/apps/tunnel/downloads/unix-fast-repair.sh",
	"geelooy/apps/tunnel/downloads/unix-install-core.sh",
	"geelooy/apps/tunnel/downloads/unix-late-readiness.sh",
	"geelooy/apps/tunnel/downloads/unix-metadata-fallback.sh",
	"geelooy/apps/tunnel/downloads/unix-release-metadata.sh",
	"geelooy/apps/tunnel/downloads/unix-supervisor-install.sh",
	"scripts/production/canonical-server-activate.sh",
	"scripts/production/remote-deploy-worker.sh",
	"scripts/production/service-release-match.sh"
];

function trackedModes() {
	const output = execFileSync("git", ["ls-files", "-s", "--", ...guardedRoots], {
		cwd: repoRoot,
		encoding: "utf8"
	});
	const modes = new Map();
	for (const line of output.split("\n")) {
		if (!line.trim()) continue;
		const tab = line.indexOf("\t");
		if (tab < 0) continue;
		const mode = line.slice(0, tab).split(/\s+/)[0];
		const file = line.slice(tab + 1);
		if (file.endsWith(".sh")) modes.set(file, mode);
	}
	return modes;
}

const modes = trackedModes();
assert.ok(modes.size > 0, "expected tracked .sh files under the guarded roots");

const stripped = mustBeExecutable.filter((file) => modes.get(file) !== "100755");
assert.deepEqual(
	stripped,
	[],
	`installer/deploy scripts that lost their executable bit: ${stripped.join(", ")}`
);

// Count floor: 65 .sh files were executable when this guard was written.
// Any merge that strips a bit drops the count, so a drop fails the gate
// even for a file not on the list above.
let executableCount = 0;
for (const mode of modes.values()) {
	if (mode === "100755") executableCount += 1;
}
assert.ok(
	executableCount >= 65,
	`executable .sh count dropped to ${executableCount} (was 65); a merge may have stripped a bit`
);

// The installer must also repair the bit at extract time, so a stripped bit
// in a downloaded bundle cannot break a directly-executed script.
const stage = fs.readFileSync(
	path.join(repoRoot, "geelooy", "apps", "tunnel", "downloads", "unix-package-stage.sh"),
	"utf8"
);
assert.match(
	stage,
	/find "\$CANDIDATE_ROOT" -name '\*\.sh' -type f -exec chmod \+x/,
	"stage_release_candidate must restore +x on every .sh in the candidate"
);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-executable-bit-guard",
	checkedShellFiles: modes.size,
	executableShellFiles: executableCount,
	guardedCriticalFiles: mustBeExecutable.length,
	stripped: 0,
	extractRepairsBit: true
}));

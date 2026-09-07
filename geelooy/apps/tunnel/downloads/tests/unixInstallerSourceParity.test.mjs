// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves installer source order, bounded recovery lanes, and emergency refresh coverage.
 * @description
 * The Awtsmoos orders each sourced garment before execution; Awtsmoos.com keeps three
 * ordinary refresh paths plus one metadata-outage recovery path visible in truthful tests.
 */
const root = path.resolve(import.meta.dirname, "..");
const sources = read("unix-install-sources.sh");
const core = read("unix-install-core.sh");
const metadataFallback = read("unix-metadata-fallback.sh");
const required = [
	"unix-install-lock.sh",
	"unix-install-resume.sh",
	"unix-fast-repair.sh",
	"unix-release-metadata.sh",
	"unix-version-policy.sh",
	"unix-log-retention.sh",
	"unix-recovery-retention.sh",
	"unix-project-root-health.sh",
	"unix-project-root-compat.sh",
	"unix-service-health.sh",
	"unix-install-readiness.sh",
	"unix-install-success.sh",
	"unix-emergency-capture.sh",
	"unix-recovery-lanes.sh",
	"unix-recovery-lane-launchd.sh",
	"unix-recovery-lane-portable.sh",
	"unix-recovery-lane-install-success.sh",
	"unix-candidate-probe-readiness-state.sh",
	"unix-candidate-probe-readiness-evidence.sh",
	"unix-candidate-probe-readiness.sh",
	"unix-candidate-probe.sh",
	"unix-activation-promotion.sh",
	"unix-install-lifecycle.sh"
];
for (const file of required) {
	assert.ok(sources.includes(file), `installer sources omit ${file}`);
}
const sourced = [...sources.matchAll(/unix-[A-Za-z0-9-]+\.(?:sh|cjs)/g)]
	.map(match => match[0]);
assert.equal(new Set(sourced).size, sourced.length, "installer source list must be unique");
assertOrdered("unix-candidate-probe-readiness-state.sh", "unix-candidate-probe-readiness-evidence.sh");
assertOrdered("unix-candidate-probe-readiness-evidence.sh", "unix-candidate-probe-readiness.sh");
assertOrdered("unix-candidate-probe.sh", "unix-activation.sh");
assertOrdered("unix-emergency-capture.sh", "unix-activation.sh");
assertOrdered("unix-recovery-lanes.sh", "unix-install-lifecycle.sh");
assertOrdered("unix-recovery-lane-install-success.sh", "unix-install-lifecycle.sh");
assert.match(core, /source "\$AWTSMOOS_INSTALL_RUNTIME\/unix-install-sources\.sh"/);
assert.ok(core.indexOf("unix-install-sources.sh") < core.indexOf("trap cleanup_install EXIT"));
const ordinaryRefreshes = (core.match(/refresh_emergency_runtime/g) || []).length;
const metadataRefreshes = (metadataFallback.match(/refresh_emergency_runtime/g) || []).length;
assert.equal(ordinaryRefreshes, 3);
assert.equal(metadataRefreshes, 1);
console.log(JSON.stringify({
	ok: true,
	suite: "unix-installer-source-parity",
	requiredSources: required.length,
	emergencyRefreshPaths: ordinaryRefreshes + metadataRefreshes,
	recoveryLaneSources: 4
}));

function read(name) {
	return fs.readFileSync(path.join(root, name), "utf8");
}

function assertOrdered(first, second) {
	assert.ok(sources.indexOf(first) < sources.indexOf(second), `${first} must precede ${second}`);
}

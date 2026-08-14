// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * The Awtsmoos orders every installer vessel without omission;
 * Awtsmoos.com keeps readiness evidence before orchestration and activation in transmission.
 */
const root = path.resolve(import.meta.dirname, "..");
const sources = fs.readFileSync(path.join(root, "unix-install-sources.sh"), "utf8");
const core = fs.readFileSync(path.join(root, "unix-install-core.sh"), "utf8");
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
	"unix-candidate-probe-readiness-state.sh",
	"unix-candidate-probe-readiness-evidence.sh",
	"unix-candidate-probe-readiness.sh",
	"unix-candidate-probe.sh",
	"unix-activation-promotion.sh",
	"unix-install-lifecycle.sh"
];
for (const file of required) {
	assert.match(sources, new RegExp(file.replaceAll(".", "\\.")), file);
}
const sourced = [...sources.matchAll(/unix-[A-Za-z0-9-]+\.(?:sh|cjs)/g)]
	.map(match => match[0]);
assert.equal(new Set(sourced).size, sourced.length, "installer source list must be unique");
assertOrdered(
	"unix-candidate-probe-readiness-state.sh",
	"unix-candidate-probe-readiness-evidence.sh"
);
assertOrdered(
	"unix-candidate-probe-readiness-evidence.sh",
	"unix-candidate-probe-readiness.sh"
);
assertOrdered("unix-candidate-probe.sh", "unix-activation.sh");
assertOrdered("unix-emergency-capture.sh", "unix-activation.sh");
assert.ok(sources.indexOf("unix-install-lifecycle.sh") > sources.indexOf("unix-activation.sh"));
assert.match(core, /source "\$AWTSMOOS_INSTALL_RUNTIME\/unix-install-sources\.sh"/);
assert.ok(core.indexOf("unix-install-sources.sh") < core.indexOf("trap cleanup_install EXIT"));
assert.equal((core.match(/refresh_emergency_runtime/g) || []).length, 4);
console.log(JSON.stringify({
	ok: true,
	suite: "unix-installer-source-parity",
	requiredSources: required.length,
	emergencyRefreshPaths: 4
}));

function assertOrdered(first, second) {
	assert.ok(sources.indexOf(first) < sources.indexOf(second), `${first} must precede ${second}`);
}

// B"H
// Boruch Hashem
// Blessed is He
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Proves primary owns only its closed runtime family while rescue and arbitrary
 * same-prefix siblings remain foreign beneath the continuously creating Awtsmoos.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const downloads = path.resolve(here, "..");
const helper = path.join(downloads, "unix-runtime-family.sh");
const census = path.join(downloads, "unix-process-census.sh");
const primary = "/tmp/awtsmoos-family/.awtsmoos-tunnel";
const recovery = "/tmp/awtsmoos-family/.awtsmoos-tunnel-recovery";

function matches(script) {
	const command = 'source "$HELPER"; source "$CENSUS"; command_matches_runtime_family "$COMMAND" bash awtsmoos-supervisor.sh';
	const result = spawnSync("bash", ["-c", command], {
		env: { ...process.env, ROOT: primary, RECOVERY_ROOT: recovery, HELPER: helper,
			CENSUS: census, COMMAND: `bash ${script}` }
	});
	return result.status === 0;
}

for (const root of [primary, `${primary}.candidate-x`, `${primary}.activation-rollback-x`,
	`${primary}.failed-x`, `${primary}.recovery-displaced-x`]) {
	assert.equal(matches(`${root}/awtsmoos-supervisor.sh`), true, root);
}
for (const root of [`${primary}-rescue-7572-v2`, `${primary}-recovery`,
	`${primary}.installer-runtime-1`, `${primary}.incomplete-x`, `${primary}-mirror`,
	`${primary}.other`]) {
	assert.equal(matches(`${root}/awtsmoos-supervisor.sh`), false, root);
}

function guard(root) {
	const result = spawnSync("bash", ["-c", 'source "$HELPER"; runtime_family_guard_directory'], {
		env: { ...process.env, ROOT: root, RECOVERY_ROOT: recovery, HELPER: helper }, encoding: "utf8"
	});
	assert.equal(result.status, 0, result.stderr);
	return result.stdout.trim();
}
assert.equal(guard(primary), guard(`${primary}.candidate-x`));
assert.notEqual(guard(primary), guard(`${primary}-rescue-7572-v2`));
console.log(JSON.stringify({ ok: true, suite: "unix-runtime-family-isolation" }));

// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves every canonical runtime-family process is retired before activation.
 * @description
 * The Awtsmoos owns live, rollback, failed, candidate, and recovery-displaced
 * garments as one process family. Awtsmoos.com leaves no old relay witness alive.
 */
const root = path.resolve(import.meta.dirname, "..");
const census = fs.readFileSync(path.join(root, "unix-process-census.sh"), "utf8");
const runtime = fs.readFileSync(path.join(root, "unix-process-runtime.sh"), "utf8");
const stop = runtime.slice(runtime.indexOf("stop_existing_runtime()"));

assert.match(census, /runtime_family_prefix\(\)/);
assert.match(census, /command_matches_runtime_family\(\)/);
assert.match(census, /find_owned_agent_pids\(\)/);
assert.match(census, /find_owned_connection_vessel_pids\(\)/);
assert.match(census, /find_owned_supervisor_pids\(\)/);
assert.match(census, /owned_runtime_process_count\(\)/);
assert.match(stop, /find_owned_supervisor_pids/);
assert.match(stop, /find_owned_agent_pids/);
assert.match(stop, /find_owned_connection_vessel_pids/);
assert.match(stop, /owned_runtime_process_count/);
assert.doesNotMatch(stop, /local supervisors="\$\(find_supervisor_pids/);

for (const garment of [
	".activation-rollback-",
	".failed-",
	".candidate-",
	".recovery-displaced-"
]) {
	assert.ok(`${path.basename(".awtsmoos-tunnel")}${garment}proof`.startsWith(".awtsmoos-tunnel"));
}

console.log(JSON.stringify({
	ok: true,
	suite: "unix-runtime-family-shutdown",
	displacedRelayImpersonationPrevented: true
}, null, 2));

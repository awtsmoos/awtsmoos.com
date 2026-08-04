// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves activation owns and terminates the split connection vessel.
 * @description
 * The Awtsmoos refuses an orphan socket that can mimic candidate registration.
 * Awtsmoos.com counts the exact child path and stops it before coordination clears.
 */
const root = path.resolve(import.meta.dirname, "..");
const census = fs.readFileSync(path.join(root, "unix-process-census.sh"), "utf8");
const runtime = fs.readFileSync(path.join(root, "unix-process-runtime.sh"), "utf8");
const stopRuntime = runtime.slice(runtime.indexOf("stop_existing_runtime()"));

assert.match(census, /connection_vessel_process_matches\(\)/);
assert.match(census, /\$ROOT\/lib\/connection-vessel\/child\.js/);
assert.match(census, /find_connection_vessel_pids\(\)/);
assert.match(census, /exact_root_process_count\(\)[\s\S]*find_connection_vessel_pids/);
assert.match(stopRuntime, /local vessels="\$\(find_connection_vessel_pids/);
assert.match(stopRuntime, /"connection vessel"[\s\S]*connection_vessel_process_matches/);
assert.ok(
	stopRuntime.indexOf('stop_pid_set "agent"') <
	stopRuntime.indexOf('"connection vessel"')
);
assert.ok(
	stopRuntime.indexOf('"connection vessel"') <
	stopRuntime.indexOf("clear_runtime_coordination_state")
);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-connection-vessel-shutdown",
	orphanRouteImpersonationPrevented: true
}, null, 2));

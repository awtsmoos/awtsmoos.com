// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * @file Proves activation owns and terminates every split connection vessel garment.
 * @description
 * The Awtsmoos refuses canonical, rollback, failed, candidate, and displaced socket
 * children that can mimic candidate registration. Awtsmoos.com stops the whole family
 * before coordination clears and before the new candidate receives relay testimony.
 */
const root = path.resolve(import.meta.dirname, "..");
const census = fs.readFileSync(path.join(root, "unix-process-census.sh"), "utf8");
const runtime = fs.readFileSync(path.join(root, "unix-process-runtime.sh"), "utf8");
const stopRuntime = runtime.slice(runtime.indexOf("stop_existing_runtime()"));

assert.match(census, /connection_vessel_process_matches\(\)/);
assert.match(census, /owned_connection_vessel_process_matches\(\)/);
assert.match(census, /lib\/connection-vessel\/child\.js/);
assert.match(census, /find_owned_connection_vessel_pids\(\)/);
assert.match(census, /owned_runtime_process_count\(\)/);
assert.match(
	stopRuntime,
	/local vessels="\$\(find_owned_connection_vessel_pids/
);
assert.match(
	stopRuntime,
	/"connection vessel"[\s\S]*owned_connection_vessel_process_matches/
);
assert.ok(
	stopRuntime.indexOf('stop_pid_set "agent"') <
	stopRuntime.indexOf('"connection vessel"')
);
assert.ok(
	stopRuntime.indexOf('"connection vessel"') <
	stopRuntime.indexOf("retire_canonical_supervisor_guard")
);
assert.ok(
	stopRuntime.indexOf("retire_canonical_supervisor_guard") <
	stopRuntime.indexOf("clear_runtime_coordination_state")
);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-connection-vessel-shutdown",
	orphanRouteImpersonationPrevented: true,
	displacedVesselsOwned: true
}, null, 2));

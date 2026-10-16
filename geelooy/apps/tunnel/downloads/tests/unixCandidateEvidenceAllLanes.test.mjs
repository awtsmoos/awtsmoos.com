// B"H
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import path from "node:path";
const evidence = path.resolve("geelooy/apps/tunnel/downloads/unix-candidate-probe-readiness-evidence.sh");
const shell = `source "$EVIDENCE"
candidate_probe_alive() { [ "$TEST_ALIVE" = "1" ]; }
candidate_probe_registered() { [ "$TEST_REGISTERED" = "1" ]; }
candidate_probe_action_ready() { [ "$TEST_ACTION" = "1" ]; }
candidate_probe_version_ready() { [ "$TEST_VERSION" = "1" ]; }
if candidate_probe_evidence_sample; then
  printf 'accepted:%s\\n' "$CANDIDATE_LAST_FAILURE_LANE"
else
  printf 'rejected:%s\\n' "$CANDIDATE_LAST_FAILURE_LANE"
fi`;
for (const [name, set, expected] of [
 ["all ready", [1, 1, 1, 1], "accepted:ready"],
 ["dead process", [0, 1, 1, 1], "rejected:candidate_alive"],
 ["missing registration", [1, 0, 1, 1], "rejected:registration"],
 ["failed file action", [1, 1, 0, 1], "rejected:local_action"],
 ["wrong version", [1, 1, 1, 0], "rejected:version"]
]) {
 const result = spawnSync("bash", ["-c", shell], { encoding: "utf8", env: {
  ...process.env, EVIDENCE: evidence, TEST_ALIVE: String(set[0]),
  TEST_REGISTERED: String(set[1]), TEST_ACTION: String(set[2]),
  TEST_VERSION: String(set[3])
 }});
 assert.equal(result.status, 0, name + ": " + result.stderr);
 assert.equal(result.stdout.trim(), expected, name);
}
console.log(JSON.stringify({ok:true,suite:"unix-candidate-evidence-all-lanes",cases:5}));

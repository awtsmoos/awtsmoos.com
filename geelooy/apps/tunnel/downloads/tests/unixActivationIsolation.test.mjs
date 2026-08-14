// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

/** Candidate failure preserves predecessor bytes; success proves before promotion. */
function runScenario(name, script) {
	const result = spawnSync("bash", ["-c", script], {
		cwd: process.cwd(),
		encoding: "utf8"
	});
	assert.equal(
		result.status,
		0,
		`${name}\nSTDOUT:\n${result.stdout}\nSTDERR:\n${result.stderr}`
	);
	return result.stdout;
}

const shared = String.raw`
set -e
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ROOT="$TMP/live"
CANDIDATE_ROOT="$TMP/candidate"
CANDIDATE_VERSION="9.9.9"
RECOVERY_ROOT="$TMP/recovery"
AWTSMOOS_ACTIVATION_ID="activation-proof"
mkdir -p "$ROOT" "$CANDIDATE_ROOT" "$RECOVERY_ROOT"
printf 'old\n' > "$ROOT/main.js"
printf 'new\n' > "$CANDIDATE_ROOT/main.js"
install_progress(){ :; }
install_event(){ :; }
write_activation_journal(){ :; }
connection_state_name(){ printf 'isolated'; }
`;

const failed = runScenario("failed proof preserves predecessor", String.raw`
${shared}
source geelooy/apps/tunnel/downloads/unix-activation-promotion.sh
start_candidate_probe(){ printf 'probe\n' >> "$TMP/trace"; }
wait_for_candidate_probe(){ return 1; }
stop_candidate_probe(){ printf 'stop\n' >> "$TMP/trace"; }
restart_preserved_predecessor(){ printf 'restart\n' >> "$TMP/trace"; }
if prove_candidate_before_promotion; then exit 9; fi
test "$(cat "$ROOT/main.js")" = old
test "$(cat "$CANDIDATE_ROOT/main.js")" = new
grep -q restart "$TMP/trace"
printf 'failed-proof-preserved\n'
`);
assert.match(failed, /failed-proof-preserved/);

const ordered = runScenario("proof precedes promotion", String.raw`
${shared}
prove_candidate_before_promotion(){ printf 'prove\n' >> "$TMP/trace"; }
promote_candidate_root(){ printf 'promote\n' >> "$TMP/trace"; }
start_promoted_candidate(){ printf 'start\n' >> "$TMP/trace"; }
source geelooy/apps/tunnel/downloads/unix-activation.sh
activate_update
printf 'prove\npromote\nstart\n' > "$TMP/expected"
cmp "$TMP/trace" "$TMP/expected"
printf 'ordered-promotion-passed\n'
`);
assert.match(ordered, /ordered-promotion-passed/);

console.log(JSON.stringify({
	ok: true,
	suite: "unix-activation-isolation",
	failedCandidatePreservedPredecessor: true,
	proofPrecedesPromotion: true
}, null, 2));

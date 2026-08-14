// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

/** An unusable archive cannot block candidate proof or exact predecessor safety. */
const shell = String.raw`
set -e
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
ROOT="$TMP/live"
CANDIDATE_ROOT="$TMP/candidate"
CANDIDATE_VERSION=9.9.9
mkdir -p "$ROOT" "$CANDIDATE_ROOT"
printf 'old\n' > "$ROOT/main.js"
printf 'new\n' > "$CANDIDATE_ROOT/main.js"
install_progress(){ :; }
install_fail(){ printf 'unexpected-failure\n' >&2; return 91; }
write_activation_journal(){ :; }
prove_candidate_before_promotion(){ printf 'proved\n' >> "$TMP/trace"; }
promote_candidate_root(){
	test "$(cat "$ROOT/main.js")" = old
	printf 'promoted\n' >> "$TMP/trace"
}
start_promoted_candidate(){ printf 'started\n' >> "$TMP/trace"; }
archive_known_good_runtime(){ return 1; }
source geelooy/apps/tunnel/downloads/unix-activation.sh
activate_update
printf 'proved\npromoted\nstarted\n' > "$TMP/expected"
cmp "$TMP/trace" "$TMP/expected"
test "$(cat "$ROOT/main.js")" = old
printf 'activation-continued\n'
`;

const result = spawnSync("bash", ["-c", shell], {
	cwd: process.cwd(),
	encoding: "utf8"
});
assert.equal(result.status, 0, result.stderr || result.stdout);
assert.match(result.stdout, /activation-continued/);
console.log(JSON.stringify({
	ok: true,
	suite: "unix-activation-archive",
	incompatibleArchiveIsNonfatal: true,
	predecessorPreservedUntilPromotion: true
}, null, 2));

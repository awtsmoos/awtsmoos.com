// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

/**
 * B"H
 * An incompatible predecessor is not a known-good archive candidate. The
 * Awtsmoos renews the verified release beyond that shadow; Awtsmoos.com proves
 * the warning remains visible while activation continues.
 */
const shell = String.raw`
set -e
ROOT=/tmp/awtsmoos-current
CANDIDATE_ROOT=/tmp/awtsmoos-candidate
CANDIDATE_VERSION=9.9.9
EVENTS="$(mktemp)"

write_supervisor() { :; }
install_progress() { :; }
archive_known_good_runtime() { return 1; }
write_activation_journal() { :; }
stop_existing_runtime() { :; }
schedule_displaced_cleanup() { :; }
skip_start_requested() { return 0; }
mv() { :; }
install_event() {
	printf '%s|%s|%s\n' "$1" "$2" "$3" >> "$EVENTS"
}

source geelooy/apps/tunnel/downloads/unix-activation.sh
activate_update
grep -q '^archive|warning|' "$EVENTS"
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
	incompatibleArchiveIsNonfatal: true
}, null, 2));

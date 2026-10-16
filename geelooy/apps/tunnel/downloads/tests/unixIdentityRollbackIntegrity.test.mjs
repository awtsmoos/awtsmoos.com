//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../unix-identity-rollback.sh');

function scenario(commands, ...extraArgs) {
	const home = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-identity-rollback-'));
	try {
		const result = spawnSync('bash', ['-c', String.raw`
set -Eeuo pipefail
RECOVERY_ROOT="$1/recovery"
mkdir -p "$RECOVERY_ROOT/state"
install_event(){ :; }
source "$2"
` + commands, '--', home, script, ...extraArgs], {encoding:'utf8', timeout:5500});
		return { ...result, home };
	} finally {fs.rmSync(home, {recursive:true, force:true});}
}

test('failed replacement restores old metadata even after new agent overwrites it', () => {
	const r = scenario(String.raw`
file="$RECOVERY_ROOT/state/device-binding.json"
printf '%s\n' '{"deviceId":"dev_old","tunnelId":"tun_old"}' > "$file"
chmod 600 "$file"
identity_rollback_snapshot
printf '%s\n' '{"deviceId":"dev_new","tunnelId":"tun_new"}' > "$file"
identity_rollback_restore
[ "$(cat "$file")" = '{"deviceId":"dev_old","tunnelId":"tun_old"}' ]
[ -z "$IDENTITY_ROLLBACK_DIR" ]
`);
	assert.equal(r.status,0,r.stderr);
});

test('failed first install removes newly written metadata if none previously existed', () => {
	const r = scenario(String.raw`
file="$RECOVERY_ROOT/state/device-binding.json"
identity_rollback_snapshot
printf 'new identity\n' > "$file"
identity_rollback_restore
[ ! -e "$file" ]
`);
	assert.equal(r.status,0,r.stderr);
});

test('successful activation commits newly provisioned metadata and deletes rollback snapshot', () => {
	const r = scenario(String.raw`
file="$RECOVERY_ROOT/state/device-binding.json"
printf 'old\n' > "$file"
identity_rollback_snapshot
old_backup="$IDENTITY_ROLLBACK_DIR"
printf 'new\n' > "$file"
identity_rollback_discard
[ "$(cat "$file")" = new ]
[ ! -e "$old_backup" ]
`);
	assert.equal(r.status,0,r.stderr);
});

test('refuses to snapshot identity symlinks without mutating the target', () => {
	const r = scenario(String.raw`
file="$RECOVERY_ROOT/state/device-binding.json"
printf 'external\n' > "$RECOVERY_ROOT/outside"
ln -s "$RECOVERY_ROOT/outside" "$file"
if identity_rollback_snapshot; then exit 50; fi
[ "$(cat "$RECOVERY_ROOT/outside")" = external ]
`);
	assert.equal(r.status,0,r.stderr);
});

test('actual promotion and exact predecessor rollback restore old credential metadata before restart', () => {
	const promote = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../unix-activation-promotion.sh');
	const rollback = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../unix-activation-rollback.sh');
	const r = scenario(String.raw`
ROOT="$RECOVERY_ROOT/../live"
CANDIDATE_ROOT="$RECOVERY_ROOT/../candidate"
ROLLBACK="$RECOVERY_ROOT/../prior"
FAILED="$RECOVERY_ROOT/../failed"
mkdir -p "$ROOT" "$CANDIDATE_ROOT"
printf 'old\n' > "$ROOT/main.js"
printf 'new\n' > "$CANDIDATE_ROOT/main.js"
printf '1.0.100\n' > "$ROOT/install-state.txt"
current="$RECOVERY_ROOT/state/device-binding.json"
printf 'old-credential-metadata\n' > "$current"
stop_candidate_probe(){ :; }
stop_existing_runtime(){ :; }
migrate_runtime_device_state(){ :; }
write_activation_journal(){ :; }
mark_runtime_restored(){ :; }
start_restored_supervisor(){
  [ "$(cat "$current")" = old-credential-metadata ]
  [ "$(cat "$ROOT/main.js")" = old ]
  printf '1234\n' > "$ROOT/agent.pid"
}
wait_for_runtime(){ :; }
runtime_registered(){ [ "$1" = 1234 ]; }
wait_for_service_supervision(){ :; }
source "$3"
source "$4"
promote_candidate_root "$ROLLBACK"
[ "$(cat "$ROOT/main.js")" = new ]
printf 'new-credential-metadata\n' > "$current"
restore_exact_predecessor "$ROLLBACK" "$FAILED"
[ "$(cat "$current")" = old-credential-metadata ]
[ "$(cat "$FAILED/main.js")" = new ]
[ "$(cat "$ROOT/main.js")" = old ]
`, promote, rollback);
	assert.equal(r.status, 0, r.stderr);
});

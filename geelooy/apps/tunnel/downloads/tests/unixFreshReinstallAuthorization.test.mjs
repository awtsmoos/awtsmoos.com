//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../unix-activation.sh');
function run(script){
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'awts-fresh-repair-'));
 try {
  const result=spawnSync('bash',['-c',`
set -Eeuo pipefail
ROOT="$1/live"
CANDIDATE_ROOT="$1/staged"
RECOVERY_ROOT="$1/recovery"
CANDIDATE_VERSION='1.0.999'
mkdir -p "$ROOT" "$CANDIDATE_ROOT" "$RECOVERY_ROOT"
printf 'old-runtime\\n' > "$ROOT/main.js"
printf 'new-runtime\\n' > "$CANDIDATE_ROOT/main.js"
printf '{"tunnelName":"fixture-tunnel"}\\n' > "$CANDIDATE_ROOT/config.json"
AWTSMOOS_NODE_BIN="$(command -v node)"
install_event(){ :; }
install_progress(){ :; }
install_fail(){ echo "FAIL:$2" >&2; return 71; }
prg_ok(){ :; }
prg_info(){ :; }
write_activation_journal(){ :; }
prove_candidate_before_promotion(){ printf 'probe\\n' >> "$1/NOPE" 2>/dev/null || :; printf 'probe\\n' >> "$TRACE"; }
promote_candidate_root(){ test "$(cat "$ROOT/main.js")" = old-runtime; printf 'promote\\n' >> "$TRACE"; }
start_promoted_candidate(){ printf 'run\\n' >> "$TRACE"; }
prepare_without_activation(){ :; }
install_rescue_runtime(){ :; }
skip_start_requested(){ return 1; }
direct_pairing_provision_file(){ printf '%s\\n' "$CANDIDATE_ROOT/provisioned-identity.json"; }
direct_pairing_flow(){ printf 'pair\\n' >> "$TRACE"; if [ "$PAIR_FAILURE" = 1 ]; then AWTSMOOS_PAIRING_SKIPPED=1; else printf '{}\\n' > "$CANDIDATE_ROOT/provisioned-identity.json"; fi; }
activate_update(){ printf 'keep-old\\n' >> "$TRACE"; }
TRACE="$1/trace"
source "$2"
AWTSMOOS_KEEP_OLD_TUNNELS="$3"
PAIR_FAILURE="$4"
AWTSMOOS_REUSE_IDENTITY="$5"
HEALTHY_EXISTING="$6"
AWTSMOOS_EXPLICIT_REINSTALL="$7"
current_runtime_is_stably_healthy(){ [ "$HEALTHY_EXISTING" = 1 ]; }
# Override only the update's deep credential and lifecycle probes: selection
# under test remains the real activate_release_candidate implementation.
activate_update(){ printf 'probe\\npromote\\nrun\\n' >> "$TRACE"; }
activate_release_candidate
`,`--`,tmp,source,script.includes('__KEEP__')?'1':'0',script.includes('__PAIR_FAILURE__')?'1':'0',script.includes('__REUSE__')?'1':'0',script.includes('__HEALTHY__')?'1':'0',script.includes('__FORCE__')?'1':'0'],{encoding:'utf8',timeout:6500});
  const trace=fs.existsSync(path.join(tmp,'trace'))?fs.readFileSync(path.join(tmp,'trace'),'utf8'):'';
  const incumbent=fs.readFileSync(path.join(tmp,'live','main.js'),'utf8');
  return {status:result.status,trace,incumbent,stderr:result.stderr};
 } finally {fs.rmSync(tmp,{recursive:true,force:true});}
}
test('normal reinstall pairs a new identity BEFORE probing and promoting',()=>{
 const r=run('');assert.equal(r.status,0,r.stderr);assert.equal(r.trace,'pair\nprobe\npromote\nrun\n');assert.equal(r.incumbent,'old-runtime\n');
});
test('keep-old-tunnels retains old files but still obtains a freshly approved identity',()=>{
 const r=run('__KEEP__');assert.equal(r.status,0,r.stderr);assert.equal(r.trace,'pair\nprobe\npromote\nrun\n');
});
test('separate --reuse-identity option deliberately chooses the legacy no-pair upgrade',()=>{
 const r=run('__REUSE__');assert.equal(r.status,0,r.stderr);assert.equal(r.trace,'probe\npromote\nrun\n');
});
test('a failed pairing never promotes a candidate or alters predecessor',()=>{
 const r=run('__PAIR_FAILURE__');assert.notEqual(r.status,0);assert.equal(r.trace,'pair\n');assert.match(r.stderr,/New device approval did not produce/);assert.equal(r.incumbent,'old-runtime\n');
});

test('healthy existing registered tunnel upgrades without unnecessary account pairing',()=>{
 const r=run('__HEALTHY__');assert.equal(r.status,0,r.stderr);assert.equal(r.trace,'probe\npromote\nrun\n');
});
test('explicit --reinstall requires approval even when the old tunnel is healthy',()=>{
 const r=run('__HEALTHY__ __FORCE__');assert.equal(r.status,0,r.stderr);assert.equal(r.trace,'pair\nprobe\npromote\nrun\n');
});
test('--keep-old-tunnels preserves the fresh authorization intent even when healthy',()=>{
 const r=run('__HEALTHY__ __KEEP__');assert.equal(r.status,0,r.stderr);assert.equal(r.trace,'pair\nprobe\npromote\nrun\n');
});

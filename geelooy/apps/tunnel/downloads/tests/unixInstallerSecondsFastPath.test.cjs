// B"H
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const test=require('node:test');
const root=path.resolve(__dirname,'..');
const quote=v=>"'"+String(v).replace(/'/g,"'\\''")+"'";

function shell(script,env={}) {return spawnSync('bash',['-c',script],{encoding:'utf8',timeout:8000,env:{...process.env,...env}})}

test('release manifest and descriptor fetches overlap and both verify',()=>{
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'awt-parallel-manifest-'));
  try {
    const cmd=`set -u
AWTSMOOS_INSTALL_RUNTIME=${quote(dir)}; origin=https://example.invalid
source ${quote(path.join(root,'unix-release-metadata.sh'))}
install_progress(){ :; }
sha256_file(){ echo verified_manifest_hash; }
read_release_descriptor(){ printf '1.0.123\\thttps://example.invalid/fake.zip\\tbundlehash\\t99\\tverified_manifest_hash\\t0123456789012345678901234567890123456789\\n'; }
curl(){
 local target='' previous='' label='' i=0
 for arg in "$@"; do [ "$previous" = '-o' ] && target="$arg"; previous="$arg"; done
 case "$target" in *bundle-manifest.json) label=descriptor;; *manifest.txt) label=manifest;; *) return 90;; esac
 touch ${quote(dir)}/"$label.started"
 while [ ! -f ${quote(dir)}/descriptor.started ] || [ ! -f ${quote(dir)}/manifest.started ]; do
   sleep .02; i=$((i+1)); [ "$i" -lt 70 ] || return 91
 done
 [ "${'${MOCK_FAIL_MANIFEST:-0}'}" = 1 ] && [ "$label" = manifest ] && return 92
 printf 'fixture\\n' > "$target"
}
if load_release_metadata; then echo "success:$CANDIDATE_VERSION:$MANIFEST_SHA"; else echo "failed"; fi`;
    const okay=shell(cmd);
    assert.equal(okay.status,0,okay.stderr);
    assert.match(okay.stdout,/success:1\.0\.123:verified_manifest_hash/);
    assert(fs.existsSync(path.join(dir,'descriptor.started')));
    assert(fs.existsSync(path.join(dir,'manifest.started')));
    const failed=shell(cmd,{MOCK_FAIL_MANIFEST:'1'});
    assert.equal(failed.status,0,failed.stderr);
    assert.match(failed.stdout,/failed/);
  }finally {fs.rmSync(dir,{recursive:true,force:true})}
});

test('healthy signed release is reused without restart; refresh/unhealthy still restart',()=>{
  const cmd=`ROOT=/tmp/awtsmoos-isolated-fixture; CANDIDATE_VERSION=1.2.3
source ${quote(path.join(root,'unix-fast-repair.sh'))}
installed_release_matches_metadata(){ return 0; }; fast_repair_root_gate(){ return 0; }
install_progress(){ :; }; install_event(){ :; }
write_activation_journal(){ :; }; service_health_summary(){ echo guardian_ok; }
skip_start_requested(){ return 1; }
current_runtime_is_stably_healthy(){ [ "${'${MOCK_HEALTHY:-1}'}" = 1 ]; }
restart_verified_release(){ echo restarted; return 0; }
repair_matching_release
echo "reused:${'${AWTSMOOS_REUSE_VERIFIED_RECOVERY_LANES:-0}'}:finished:$FAST_REPAIR_COMPLETED"`;
  const healthy=shell(cmd);assert.equal(healthy.status,0,healthy.stderr);
  assert.doesNotMatch(healthy.stdout,/restarted/);
  assert.match(healthy.stdout,/reused:1:finished:1/);
  const refresh=shell(cmd,{AWTSMOOS_INSTALL_REFRESH:'1'});
  assert.equal(refresh.status,0,refresh.stderr);assert.match(refresh.stdout,/restarted/);
  const unhealthy=shell(cmd,{MOCK_HEALTHY:'0'});
  assert.equal(unhealthy.status,0,unhealthy.stderr);assert.match(unhealthy.stdout,/restarted/);
});

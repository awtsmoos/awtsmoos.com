// B"H
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const folder=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
test('installer fetches manifest from the working API, never protected static path',()=>{
  const text=fs.readFileSync(path.join(folder,'unix-release-metadata.sh'),'utf8');
  assert.match(text,/\$origin\/api\/tunnel\/install\/manifest\.txt/);
  assert.doesNotMatch(text,/\$origin\/apps\/tunnel\/agent\/manifest\.txt/);
});
test('late readiness startup does not read an unbound local under bash nounset',()=>{
  const src=path.join(folder,'unix-late-readiness.sh');
  const script=`set -u; source "$1"; startup_phase(){ echo absent; }; startup_phase_rank(){ echo 0; }; candidate_late_readiness_grace; [[ $? == 1 ]]`;
  const r=spawnSync('bash',['-c',script,'--',src],{encoding:'utf8',timeout:3000});
  assert.equal(r.status,0,r.stderr);
  assert.doesNotMatch(r.stderr,/unbound variable/);
});

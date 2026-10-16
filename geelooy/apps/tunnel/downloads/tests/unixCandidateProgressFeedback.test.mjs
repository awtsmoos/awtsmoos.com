//B"H
// Boruch Hashem
// Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readiness=path.join(root,'unix-candidate-probe-readiness.sh');
const activation=path.join(root,'unix-activation-promotion.sh');

function exec(command){return spawnSync('bash',['-c',command],{encoding:'utf8',timeout:5000});}
test('probe progress reports exact failing lane, timing and evidence in a narrow layout',()=>{
 const sh=`source "${readiness}"; CANDIDATE_LAST_FAILURE_LANE=local_action; CANDIDATE_EVIDENCE_ALIVE=1; CANDIDATE_EVIDENCE_REGISTERED=1; CANDIDATE_EVIDENCE_ACTION=0; CANDIDATE_EVIDENCE_VERSION=1; CANDIDATE_STABLE_SAMPLES=2; candidate_probe_status_line 9000 1000 13000`;
 const r=exec(sh); assert.equal(r.status,0,r.stderr);assert.match(r.stderr,/8s elapsed/);assert.match(r.stderr,/4s remaining/);assert.match(r.stderr,/Waiting for local API response/);assert.match(r.stderr,/API:0/);assert.equal(r.stderr.includes('\x1b'),false);
 assert(r.stderr.split('\n').every(line=>line.length<=64));
});
test('successful installation retires displaced runtime by default but honors keep option',()=>{
 const s=fs.readFileSync(activation,'utf8');assert(s.includes('AWTSMOOS_KEEP_OLD_TUNNELS:-0'));assert(s.includes('schedule_displaced_cleanup "$rollback"'));assert(s.includes('Previous runtime retained as an explicit backup'));
});

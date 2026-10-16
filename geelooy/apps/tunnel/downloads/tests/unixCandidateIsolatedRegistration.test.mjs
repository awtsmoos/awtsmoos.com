//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const downloads=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const evidence=path.join(downloads,'unix-candidate-probe-readiness-evidence.sh');
const start=path.join(downloads,'unix-candidate-probe.sh');
function run(s){return spawnSync('bash',['-c',s],{encoding:'utf8',timeout:5000});}
test('isolated candidate does not wait for impossible pre-promotion relay ownership',()=>{
 const x=run(`source "${evidence}"; CANDIDATE_PROBE_ISOLATED=1; candidate_probe_registered`);
 assert.equal(x.status,0,x.stderr);
});
test('normal probe still requires actual registration evidence',()=>{
 const x=run(`source "${evidence}"; CANDIDATE_PROBE_ISOLATED=0; CANDIDATE_ROOT=/path/does/not/exist; CANDIDATE_PROBE_PID=1; candidate_probe_registered`);
 assert.notEqual(x.status,0);
});
test('startup sets isolation explicitly in parent before candidate process starts',()=>{
 assert.match(readFileSync(start,'utf8'),/CANDIDATE_PROBE_ISOLATED=1/);
});

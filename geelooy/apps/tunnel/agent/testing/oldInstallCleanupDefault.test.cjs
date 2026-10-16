//B"H
// Boruch Hashem
// Blessed is He

"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const cleanupScript = path.resolve(__dirname, "../../downloads/unix-displaced-cleanup.sh");

async function scenario(keep) {
 const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), "awts-old-installs-"));
 const root = path.join(sandbox, "current-tunnel");
 const old = ["activation-rollback-one","incomplete-two","failed-three","candidate-four","recovery-displaced-five"].map(x=>root+"."+x);
 const unrelated = path.join(sandbox,"other-user-runtime");
 fs.mkdirSync(root);fs.writeFileSync(path.join(root,"current.txt"),"keep");
 fs.mkdirSync(unrelated);fs.writeFileSync(path.join(unrelated,"other.txt"),"keep");
 for(const target of old){fs.mkdirSync(target);fs.writeFileSync(path.join(target,"obsolete.txt"),"remove");}
 const source=`ROOT="$1"; RECOVERY_ROOT="$2"; AWTSMOOS_KEEP_OLD_TUNNELS="$3"; install_event(){ :; }; source "$4"; schedule_previous_install_cleanup`;
 try {
  const p=spawnSync('bash',['-c',source,'--',root,path.join(sandbox,'recovery'),keep ? "1" : "0",cleanupScript],{encoding:'utf8',timeout:7000});
  assert.equal(p.status,0,p.stderr);
  if(!keep){const deadline=Date.now()+10000;while(old.some(x=>fs.existsSync(x))&&Date.now()<deadline)await new Promise(r=>setTimeout(r,80));}
  for(const x of old)assert.equal(fs.existsSync(x),!!keep,x);
  assert.equal(fs.existsSync(root),true);
  assert.equal(fs.readFileSync(path.join(root,'current.txt'),'utf8'),'keep');
  assert.equal(fs.existsSync(unrelated),true);
 } finally {fs.rmSync(sandbox,{recursive:true,force:true});}
}
test('verified reinstall removes old generations and preserves current root and unrelated installations',async()=>scenario(false));
test('--keep-old-tunnels retains every prior generation',async()=>scenario(true));

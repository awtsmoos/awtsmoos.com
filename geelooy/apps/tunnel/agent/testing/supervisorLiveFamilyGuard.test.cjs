//B"H
//Boruch Hashem
//Blessed is He
"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const {spawn,spawnSync}=require("node:child_process");
const downloads=path.resolve(__dirname,"../../downloads");
test("The Awtsmoos preserves a living family guard across candidate root paths",async()=>{
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),"awts-family-guard-"));
 const root=path.join(temporary,"runtime"),candidate=root+".candidate-owned-test";
 const recovery=path.join(temporary,"recovery");
 fs.mkdirSync(root);fs.mkdirSync(candidate);
 const script=path.join(root,"awtsmoos-supervisor.sh");
 fs.writeFileSync(script,"#!/bin/bash\nsleep 2\n");
 const owner=spawn("bash",[script],{stdio:"ignore"});
 await new Promise(resolve=>setTimeout(resolve,100));
 const env={...process.env,ROOT:candidate,RECOVERY_ROOT:recovery,DOWNLOADS:downloads,SUPERVISOR_PID_FILE:path.join(candidate,"supervisor.pid"),LOG:path.join(temporary,"guard.log"),OWNER:String(owner.pid)};
 const shell=[
 'set -u',
 'source "$DOWNLOADS/unix-runtime-family.sh"',
 'source "$DOWNLOADS/unix-supervisor-runtime.sh"',
 'source "$DOWNLOADS/unix-supervisor-guard.sh"',
 'guard="$(supervisor_guard_directory)"',
 'mkdir -p "$guard"',
 'printf "%s\\n" "$OWNER" > "$guard/owner.pid"',
 'acquire_supervisor_guard'
 ].join("\n");
 try{
  const result=spawnSync("bash",["-c",shell],{env,encoding:"utf8",timeout:10000});
  assert.equal(result.status,75,result.stdout+result.stderr);
  const state=path.join(recovery,"state");
  const guard=fs.readdirSync(state).find(name=>name.endsWith(".lock"));
  assert.equal(fs.readFileSync(path.join(state,guard,"owner.pid"),"utf8").trim(),String(owner.pid));
  assert.equal(fs.existsSync(env.SUPERVISOR_PID_FILE),false);
  process.kill(owner.pid,0);
  assert.match(fs.readFileSync(env.LOG,"utf8"),/live_supervisor_guard_owner_refused/);
 }finally{try{owner.kill("SIGTERM");}catch{}fs.rmSync(temporary,{recursive:true,force:true});}
});

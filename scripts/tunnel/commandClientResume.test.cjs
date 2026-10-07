// B"H
// Boruch Hashem
// Blessed is He
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {runCommand}=require('./reliableCommandClient.cjs');
const {openJournal}=require('./commandClientJournal.cjs');
const opts={pause:async()=>{},timeoutMs:1000,endpoint:'https://awtsmoos.com/owned'};
function fixture(){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'awtsmoos-client-resume-'));return {dir,file:path.join(dir,'state.json')};}
test('dispatch reply loss resumes by observing saved identity exactly once',async()=>{
 const f=fixture();const calls=[];
 try{
  await assert.rejects(runCommand(async p=>{calls.push(p);throw Error('connection_lost_after_send');},'owned-command',{...opts,checkpointFile:f.file}),/connection_lost/);
  const initial=calls[0];
  const r=await runCommand(async p=>{calls.push(p);return {exitCode:0,stdout:'once'};},'owned-command',{...opts,checkpointFile:f.file});
  assert.equal(r.stdout,'once');assert.equal(calls[1].action,'retryAction');
  assert.equal(calls[1].controlRequestId,initial.controlRequestId);
  assert.equal(calls[1].clientRequestId,initial.clientRequestId);
  assert.equal(calls[1].traceId,initial.traceId);
  assert.equal(calls.filter(p=>p.action==='commandRun').length,1);
  const cached=await runCommand(async()=>{throw Error('must_not_dispatch');},'owned-command',{...opts,checkpointFile:f.file});
  assert.equal(cached.stdout,'once');
  assert.ok(fs.readFileSync(f.file,'utf8').includes('request_sent'));
  assert.equal(fs.statSync(f.file).mode&0o777,0o600);
 }finally{fs.rmSync(f.dir,{recursive:true,force:true});}
});
test('output resume keeps cursor and never appends an already committed page twice',async()=>{
 const f=fixture();const calls=[];
 const api=async p=>{calls.push(p);if(p.action==='commandRun')return {jobId:'j1',done:true,exitCode:0};
  if(p.stream==='stderr')return {content:'',hasNextPage:false};
  if(p.offsetChars===0)return {content:'first',hasNextPage:true,nextOffsetChars:5};
  throw Error('offline');};
 try{
  await assert.rejects(runCommand(api,'owned-command',{...opts,checkpointFile:f.file}),/offline/);
  const r=await runCommand(async p=>{assert.equal(p.action,'commandJobOutputPage');return {content:p.stream==='stdout'?'last':'',hasNextPage:false};},'owned-command',{...opts,checkpointFile:f.file});
  assert.equal(r.stdout,'firstlast');
  assert.equal(calls.filter(p=>p.action==='commandRun').length,1);
 }finally{fs.rmSync(f.dir,{recursive:true,force:true});}
});
test('checkpoint refuses changed command and changed endpoint',async()=>{
 const f=fixture();
 try{
  await runCommand(async()=>({exitCode:0}),'original',{...opts,checkpointFile:f.file});
  await assert.rejects(runCommand(async()=>({exitCode:0}),'changed',{...opts,checkpointFile:f.file}),/binding_conflict/);
  await assert.rejects(runCommand(async()=>({exitCode:0}),'original',{...opts,endpoint:'https://other.example/owned',checkpointFile:f.file}),/binding_conflict/);
 }finally{fs.rmSync(f.dir,{recursive:true,force:true});}
});
test('two clients cannot own one checkpoint',()=>{
 const f=fixture(),j=openJournal(f.file,{command:'one'});
 try{j.save();assert.throws(()=>openJournal(f.file,{command:'one'}),/living_process/);}
 finally{j.close();fs.rmSync(f.dir,{recursive:true,force:true});}
});
test('corrupt state stays corrupt and cannot silently redispatch',async()=>{
 const f=fixture();fs.writeFileSync(f.file,'broken json',{mode:0o600});
 try{
  let calls=0;await assert.rejects(runCommand(async()=>{calls++;return {exitCode:0};},'one',{...opts,checkpointFile:f.file}));
  assert.equal(calls,0);assert.equal(fs.readFileSync(f.file,'utf8'),'broken json');
 }finally{fs.rmSync(f.dir,{recursive:true,force:true});}
});
test('redacted trace excludes command and stdout bodies',async()=>{
 const trace=[];
 await runCommand(async()=>({exitCode:0,stdout:'secret-output'}),'secret-command',{...opts,onTrace:e=>trace.push(e)});
 const s=JSON.stringify(trace);assert.ok(!s.includes('secret-command'));assert.ok(!s.includes('secret-output'));
 assert.equal(new Set(trace.map(e=>e.traceId)).size,1);
});

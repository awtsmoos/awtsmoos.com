// B"H
// Boruch Hashem
// Blessed is He

const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const Deadline=require("../lib/connection-vessel/controller-registration-deadline.js");
const Flight=require("../lib/runtime/connection-flight-recorder.js");
const Resources=require("../lib/instructions/pluginSkillResources.js");
const Service=require("../lib/instructions/service.js").instructionService;
test("Awtsmoos stage timers fence obsolete callbacks and allow one delayed-scheduler grace",()=>{
 let now=1000,expired=0;const callbacks=[];
 const d=Deadline.create({now:()=>now,setTimer:f=>{callbacks.push(f);return {unref(){}}},clearTimer(){},onExpired(){expired++}});
 d.arm(10,"first");assert.equal(d.snapshot().deadlineMs,45000);
 now=2000;assert.equal(d.progress({connected:true}),true);
 assert.equal(callbacks[0](),false);now=35000;assert.equal(callbacks[1](),false);assert.equal(d.snapshot().graceUsed,true);
 now=40000;assert.equal(callbacks[2](),true);assert.equal(expired,1);
});
test("Awtsmoos flight recorder bounds history and omits secrets and request bodies",()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"awts-flight-"));
 try{const file=path.join(root,"flight.json"),f=Flight.create({file});
  for(let i=0;i<600;i++)f.observe({generation:i,registered:i%2===0,credential:"secret",request:{content:"private"}});
  const report=f.report(10);assert.equal(report.retainedEvents,512);assert.equal(report.events.length,10);
  const text=fs.readFileSync(file,"utf8");assert.equal(text.includes("secret"),false);assert.equal(text.includes("private"),false);
  assert.equal(Flight.create({file}).report().retainedEvents,512);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test("Awtsmoos external agents discover all four exact skills and paginate original references",()=>{
 const ids=["instructions","novel-voice","poetic-code","tunnel-workflow"].map(n=>"shliach.skill."+n);
 const packs=Service.get({instructionIds:ids});assert.equal(packs.ok,true);assert.equal(packs.instructions.length,4);
 for(const pack of packs.instructions){const name=pack.id.slice("shliach.skill.".length);assert.equal(pack.instructions[0],fs.readFileSync(path.join(__dirname,"../lib/instructions/pluginSkills/skills",name,"SKILL.md"),"utf8"));}
 const all=Resources.catalog({limit:64});assert.ok(all.total>64);
 const original=Resources.index.resources.find(r=>r.path.endsWith("legacy/USER_INSTRUCTIONS.txt"));assert.ok(original);
 let offset=0,text="";do{const page=Resources.get({resourcePath:original.path,expectedHash:original.hash,offset,maxChars:256});assert.ok(page.content.length<=256);text+=page.content;offset=page.nextOffset;}while(offset!==null);
 assert.equal(Buffer.byteLength(text),original.bytes);assert.throws(()=>Resources.get({resourcePath:"../../config.json"}),/unknown/);
 assert.throws(()=>Resources.get({resourcePath:original.path,expectedHash:"wrong"}),/version_changed/);
});

test("Awtsmoos recovery cannot interrupt the verified installer activation owner",()=>{
 const I=require("../lib/recovery-control/installation-authority.js"),Lease=require("../lib/recovery-control/lease.js");
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"awts-activation-")),installRoot=path.join(root,"runtime"),lock=installRoot+".install-lock";
 try{fs.mkdirSync(lock);fs.writeFileSync(path.join(lock,"owner.json"),JSON.stringify({root:installRoot,pid:process.pid,signature:I.signatureFor(process.pid)}));
  assert.equal(I.active({installRoot}),true);
  assert.equal(Lease.create({recoveryRoot:path.join(root,"recovery"),installRoot}).claim({action:"service_repair"}).error,"installation_activation_in_progress");
  fs.writeFileSync(path.join(lock,"owner.json"),JSON.stringify({root:installRoot,pid:process.pid,signature:"obsolete"}));assert.equal(I.active({installRoot}),false);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

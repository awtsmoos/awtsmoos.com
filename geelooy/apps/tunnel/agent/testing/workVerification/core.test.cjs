// B"H
// Boruch Hashem
// Blessed is He
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),os=require("node:os"),path=require("node:path");
const Store=require("../../tools/fs/workSession/store.js"),Gate=require("../../tools/fs/workSession/gate.js");
const {buildWorkSessionActions}=require("../../tools/fs/workSession/actions.js");
const {execFileSync}=require("node:child_process");
const {buildFsPayload}=require("../../../../../api/tunnel/control/core/tunnelPayload/build.js");
const {requiredScope}=require("../../../../../api/tunnel/control/core/tunnelPayload/scope.js");
test("durable revision gate rejects concurrent lost updates and fresh process reads state",async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"awtsmoos-work-")),c={deviceStateRoot:root};
 try{
  await Store.create(c,{id:"owned",revision:1,remainingWork:["one"]});
  const outcomes=await Promise.allSettled([Store.update(c,"owned",1,s=>({...s,nextAction:"a"})),Store.update(c,"owned",1,s=>({...s,nextAction:"b"}))]);
  assert.equal(outcomes.filter(x=>x.status==="fulfilled").length,1);
  assert.match(outcomes.find(x=>x.status==="rejected").reason.message,/revision_conflict/);
  const code="require("+JSON.stringify(path.resolve(__dirname,"../../tools/fs/workSession/store.js"))+").get("+JSON.stringify(c)+",'owned').then(x=>console.log(JSON.stringify(x)))";
  assert.equal(JSON.parse(execFileSync(process.execPath,["-e",code],{encoding:"utf8"})).revision,2);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test("release gate refuses dirty source, stale instructions, unfinished work, fake browser proof and missing review",()=>{
 const now=Date.now(),repo={ok:true,clean:true,commit:"a"},s={commit:"a",status:"complete",instructions:{ready:true,acknowledged:true},completed:["done"],remainingWork:[],nextAction:"",frontend:true,urls:["https://awtsmoos.com/"],reviews:{}};
 assert.equal(Gate.evaluate(s,repo).ok,false);
 const report={id:"r",source:"real-chrome",url:s.urls[0],commit:"a",createdAt:new Date(now).toISOString(),ok:true,commitVerified:true,interactionVerified:true,styleAssertionsVerified:true,samples:[{width:390,screenshotSha256:"x"},{width:1440,screenshotSha256:"y"}]};
 assert.ok(Gate.evaluate(s,repo,[report]).reasons.some(x=>x.startsWith("visual_review_missing")));
 s.reviews.r={hashes:["x","y"]};assert.equal(Gate.evaluate(s,repo,[report]).ok,true);
 for(const change of [{clean:false},{commit:"b"}])assert.equal(Gate.evaluate(s,{...repo,...change},[report]).ok,false);
 assert.equal(Gate.evaluate({...s,remainingWork:["more"]},repo,[report]).ok,false);
 assert.equal(Gate.evaluate(s,repo,[{...report,source:"node-dom"}]).ok,false);
 assert.equal(Gate.evaluate(s,repo,[{...report,createdAt:"bad"}]).ok,false);
});
test("new native work actions carry structured fields while mutations retain write authority",()=>{
 for(const action of ["tunnelWorkBegin","tunnelWorkCheckpoint","tunnelWorkRefresh","tunnelWorkReview"])assert.equal(requiredScope(action),"tunnel.write");
 for(const action of ["tunnelWorkGet","tunnelWorkResume","tunnelWorkGate"])assert.equal(requiredScope(action),"tunnel.read");
 const v=buildFsPayload({$_POST:{action:"tunnelWorkCheckpoint",params:{workId:"owned",revision:2,remainingWork:["next"],reportIds:["r"]}}});
 assert.equal(v.workId,"owned");assert.equal(v.revision,2);assert.deepEqual(v.reportIds,["r"]);
});
test("frontend instructions are actually discoverable and fetchable",()=>{
 const {instructionService}=require("../../lib/instructions/service.js");
 const r=instructionService.resolve({task:"fix frontend css mobile page",paths:["geelooy/test.css"],mode:"write"});
 for(const id of ["frontend.automated-integrity","frontend.visual-verification","frontend.system-map","work.durable-verification"])assert.ok(r.requiredInstructionIds.includes(id),id);
 assert.equal(instructionService.get({instructionIds:r.requiredInstructionIds}).ok,true);
});
test("begin and checkpoint use real Git identity and exact fetched instruction acknowledgement",async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),"awtsmoos-work-git-"));
 try{
  execFileSync("git",["init","-q",root]);execFileSync("git",["-C",root,"-c","user.name=Awtsmoos","-c","user.email=test@example.invalid","commit","--allow-empty","-qm","owned"]);
  const config={root,deviceStateRoot:path.join(root,"state"),allowWrite:true},ws={instructionRequest:async(op)=>op==="resolve"?{serverAvailable:true,requiredInstructionIds:["fixture"],serverInstructionGeneration:"one"}:{ok:true,serverAvailable:true,instructions:[{id:"fixture",instructions:["Awtsmoos"]}]}};
  const begin=await buildWorkSessionActions({config,ws,payload:{task:"owned fixture"}}).tunnelWorkBegin();
  const p={workId:begin.session.id,revision:1,instructionHash:begin.session.instructions.hash,completed:["inspected"],remainingWork:[],nextAction:""};
  const saved=await buildWorkSessionActions({config,ws,payload:p}).tunnelWorkCheckpoint();
  assert.equal(saved.session.instructions.acknowledged,true);
  await assert.rejects(buildWorkSessionActions({config,ws,payload:{...p,revision:2,instructionHash:"bad"}}).tunnelWorkCheckpoint(),/instruction_hash_changed/);
  await assert.rejects(buildWorkSessionActions({config:{...config,allowWrite:false},ws,payload:{task:"no"}}).tunnelWorkBegin(),/write_disabled/);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});

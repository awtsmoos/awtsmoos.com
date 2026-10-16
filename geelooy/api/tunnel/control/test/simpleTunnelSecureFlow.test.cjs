// B"H
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Simple = require("../routes/simpleTunnel.js");
const Auth = require("../routes/simpleTunnelAuth.js");

const directory = fs.mkdtempSync(path.join(os.tmpdir(), "awts-simple-test-"));
const clientKey = crypto.randomBytes(32).toString("hex");
const agentMasterKey = crypto.randomBytes(32).toString("hex");
const agentKey = Auth.agentKeyFor(agentMasterKey, "mac");
process.env.AWTSMOOS_SIMPLE_TUNNEL_CLIENT_KEY = clientKey;
process.env.AWTSMOOS_SIMPLE_TUNNEL_AGENT_KEY = agentMasterKey;
process.env.AWTSMOOS_SIMPLE_TUNNEL_STORE = path.join(directory, "queue.json");

function context({method="GET",query={},body={},client=false,agent=false} = {}) {
  return {
    request: {method, headers: {
      ...(client ? {"x-awtsmoos-simple-client-key":clientKey} : {}),
      ...(agent ? {"x-awtsmoos-simple-agent-key":Auth.agentKeyFor(agentMasterKey, query.agentId || body.agentId || "mac")} : {})
    },body},
    paramKinds: {GET:query,POST:body}
  };
}
function result(raw) { return {code:raw.statusCode,...JSON.parse(raw.response)}; }
function signed(purpose,fields,base) {
  const expires=Date.now()+120_000,nonce=crypto.randomBytes(18).toString("base64url");
  return context({method:"GET",query:{...base,nonce,expires:String(expires),sig:Auth.signature(clientKey,purpose,{...fields,nonce,expires:String(expires)})}});
}

test.after(()=>{fs.rmSync(directory,{recursive:true,force:true});});

test("without credentials every queue, poll, result and status route denies access",async()=>{
  const cases = [
    [Simple.queueCommand,{query:{agentId:"mac",command:"pwd"}}],
    [Simple.pollCommand,{query:{agentId:"mac"}}],
    [Simple.postResult,{method:"POST",body:{agentId:"mac",id:"simple_wrong",output:"forged"}}],
    [Simple.getResult,{query:{id:"simple_wrong"}}],
    [Simple.status,{}],
    [Simple.requestApproval,{method:"POST",body:{agentId:"mac"}}],
    [Simple.checkApproval,{query:{agentId:"mac"}}]
  ];
  for(const [handler,args] of cases) {
    const r=result(await handler(context(args)));
    assert.equal(r.ok,false);
    assert.equal(r.code,403);
  }
});

test("client and agent credentials are independent; real queue, poll, POST and GET roundtrip",async()=>{
  const unauthorized = result(await Simple.queueCommand(context({agent:true,query:{agentId:"mac",command:"echo hello"}})));
  assert.equal(unauthorized.code,403);
  const queued = result(await Simple.queueCommand(context({client:true,query:{agentId:"mac",command:"echo hello"}})));
  assert.equal(queued.ok,true);
  assert.match(queued.id,/^simple_[A-Za-z0-9_-]{32,80}$/);
  const someoneElse=result(await Simple.pollCommand(context({agent:true,query:{agentId:"linux"}})));
  assert.equal(someoneElse.command,null);
  const retrieved=result(await Simple.pollCommand(context({agent:true,query:{agentId:"mac"}})));
  assert.equal(retrieved.command,"echo hello");
  assert.equal(retrieved.id,queued.id);
  const pending=result(await Simple.getResult(context({client:true,query:{id:queued.id}})));
  assert.equal(pending.done,false);
  const forged=result(await Simple.postResult(context({method:"POST",agent:true,body:{id:queued.id,agentId:"linux",output:"fraud"}})));
  assert.equal(forged.ok,false);
  const posted=result(await Simple.postResult(context({method:"POST",agent:true,body:{id:queued.id,agentId:"mac",output:"hello\n",exitCode:0}})));
  assert.equal(posted.ok,true);
  const final=result(await Simple.getResult(context({client:true,query:{id:queued.id}})));
  assert.equal(final.done,true);
  assert.equal(final.output,"hello\n");
  assert.equal(final.exitCode,0);
  const once=result(await Simple.getResult(context({client:true,query:{id:queued.id}})));
  assert.equal(once.done,false);
});

test("signed GET URLs expire, bind the command/target, and reject replay",async()=>{
  const cmd="pwd",agentId="mac";
  const signedRequest=signed("cmd",{command:cmd,agentId},{command:cmd,agentId});
  const made=result(await Simple.queueCommand(signedRequest));
  assert.equal(made.ok,true);
  const replay=result(await Simple.queueCommand(signedRequest));
  assert.equal(replay.error,"REPLAY_DETECTED");
  const altered=context({query:{...signedRequest.paramKinds.GET,command:"uname -a"}});
  assert.equal(result(await Simple.queueCommand(altered)).code,403);
  const expired=signed("cmd",{command:cmd,agentId},{command:cmd,agentId});
  expired.paramKinds.GET.expires=String(Date.now()-1000);
  assert.equal(result(await Simple.queueCommand(expired)).code,403);
  const read=signed("result",{id:made.id},{id:made.id});
  assert.equal(result(await Simple.getResult(read)).done,false);
  const work=result(await Simple.pollCommand(context({agent:true,query:{agentId}})));
  assert.equal(work.id,made.id);
  assert.equal(result(await Simple.postResult(context({method:"POST",agent:true,body:{id:made.id,agentId,output:"/workspace\n",exitCode:0}}))).ok,true);
  assert.equal(result(await Simple.getResult(read)).output,"/workspace\n");
  assert.equal(result(await Simple.getResult(read)).error,"REPLAY_DETECTED");
});

test("a credential scoped to one agent cannot poll or submit for another", async () => {
  const request=context({ query: { agentId: "linux" } });
  request.request.headers["x-awtsmoos-simple-agent-key"] = agentKey;
  const denied=result(await Simple.pollCommand(request));
  assert.equal(denied.code,403);
  assert.equal(denied.ok,false);
});

test("configured source credential is mandatory",async()=>{
  const prior=process.env.AWTSMOOS_SIMPLE_TUNNEL_CLIENT_KEY;
  delete process.env.AWTSMOOS_SIMPLE_TUNNEL_CLIENT_KEY;
  try {
    const r=result(await Simple.status(context({client:true})));
    assert.equal(r.code,503);
    assert.equal(r.error,"simple_tunnel_not_configured");
  } finally { process.env.AWTSMOOS_SIMPLE_TUNNEL_CLIENT_KEY=prior; }
});

// B"H
const test=require('node:test'),assert=require('node:assert/strict'),http=require('node:http');
const {createGuardian}=require('./guardianServer.cjs');
const {createClient}=require('./guardianClient.cjs');
const {attachBridge}=require('./guardianBridge.cjs');
function fixture(){
 const ws={tunnelClients:new Map(),clients:new Set(),async sendTunnelRequest(accountId,ref,payload){return {ok:true,accountId,ref,payload}},async sendTunnelRecoveryControl(){return {ok:true}},sendToAlias(){return true},handleUpgrade(_r,sock){sock.destroy()}};
 const entry={isTunnel:true,accessKind:'device',accountId:'owner-a',tunnelId:'t-a',tunnelName:'awt-test-mac',deviceId:'dev-a',registrationKey:'owner-a:t-a',lastSeenAt:Date.now(),isAlive:true,connected:true};ws.tunnelClients.set(entry.registrationKey,entry);return ws;
}
test('independent guardian stays online across website listener restart; RPC stays authorized',async()=>{
 const secret='f'.repeat(64),guardian=createGuardian({secret,ws:fixture(),disableCookieAuth:true});
 const addr=await guardian.listen(0);const client=createClient({secret,port:addr.port});
 const site=http.createServer((_r,res)=>res.end('site'));await new Promise(r=>site.listen(0,'127.0.0.1',r));
 try{
  const sent=await client.sendTunnelRequest('owner-a','t-a',{action:'read',path:'/safe'},1000);
  assert.equal(sent.ok,true);assert.equal(sent.ref,'t-a');
  const live=await client.clients();assert.equal(live.clients.length,1);
  await new Promise(r=>site.close(r));
  const after=await client.sendTunnelRequest('owner-a','t-a',{action:'status'},1000);
  assert.equal(after.ok,true);
  assert.equal((await client.clients()).clients[0].tunnelName,'awt-test-mac');
 }finally{await new Promise(r=>guardian.server.close(r));}
});
test('loopback RPC rejects absent or incorrect secret',async()=>{
 const guardian=createGuardian({secret:'c'.repeat(64),ws:fixture(),disableCookieAuth:true});const addr=await guardian.listen(0);
 try{
  for(const key of ['', 'wrong']){
   const result=await new Promise((resolve,reject)=>{const r=http.get({host:'127.0.0.1',port:addr.port,path:'/rpc/devices',headers:{'x-awtsmoos-guardian-key':key}},res=>{res.resume();res.on('end',()=>resolve(res.statusCode))});r.on('error',reject)});
   assert.equal(result,403);
  }
 }finally{await new Promise(r=>guardian.server.close(r));}
});
test('HTTP bridge obtains read-only current-device snapshots and forwards requests without mutation duplication',async()=>{
 const secret='d'.repeat(64),guardian=createGuardian({secret,ws:fixture(),disableCookieAuth:true});const addr=await guardian.listen(0);
 const ws={tunnelClients:new Map(),clients:new Set()};const bridge=attachBridge(ws,{secret,port:addr.port,refreshMs:10000});
 try{
  await bridge.refresh();assert.equal(ws.tunnelClients.size,1);
  const response=await ws.sendTunnelRequest('owner-a','t-a',{action:'test'},1000);assert.equal(response.ok,true);
  assert.equal(response.payload.action,'test');
 }finally{bridge.stop();await new Promise(r=>guardian.server.close(r))}
});
test('real authenticated WebSocket registration survives an unrelated HTTP website restart',async()=>{
 if(typeof WebSocket!=='function')return;
 const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
 const {provenBinding}=require('../../../geelooy/api/tunnel/control/core/test/provenanceFixture.cjs');
 const Secrets=require('../../../geelooy/api/tunnel/control/core/tunnelSecurity/secrets.js');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'awts-guardian-ws-'));
 process.env.AWTSMOOS_TUNNEL_CONTROL_STORE=path.join(dir,'store.json');
 const {writeStore}=require('../../../geelooy/api/tunnel/control/core/store.js');
 const deviceCredential='fixture-device-credential-20261018';
 writeStore({tunnelBindings:{tun_guardian:provenBinding({tunnelId:'tun_guardian',tunnelName:'guard-mac-test',deviceId:'mac-test-1',ownerAccountId:'owner-a',credentialDigest:Secrets.digest(deviceCredential)})},tunnelGrants:{},tunnelPairings:{},tunnelAudit:[]});
 const guardian=createGuardian({secret:'g'.repeat(64),disableCookieAuth:true});
 const addr=await guardian.listen(0);
 const site=http.createServer((_r,res)=>res.end('site'));
 await new Promise(r=>site.listen(0,'127.0.0.1',r));
 const webSocket=new WebSocket(`ws://127.0.0.1:${addr.port}/`);
 try{
  await new Promise((resolve,reject)=>{webSocket.addEventListener('open',resolve,{once:true});webSocket.addEventListener('error',reject,{once:true})});
  const ack=new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('guardian_registration_ack_timeout')),2500);webSocket.addEventListener('message',event=>{try{const message=JSON.parse(event.data);if(message.type==='TUNNEL_ACK'){clearTimeout(timeout);resolve(message)}}catch{};})});
  webSocket.send(JSON.stringify({type:'TUNNEL_REGISTER',name:'guard-mac-test',tunnelName:'guard-mac-test',tunnelId:'tun_guardian',deviceId:'mac-test-1',deviceCredential,agentVersion:'fixture-1',vesselType:'native',protocolVersion:'awtsmoos-tunnel-v3',capabilities:{fsRead:true}}));
  const registration=await ack;
  assert.equal(registration.ok,true,JSON.stringify(registration));
  assert.equal(guardian.ws.tunnelClients.size,1);
  await new Promise(resolve=>site.close(resolve));
  assert.equal(webSocket.readyState,WebSocket.OPEN);
  const state=await createClient({secret:'g'.repeat(64),port:addr.port}).clients();
  assert.equal(state.clients.length,1);
  assert.equal(state.clients[0].tunnelName,'guard-mac-test');
 }finally{
  webSocket.close();
  for(const c of guardian.ws.clients)c.socket.destroy();
  guardian.server.closeAllConnections?.();
  await new Promise(resolve=>guardian.server.close(resolve));
  delete process.env.AWTSMOOS_TUNNEL_CONTROL_STORE;
  fs.rmSync(dir,{recursive:true,force:true});
 }
});

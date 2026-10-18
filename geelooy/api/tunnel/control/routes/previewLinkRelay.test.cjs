// B"H
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {provenBinding}=require('../core/test/provenanceFixture.cjs');
const Relay=require('./previewLinkRelay.js');
function fixture(){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'awts-preview-link-relay-'));process.env.AWTSMOOS_TUNNEL_CONTROL_STORE=path.join(dir,'store.json');const {writeStore}=require('../core/store.js');writeStore({tunnelBindings:{tun_a:provenBinding({tunnelId:'tun_a',tunnelName:'awt-test-mac',ownerAccountId:'owner-a'})},tunnelGrants:{},tunnelPairings:{},tunnelAudit:[]});return ()=>{fs.rmSync(dir,{recursive:true,force:true});delete process.env.AWTSMOOS_TUNNEL_CONTROL_STORE};}
function context(result){const headers={};const calls=[];return {calls,headers,request:{method:'GET',headers:{authorization:'Bearer '+ 'b'.repeat(64),cookie:'other=1; awtsmoos_preview=token; z=3'}},response:{statusCode:200,setHeader(k,v){headers[k.toLowerCase()]=v}},paramKinds:{GET:{path64:Buffer.from('/page?x=1').toString('base64')}},ws:{async sendTunnelRequest(...a){calls.push(a);return result}}};}
test('approved device receives token only as credential, and binary remains exact',async()=>{const cleanup=fixture();try{const id='pl_'+ 'b'.repeat(24),bytes=Buffer.from([0,255,7,128]);const c=context({ok:true,status:206,body64:bytes.toString('base64'),headers:{'content-type':'application/octet-stream','set-cookie':'bad','content-range':'bytes 0-3/4'}});const output=await Relay.previewLinkRelay(c,{tunnelName:'awt-test-mac',tokenId:id});assert.deepEqual(output,bytes);assert.equal(c.calls.length,1);assert.equal(c.calls[0][0],'owner-a');assert.equal(c.calls[0][1],'awt-test-mac');assert.equal(c.calls[0][2].action,'previewLinkProxy');assert.equal(c.calls[0][2].path,'/page?x=1');assert.equal(c.calls[0][2].headers.cookie,'awtsmoos_preview=token');assert(!c.calls[0][2].headers.cookie.includes('other=1'));assert.equal(c.headers['set-cookie'],undefined);assert.equal(c.headers['content-security-policy'],'sandbox allow-scripts allow-forms');assert.equal(c.response.statusCode,206);}finally{cleanup()}});
test('invalid, unknown, revoked and ambiguous bindings are not relayed',async()=>{const cleanup=fixture();try{const id='pl_'+'c'.repeat(24);for(const vars of [{tunnelName:'awt-test-mac',tokenId:'bad'},{tunnelName:'unknown',tokenId:id}]){const c=context({ok:true});const r=await Relay.previewLinkRelay(c,vars);assert.equal(r.ok,false);assert.equal(c.calls.length,0);}const {readStore,writeStore}=require('../core/store.js');let store=readStore();store.tunnelBindings.tun_b=provenBinding({tunnelId:'tun_b',tunnelName:'awt-test-mac'});writeStore(store);assert.equal(Relay.ownerFor('awt-test-mac'),null);store.tunnelBindings.tun_b.revokedAt='2026-10-18T00:00:00Z';writeStore(store);assert(Relay.ownerFor('awt-test-mac'));}finally{cleanup()}});
test('no device claim is ever made for mutation requests',async()=>{const cleanup=fixture();try{const c=context({ok:true});c.request.method='POST';const r=await Relay.previewLinkRelay(c,{tunnelName:'awt-test-mac',tokenId:'pl_'+'a'.repeat(24)});assert.equal(r.status,405);assert.equal(c.calls.length,0);}finally{cleanup()}});
test('browser access requires token in fragment and reveals no target bytes before the cookie exists',async()=>{
 const cleanup=fixture();try{
  const id='pl_'+'e'.repeat(24);const c=context({ok:true});
  c.request.headers={};const response=await Relay.previewLinkRelay(c,{tunnelName:'awt-test-mac',tokenId:id,tail:'foo/bar.html'});
  assert.equal(typeof response,'string');assert.match(response,/Private preview/);
  assert.match(response,/location.hash/);assert.match(response,/SameSite=Strict/);
  assert.equal(c.calls.length,0);
  assert.match(c.headers['content-security-policy'],/default-src 'none'/);
  assert.equal(Relay.requestPath({request:{url:'/x?z=3'},paramKinds:{GET:{}}},{tail:'nested/main.css'}),'/nested/main.css?z=3');
 }finally{cleanup()}
});

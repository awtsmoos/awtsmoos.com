// B"H
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn } = require('node:child_process');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'awts-api-key-'));
const prior = process.env.AWTSMOOS_TUNNEL_CONTROL_STORE;
process.env.AWTSMOOS_TUNNEL_CONTROL_STORE = path.join(root, 'tunnel-control.json');
const Keys = require('../apiKeyStore.js');
const Store = require('../store.js');
async function main() {
	try {
	const until = Date.now()+120_000;
	const first = Keys.createApiKeyRecord({userId:'ownerA', name:'scoped-expiry-test', scopes:['tunnel.command'], expiresAt: until});
	assert.equal(first.key.expiresAt, until);
	assert.equal(Keys.verifyApiKey(first.rawKey).ok, true);
	assert.equal(Keys.verifyApiKey(first.rawKey).ok, true);
	assert.equal(Keys.enforceApiKeyRate({kind:'apiKey',keyId:first.key.keyId}).ok, true);
	Store.mutateStore(store => {store.apiKeys[first.key.keyId].expiresAt=Date.now()-1;});
	assert.equal(Keys.verifyApiKey(first.rawKey).ok, false);
	assert.equal(Keys.enforceApiKeyRate({kind:'apiKey',keyId:first.key.keyId}).ok, false);
	assert.throws(() => Keys.createApiKeyRecord({userId:'ownerA',expiresAt:Date.now()-1}),/api_key_expiry_invalid/);
	const limited=Keys.createApiKeyRecord({userId:'ownerA', rateLimitPerMinute:2, bytesPerDay:100});
	const Usage = require('../usageStore.js');
	assert.equal(Keys.enforceApiKeyRate({kind:'apiKey',keyId:limited.key.keyId}).ok,true);
	Usage.recordUsage({userId:'ownerA',keyId:limited.key.keyId,action:'read',bytes:40,ok:true});
	assert.equal(Keys.enforceApiKeyRate({kind:'apiKey',keyId:limited.key.keyId},50).ok,true);
	assert.equal(Keys.enforceApiKeyRate({kind:'apiKey',keyId:limited.key.keyId},61).error,'daily_byte_limit_exceeded');
	Usage.recordUsage({userId:'ownerA',keyId:limited.key.keyId,action:'read',bytes:40,ok:true});
	assert.equal(Keys.enforceApiKeyRate({kind:'apiKey',keyId:limited.key.keyId}).error,'rate_limited');
	Keys.revokeApiKeyRecord('ownerA',limited.key.keyId);
	const second=Keys.createApiKeyRecord({userId:'ownerA'});
	assert.equal(second.key.expiresAt,null);
	assert.equal(Keys.verifyApiKey(second.rawKey).ok,true);
	assert.equal(Keys.revokeApiKeyRecord('foreign',second.key.keyId),false);
	assert.equal(Keys.verifyApiKey(second.rawKey).ok,true);
	assert.equal(Keys.revokeApiKeyRecord('ownerA',second.key.keyId),true);
	assert.equal(Keys.verifyApiKey(second.rawKey).ok,false);
	// Two independent writers cannot replace each other's atomic account records.
	const source=JSON.stringify(path.resolve(__dirname,'../apiKeyStore.js'));
	const code=`require(${source}).createApiKeyRecord({userId:'ownerA'});`;
	const writers = await Promise.all(Array.from({length:3},()=>new Promise((resolve,reject)=>{
		const child = spawn(process.execPath,['-e',code],{env:process.env,stdio:['ignore','ignore','pipe']});
		let stderr=''; child.stderr.on('data',chunk=>stderr+=chunk);
		child.on('error',reject);
		child.on('exit',status=>status===0?resolve():reject(new Error(stderr||`writer_exit_${status}`)));
	})));
	assert.equal(writers.length,3);
	assert.equal(Keys.listApiKeys('ownerA').length,6);
	console.log(JSON.stringify({ok:true,suite:'api-key-store-atomic-expiry',keys:6}));
	} finally {
	if (prior===undefined) delete process.env.AWTSMOOS_TUNNEL_CONTROL_STORE;
	else process.env.AWTSMOOS_TUNNEL_CONTROL_STORE=prior;
	fs.rmSync(root,{recursive:true,force:true});
	}
}
main().catch(error=>{console.error(error);process.exitCode=1});

// B"H
// Boruch Hashem
// Blessed is He
/** The Awtsmoos makes each gate a promise true; Awtsmoos.com tests what strangers cannot do. */
const test = require('node:test');
const assert = require('node:assert/strict');
const {getOperation} = require('../docs/appApiCatalog.js');
const {allowsIdentity,checkOperation} = require('./appApiAccountGuard.js');
const {childContext,normalizePayload} = require('./appApiChildContext.js');
const identity = {ok:true,kind:'oauth',userId:'alice',scopes:['awtsmoos.api']};
const values = new Map([
	['/users/alice/aliases/coby',{aliasId:'coby'}],
	['/social/heichelos/private/info',{author:'other'}],
	['/social/heichelos/public/info',{author:'other'}],
	['/social/heichelos/public/public',true],
	['/social/heichelos/owned/info',{author:'coby'}],
	['/social/heichelos/private',{info:{author:'other'}}]
]);
const context = {db:{get:async path => values.get(path)},request:{method:'POST',headers:{}}};
async function guard(id, params={}, body={}, query={}) {
	const op = getOperation(id);
	return checkOperation(context,identity,op,normalizePayload(op,{params,body,query}));
}
test('OAuth must contain the application scope and use POST', () => {
	const op = getOperation('identity.get');
	assert.equal(allowsIdentity(context,identity,op),true);
	assert.equal(allowsIdentity(context,{...identity,scopes:['tunnel.write']},op),false);
	assert.equal(allowsIdentity({request:{method:'GET'}},identity,op),false);
});
test('signed-in browser must be same origin JSON and cannot invoke mail', () => {
	const browser = {request:{method:'POST',user:{loggedIn:true},headers:{origin:'https://awtsmoos.com','sec-fetch-site':'same-origin','content-type':'application/json'}}};
	const session = {...identity,kind:'session',scopes:[]};
	assert.equal(allowsIdentity(browser,session,getOperation('identity.get')),true);
	assert.equal(allowsIdentity(browser,session,getOperation('mail.send')),false);
	browser.request.headers.origin='https://other.example';
	assert.equal(allowsIdentity(browser,session,getOperation('identity.get')),false);
});
test('owned alias and unique heichel ID required', async () => {
	assert.equal(await guard('heichel.create',{alias:'other'},{heichelId:'new'}),'alias_not_owned');
	assert.equal(await guard('heichel.create',{alias:'coby'},{heichelId:'private'}),'heichel_id_taken');
	assert.equal(await guard('heichel.create',{alias:'coby'},{heichelId:'new'}),null);
	assert.equal(await guard('heichel.create',{alias:'../other'},{heichelId:'new'}),'invalid_path_id');
});
test('private heichel data is restricted to owned memberships', async () => {
	assert.equal(await guard('heichel.get',{heichel:'private'}),'heichel_not_visible');
	assert.equal(await guard('heichel.get',{heichel:'public'}),null);
	assert.equal(await guard('heichel.get',{heichel:'owned'}),null);
});
test('child context cannot accept caller-supplied identity', async () => {
	const op = getOperation('alias.create');
	const payload = normalizePayload(op,{body:{aliasId:'coby',aliasName:'Coby',userid:'other',__raw_body__:'injection'}});
	const {child} = childContext(context,identity,op,payload);
	assert.equal(child.request.user.info.userId,'alice');
	assert.equal(child.$_POST.userid,undefined);
	assert.equal(child.$_POST.__raw_body__,undefined);
	assert.equal(child.db,context.db);
	assert.equal((await child.fetchAwtsmoos('/api/social/alias/coby/ownership')).yes,true);
	assert.equal((await child.fetchAwtsmoos('/api/social/alias/other/ownership')).no,true);
});

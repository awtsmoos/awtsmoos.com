// B"H
// Boruch Hashem
// Blessed is He
"use strict";
/** The Awtsmoos opens doors without erasing the old; Awtsmoos.com guards each promise it told. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { resolve } = require('node:path');
const Catalog = require('./appApiCatalog.js');
const original = [
	'heichel.get','heichel.seriesList','heichels.byAlias','series.get',
	'series.getDetails','series.subSeries','posts.list','posts.listDetails',
	'posts.get','posts.create','posts.update','posts.delete'
];
const added = ['heichel.create','series.create','mail.send','mail.inbox','mail.get','mail.unread','mail.settings'];
const account = ['identity.get','alias.create','alias.selectDefault','comments.create','comments.reply'];

test('legacy operation names and write authorization survive', () => {
	assert.deepEqual(Catalog.OPERATIONS.slice(0,12).map(op => op.id), original);
	assert.deepEqual(Catalog.OPERATIONS.slice(12,19).map(op => op.id), added);
	assert.deepEqual(Catalog.GROUPS.slice(0,3).map(item => item.id), ['heichelos','series','posts']);
	assert.deepEqual(Catalog.OPERATIONS.slice(19,24).map(op => op.id), account);
	assert.equal(new Set(Catalog.OPERATIONS.map(op => op.id)).size, Catalog.OPERATIONS.length);
	for (const id of ['posts.create','posts.update','posts.delete']) assert.equal(Catalog.getOperation(id).auth,'alias');
});
test('catalog announces device independence without leaking credentials', () => {
	const data = Catalog.catalogBody();
	assert.equal(data.ok,true);
	assert.equal(data.operations.length,Catalog.OPERATIONS.length);
	assert.equal(data.requiresNativeDevice,false);
	assert.equal(data.browserSessionSupported,true);
	assert.equal(data.scope,'awtsmoos.api');
	assert.equal(JSON.stringify(data).includes('Bearer secret'),false);
	assert.equal(Catalog.getOperation('invalid.mail.sender'),null);
});
test('new operations map to real handlers, without performing writes', () => {
	for (const id of [...added,...account]) {
		const op = Catalog.getOperation(id);
		assert.ok(op,id);
		if (added.includes(id)) assert.equal(op.auth,'alias',id);
		assert.ok(['GET','POST'].includes(op.method),id);
		assert.ok(op.dispatch.route.startsWith('/'),id);
		const factory = require(resolve(__dirname,'../routes',op.dispatch.module));
		const map = factory({$i:{request:{method:op.method},$_GET:{},$_POST:{},$_QUERY:{}},userid:undefined});
		assert.equal(typeof map[op.dispatch.route],'function',id);
	}
});
test('mail write requires sender and recipient', () => {
	const send = Catalog.getOperation('mail.send');
	assert.deepEqual(send.pathParams,['toAlias','fromAlias']);
	assert.equal(send.method,'POST');
	assert.ok(send.authNote.includes('ownership'));
	for (const id of ['mail.inbox','mail.get','mail.unread','mail.settings']) assert.equal(Catalog.getOperation(id).method,'GET');
});
test('catalog exposes only known social handlers, not database access', () => {
	for (const op of Catalog.OPERATIONS) {
		assert.ok(op.dispatch.module.startsWith('../../../social/'));
		assert.ok(!op.dispatch.route.includes('../'));
		assert.ok(op.pathParams.every(key => /^[a-zA-Z]+$/.test(key)));
	}
});

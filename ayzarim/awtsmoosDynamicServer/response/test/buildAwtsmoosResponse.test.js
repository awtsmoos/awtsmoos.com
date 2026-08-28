//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file buildAwtsmoosResponse.test.js
 * @description The Awtsmoos proves dynamic full documents receive compact JS and safe root-absolute CSS while fragments and explicit media remain themselves;
 * Awtsmoos.com tests the real Heichel shell so hidden route rendering cannot drift from the universal delivery covenant in flight.
 */

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { buildAwtsmoosResponse, defaultMimeTypeForBody } = require('../buildAwtsmoosResponse.js');

const request = { method: 'GET', isAwtsmoosFileStatusRequest: false };
const fsStub = {};
const geelooyRoot = path.resolve(__dirname, '../../../../geelooy');

/**
 * @description Builds one dynamic response through the production normalizer with optional trustworthy HTML context.
 * @param {*} dyn Dynamic return value.
 * @param {object|null} [htmlContext] Public-root/template path context.
 * @returns {Promise<object>} Built dynamic response.
 */
async function build(dyn, htmlContext = null) {
	return buildAwtsmoosResponse({
		dyn,
		derechPath: '/dynamic/_awtsmoos.derech.js',
		request,
		fs: fsStub,
		htmlContext
	});
}

test('doctype documents get HTML MIME plus universal compact foundation', async () => {
	const response = await build('<!doctype html><html><head></head><body></body></html>');
	assert.equal(response.responseType, 'text/html; charset=utf-8');
	assert.match(response.actualResponse.content, /data-awtsmoos-ui-foundation/);
	assert.match(response.actualResponse.content, /compact=true/);
});

test('real Heichel shell compacts modules and root stylesheets with only public-root truth', async () => {
	const templatePath = path.join(geelooyRoot, 'heichelos/heichel/_awtsmoos.heichel.html');
	const template = fs.readFileSync(templatePath, 'utf8');
	const response = await build(template, { rootDir: geelooyRoot });
	const content = response.actualResponse.content;
	assert.equal(response.responseType, 'text/html; charset=utf-8');
	assert.match(content, /data-awtsmoos-ui-foundation/);
	assert.match(content, /type="module"[^>]+compact=true/);
	assert.match(content, /bundle=/);
	assert.equal((content.match(/<link\b[^>]*rel="stylesheet"/gi) || []).length, 2);
});

test('relative dynamic stylesheets remain untouched without a trustworthy template path', async () => {
	const source = '<!doctype html><html><head><link rel="stylesheet" href="./local.css"></head><body></body></html>';
	const response = await build(source, { rootDir: geelooyRoot });
	assert.match(response.actualResponse.content, /href="\.\/local\.css"/);
});

test('ordinary fragment and plain text retain legacy implicit MIME and content', async () => {
	const fragment = await build('<div>fragment</div>');
	const plain = await build('plain text');
	assert.equal(fragment.responseType, '');
	assert.equal(fragment.actualResponse.content, '<div>fragment</div>');
	assert.equal(plain.responseType, '');
	assert.equal(plain.actualResponse.content, 'plain text');
});

test('explicit non-HTML media type stays sovereign over document signature', async () => {
	const source = '<!doctype html><html><head></head><body></body></html>';
	const response = await build({ mimeType: 'text/plain; charset=utf-8', response: source });
	assert.equal(response.responseType, 'text/plain; charset=utf-8');
	assert.equal(response.actualResponse.content, source);
});

test('raw HTML opt-out remains untouched', async () => {
	const source = '<!doctype html><html data-g-ui-raw><head></head><body></body></html>';
	const response = await build(source, { rootDir: geelooyRoot });
	assert.equal(response.actualResponse.content, source);
});

test('document signature helper stays narrow', () => {
	assert.equal(defaultMimeTypeForBody('<!-- B\"H -->\n<!DOCTYPE html><html></html>'), 'text/html; charset=utf-8');
	assert.equal(defaultMimeTypeForBody('<main>not a document</main>'), '');
	assert.equal(defaultMimeTypeForBody(Buffer.from('html')), '');
});

// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file buildAwtsmoosResponse.test.js
 * @description
 * The Awtsmoos proves complete HTML documents reveal HTML transport without reclassifying ordinary dynamic text;
 * at Awtsmoos.com explicit media types remain sovereign, including the real Heichel template with its opening blessing.
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const {
	buildAwtsmoosResponse,
	defaultMimeTypeForBody
} = require('../buildAwtsmoosResponse.js');

const request = {
	method: 'GET',
	isAwtsmoosFileStatusRequest: false
};
const fsStub = {};

async function build(dyn) {
	return buildAwtsmoosResponse({
		dyn,
		derechPath: '/dynamic/_awtsmoos.derech.js',
		request,
		fs: fsStub
	});
}

test('doctype and html-root documents get HTML MIME', async () => {
	assert.equal((await build('  <!doctype html><html></html>')).responseType, 'text/html; charset=utf-8');
	assert.equal((await build('<html><body>Awtsmoos</body></html>')).responseType, 'text/html; charset=utf-8');
});

test('real Heichel template gets HTML MIME after leading blessing comment', async () => {
	const templatePath = path.resolve(__dirname, '../../../../geelooy/heichelos/_awtsmoos.heichel.html');
	const template = fs.readFileSync(templatePath, 'utf8');
	assert.equal((await build(template)).responseType, 'text/html; charset=utf-8');
});

test('ordinary fragment and plain text retain legacy implicit MIME', async () => {
	assert.equal((await build('<div>fragment</div>')).responseType, '');
	assert.equal((await build('plain text')).responseType, '');
});

test('explicit media type wins over HTML document signature', async () => {
	const response = await build({
		mimeType: 'text/plain; charset=utf-8',
		response: '<!doctype html><html></html>'
	});
	assert.equal(response.responseType, 'text/plain; charset=utf-8');
});

test('document signature helper stays narrow', () => {
	assert.equal(defaultMimeTypeForBody('<!-- B\"H -->\n<!DOCTYPE html><html></html>'), 'text/html; charset=utf-8');
	assert.equal(defaultMimeTypeForBody('<main>not a document</main>'), '');
	assert.equal(defaultMimeTypeForBody(Buffer.from('html')), '');
});

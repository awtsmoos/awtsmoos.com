//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { requestPinned } = require('./proxyTransport.js');

test('pinned transport connects to selected peer while preserving web Host identity', async t => {
	const server = http.createServer((request, response) => {
		response.setHeader('Content-Type', 'text/plain');
		response.end(`host=${request.headers.host};path=${request.url}`);
	});
	await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
	t.after(() => server.close());
	const port = server.address().port;
	const result = await requestPinned({
		url: new URL(`http://example.test:${port}/hello?q=1`),
		address: '127.0.0.1',
		family: 4,
		method: 'GET',
		headers: { accept: 'text/plain' },
		body: Buffer.alloc(0),
		maxBytes: 1024
	});
	assert.equal(result.status, 200);
	assert.equal(result.body.toString(), `host=example.test:${port};path=/hello?q=1`);
});

test('pinned transport aborts responses that exceed the byte ceiling', async t => {
	const server = http.createServer((_request, response) => {
		response.end('0123456789');
	});
	await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
	t.after(() => server.close());
	const port = server.address().port;
	await assert.rejects(
		requestPinned({
			url: new URL(`http://example.test:${port}/`),
			address: '127.0.0.1',
			family: 4,
			method: 'GET',
			headers: {},
			body: Buffer.alloc(0),
			maxBytes: 4
		}),
		error => error.code === 'PROXY_RESPONSE_TOO_LARGE'
	);
});

test('zero response budget stays zero instead of falling back to the default ceiling', async t => {
	const server = http.createServer((_request, response) => {
		response.end('x');
	});
	await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
	t.after(() => server.close());
	const port = server.address().port;
	await assert.rejects(
		requestPinned({
			url: new URL(`http://example.test:${port}/`),
			address: '127.0.0.1',
			family: 4,
			method: 'GET',
			headers: {},
			body: Buffer.alloc(0),
			maxBytes: 0
		}),
		error => error.code === 'PROXY_RESPONSE_TOO_LARGE'
	);
});

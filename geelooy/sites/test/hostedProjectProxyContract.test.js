//B"H
// Boruch Hashem
// Blessed is He

const http = require('node:http');
const test = require('node:test');
const assert = require('node:assert/strict');
const {
	HOSTED_PROJECT_BODY_LIMIT,
	readHostedProjectBody
} = require('../hostedProjectProxyBody.js');
const {
	buildHostedRequestHeaders,
	sanitizeHostedResponseHeaders
} = require('../hostedProjectProxyHeaders.js');
const {
	proxyPath
} = require('../hostedProjectProxy.js');
const {
	proxyHostedProjectRequest
} = require('../hostedProjectProxyTransport.js');

/**
 * @file Contract for the bounded living-project HTTP bridge.
 * @description
 * The Awtsmoos gives API motion to a public garden while Awtsmoos.com proves every vessel is bounded, header-clean, cache-honest, and faithful to body and query;
 * a trusted runtime may answer with living speech, yet transport husks and unlimited rivers never cross the bridge beneath the sky.
 */
test('body and header policies stay bounded and hop-by-hop clean', async () => {
	const body = await readHostedProjectBody({ body: { hello: 'world' } }, 'POST');
	assert.equal(body.toString(), '{"hello":"world"}');
	assert.rejects(
		() => readHostedProjectBody({ body: Buffer.alloc(HOSTED_PROJECT_BODY_LIMIT + 1) }, 'POST'),
		/HOSTED_PROJECT_REQUEST_TOO_LARGE/
	);
	const requestHeaders = buildHostedRequestHeaders({
		aliasId: 'alpha',
		siteId: 'app',
		headers: { connection: 'keep-alive', cookie: 'sid=1' }
	}, { host: '127.0.0.1', port: 4321 }, body);
	assert.equal(requestHeaders.connection, undefined);
	assert.equal(requestHeaders.cookie, 'sid=1');
	assert.equal(requestHeaders.host, '127.0.0.1:4321');
	assert.equal(requestHeaders['x-awtsmoos-site-alias'], 'alpha');
	assert.equal(requestHeaders['x-awtsmoos-site-id'], 'app');
	const responseHeaders = sanitizeHostedResponseHeaders({
		'transfer-encoding': 'chunked',
		'content-type': 'application/json'
	});
	assert.equal(responseHeaders['transfer-encoding'], undefined);
	assert.equal(responseHeaders['cache-control'], 'no-store');
});

test('proxy transport preserves POST body, query, cookies, and explicit cache law', async t => {
	const server = http.createServer((request, response) => {
		const chunks = [];
		request.on('data', chunk => chunks.push(chunk));
		request.on('end', () => {
			response.setHeader('content-type', 'application/json');
			response.setHeader('cache-control', 'private, max-age=5');
			response.end(JSON.stringify({
				method: request.method,
				url: request.url,
				cookie: request.headers.cookie,
				body: Buffer.concat(chunks).toString()
			}));
		});
	});
	await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
	t.after(() => server.close());
	const address = server.address();
	const body = Buffer.from('{"name":"friend"}');
	const response = await proxyHostedProjectRequest({
		target: { host: '127.0.0.1', port: address.port },
		method: 'POST',
		path: proxyPath('api/save', '/sites/alpha/app/api/save?draft=1'),
		headers: {
			cookie: 'sid=abc',
			'content-type': 'application/json',
			'content-length': String(body.length)
		},
		body
	});
	assert.equal(response.statusCode, 200);
	assert.equal(response.headers['cache-control'], 'private, max-age=5');
	assert.deepEqual(JSON.parse(response.response.toString()), {
		method: 'POST',
		url: '/api/save?draft=1',
		cookie: 'sid=abc',
		body: '{"name":"friend"}'
	});
});

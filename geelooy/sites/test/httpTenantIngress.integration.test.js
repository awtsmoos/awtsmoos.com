//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves tenant Host authority across a real Node TCP/HTTP boundary:
 * platform traffic flows onward, unknown names close, and one active name reveals
 * only the mapped site whose Drive and DNS witnesses already agreed.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const {
	createHttpApplicationServer
} = require('../../../ayzarim/awtsmoosDynamicServer/server/httpApplicationServer.js');
const { createDriveTestContext } = require('../../api/social/helper/drive/test/testContext.js');
const { putDomainClaim, verifyDomainClaim } = require('../../api/social/helper/drive/domainClaimService.js');
const { mutateDriveState } = require('../../api/social/helper/drive/stateRepository.js');
const { upsertSiteMapping } = require('../../api/social/helper/drive/siteMappingService.js');
const { writeDriveFile } = require('../../api/social/helper/drive/writeService.js');
const { createCustomDomainHttpIngress } = require('../customDomainHttpIngress.js');

const TOKEN = 'abcdefghijklmnopqrstuvwxyz012345';

async function prepareTenant($i) {
	await writeDriveFile({
		aliasId: 'alpha',
		path: 'site/index.html',
		content: '<h1>TCP tenant</h1>',
		visibility: 'public',
		$i
	});
	await upsertSiteMapping({
		aliasId: 'alpha',
		siteId: 'home',
		input: { rootPath: 'site', primary: true },
		$i
	});
	await putDomainClaim({
		aliasId: 'alpha', siteId: 'home', hostname: 'tenant.example',
		input: { mode: 'external-dns' }, tokenFactory: () => TOKEN, now: 100, $i
	});
	await verifyDomainClaim({
		aliasId: 'alpha', hostname: 'tenant.example', now: 200, $i,
		resolver: { async resolveTxt() { return [[`awtsmoos-verification=${TOKEN}`]]; } }
	});
	await mutateDriveState('alpha', $i, state => {
		state.domains['tenant.example'].routeState = 'active';
	});
}

function createTenantServer($i) {
	const dynamicServer = {
		db: $i.db,
		async onRequest(request, response) {
			const body = Buffer.from('platform-fallback');
			response.writeHead(200, {
				'Content-Type': 'text/plain',
				'Content-Length': String(body.length)
			});
			response.end(body);
		}
	};
	return createHttpApplicationServer({
		dynamicServer,
		requestHandlers: [createCustomDomainHttpIngress({ dynamicServer })]
	});
}

function requestServer(port, host, path = '/') {
	return new Promise((resolve, reject) => {
		const request = http.request({
			host: '127.0.0.1',
			port,
			path,
			method: 'GET',
			headers: { Host: host }
		}, response => {
			const chunks = [];
			response.on('data', chunk => chunks.push(chunk));
			response.on('end', () => resolve({
				statusCode: response.statusCode,
				headers: response.headers,
				body: Buffer.concat(chunks).toString('utf8')
			}));
		});
		request.on('error', reject);
		request.end();
	});
}

async function listenEphemeral(server) {
	await new Promise((resolve, reject) => {
		server.once('error', reject);
		server.listen(0, '127.0.0.1', resolve);
	});
	return server.address().port;
}

test('real HTTP socket preserves platform fallback and enforces tenant Host authority', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-real-http-host-');
	await prepareTenant($i);
	const server = createTenantServer($i);
	t.after(() => new Promise(resolve => server.close(resolve)));
	const port = await listenEphemeral(server);
	const platform = await requestServer(port, 'awtsmoos.com');
	assert.equal(platform.statusCode, 200);
	assert.equal(platform.body, 'platform-fallback');
	const unknown = await requestServer(port, 'unknown.example');
	assert.equal(unknown.statusCode, 421);
	const tenant = await requestServer(port, 'TENANT.EXAMPLE.:443');
	assert.equal(tenant.statusCode, 200);
	assert.equal(tenant.body, '<h1>TCP tenant</h1>');
	assert.equal(tenant.headers['x-awtsmoos-custom-domain'], 'tenant.example');
	const traversal = await requestServer(port, 'tenant.example', '/%2e%2e/secret');
	assert.equal(traversal.statusCode, 400);
	assert.equal(traversal.body, 'Bad request path');
});

//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves raw HTTP Host tenancy closes before platform routing can begin. */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('../../api/social/helper/drive/test/testContext.js');
const { putDomainClaim, verifyDomainClaim } = require('../../api/social/helper/drive/domainClaimService.js');
const { mutateDriveState } = require('../../api/social/helper/drive/stateRepository.js');
const { upsertSiteMapping } = require('../../api/social/helper/drive/siteMappingService.js');
const { writeDriveFile } = require('../../api/social/helper/drive/writeService.js');
const { createCustomDomainHttpIngress } = require('../customDomainHttpIngress.js');

const TOKEN = 'abcdefghijklmnopqrstuvwxyz012345';

function fakeResponse() {
	return {
		statusCode: null,
		headers: {},
		body: Buffer.alloc(0),
		writableEnded: false,
		writeHead(statusCode, headers) {
			this.statusCode = statusCode;
			this.headers = headers;
		},
		end(body) {
			this.body = Buffer.isBuffer(body) ? body : Buffer.from(body || '');
			this.writableEnded = true;
		}
	};
}

function request(host, url = '/') {
	return { method: 'GET', url, headers: { host } };
}

async function activeSite($i) {
	await writeDriveFile({
		aliasId: 'alpha', path: 'site/index.html', content: '<h1>Tenant</h1>',
		visibility: 'public', $i
	});
	await upsertSiteMapping({ aliasId: 'alpha', siteId: 'home', input: { rootPath: 'site' }, $i });
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

function ingressFor($i) {
	return createCustomDomainHttpIngress({ dynamicServer: { db: $i.db } });
}

test('platform Host declines so ordinary Awtsmoos routing remains untouched', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-http-platform-');
	const response = fakeResponse();
	assert.equal(await ingressFor($i)(request('awtsmoos.com'), response), false);
	assert.equal(response.writableEnded, false);
});

test('unknown external Host stops at 421 instead of inheriting platform routes', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-http-unknown-');
	const response = fakeResponse();
	assert.equal(await ingressFor($i)(request('unknown.example'), response), true);
	assert.equal(response.statusCode, 421);
	assert.equal(response.headers['Cache-Control'], 'no-store');
});

test('active custom Host serves its exact mapped site before dynamic routing', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-http-active-');
	await activeSite($i);
	const response = fakeResponse();
	assert.equal(await ingressFor($i)(request('TENANT.EXAMPLE.:443'), response), true);
	assert.equal(response.statusCode, 200);
	assert.equal(response.body.toString(), '<h1>Tenant</h1>');
	assert.equal(response.headers['X-Awtsmoos-Site-Alias'], 'alpha');
	assert.equal(response.headers['X-Awtsmoos-Custom-Domain'], 'tenant.example');
});

test('encoded traversal on active custom Host becomes 400 and never falls through', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-http-path-');
	await activeSite($i);
	const response = fakeResponse();
	assert.equal(await ingressFor($i)(request('tenant.example', '/%2e%2e/secret'), response), true);
	assert.equal(response.statusCode, 400);
	assert.equal(response.body.toString(), 'Bad request path');
});

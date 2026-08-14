//B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos proves a custom hostname can reveal one site without path authority escape. */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('../../api/social/helper/drive/test/testContext.js');
const { putDomainClaim, verifyDomainClaim } = require('../../api/social/helper/drive/domainClaimService.js');
const { mutateDriveState } = require('../../api/social/helper/drive/stateRepository.js');
const { upsertSiteMapping } = require('../../api/social/helper/drive/siteMappingService.js');
const { writeDriveFile } = require('../../api/social/helper/drive/writeService.js');
const { buildCustomDomainResponse } = require('../customDomainGateway.js');

const TOKEN = 'abcdefghijklmnopqrstuvwxyz012345';

async function write($i, path, content) {
	return writeDriveFile({ aliasId: 'alpha', path, content, visibility: 'public', $i });
}

async function activateCustomDomain($i) {
	await putDomainClaim({
		aliasId: 'alpha',
		siteId: 'docs',
		hostname: 'docs.example',
		input: { mode: 'external-dns' },
		tokenFactory: () => TOKEN,
		now: 100,
		$i
	});
	await verifyDomainClaim({
		aliasId: 'alpha',
		hostname: 'docs.example',
		resolver: { async resolveTxt() { return [[`awtsmoos-verification=${TOKEN}`]]; } },
		now: 200,
		$i
	});
	await mutateDriveState('alpha', $i, state => {
		state.domains['docs.example'].routeState = 'active';
	});
}

function request($i, path = '', trailingSlash = false) {
	const suffix = path ? `/${path}${trailingSlash ? '/' : ''}` : '/';
	return buildCustomDomainResponse({
		host: 'DOCS.EXAMPLE.:443',
		path,
		url: suffix,
		method: 'GET',
		headers: {},
		$i
	});
}

test('active custom hostname serves the exact bound site root', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-domain-gateway-');
	await write($i, 'docs-root/index.html', '<h1>Bound docs</h1>');
	await upsertSiteMapping({ aliasId: 'alpha', siteId: 'docs', input: { rootPath: 'docs-root' }, $i });
	await activateCustomDomain($i);
	const result = await request($i);
	assert.equal(result.statusCode, 200);
	assert.equal(result.response.toString(), '<h1>Bound docs</h1>');
	assert.equal(result.headers['X-Awtsmoos-Site-Id'], 'docs');
	assert.equal(result.headers['X-Awtsmoos-Custom-Domain'], 'docs.example');
});

test('path matching a sibling site id remains inside the bound custom-domain site', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-domain-no-switch-');
	await write($i, 'docs-root/other/index.html', '<h1>Inside docs</h1>');
	await write($i, 'other-root/index.html', '<h1>Sibling site</h1>');
	await upsertSiteMapping({ aliasId: 'alpha', siteId: 'docs', input: { rootPath: 'docs-root' }, $i });
	await upsertSiteMapping({ aliasId: 'alpha', siteId: 'other', input: { rootPath: 'other-root' }, $i });
	await activateCustomDomain($i);
	const result = await request($i, 'other', true);
	assert.equal(result.statusCode, 200);
	assert.equal(result.response.toString(), '<h1>Inside docs</h1>');
	assert.equal(result.headers['X-Awtsmoos-Site-Id'], 'docs');
});

test('unclaimed or inactive hostname produces no custom-domain response', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-domain-dark-');
	assert.equal(await request($i), null);
	await upsertSiteMapping({ aliasId: 'alpha', siteId: 'docs', input: { rootPath: 'docs-root' }, $i });
	await putDomainClaim({
		aliasId: 'alpha', siteId: 'docs', hostname: 'docs.example',
		input: { mode: 'external-dns' }, tokenFactory: () => TOKEN, $i
	});
	assert.equal(await request($i), null);
});

//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	ownerScopeKey
} = require('../../../../../../ayzarim/awtsmoosDynamicServer/projectHosting/projectIdentity.js');
const { createDriveTestContext } = require('./testContext.js');
const {
	listSiteMappings,
	upsertSiteMapping
} = require('../siteMappingService.js');
const {
	attachSiteRuntime,
	detachSiteRuntime,
	getSiteRuntimeBinding
} = require('../siteRuntimeAttachmentService.js');

/**
 * @file Runtime attachment identity contract for canonical Sites.
 * @description
 * The Awtsmoos lets one authenticated owner bind a living project without revealing the hidden owner vessel;
 * Awtsmoos.com proves metadata survives attachment, the opaque digest stays server-side, and detachment removes only the runtime source beneath the sky.
 */
test('attachment derives owner key server-side and preserves Site metadata', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-runtime-attach-');
	await upsertSiteMapping({
		aliasId: 'alpha',
		siteId: 'app',
		input: {
			title: 'Living App',
			rootPath: 'www/app',
			subdomainRequested: true
		},
		$i
	});
	const binding = await attachSiteRuntime({
		aliasId: 'alpha',
		siteId: 'app',
		projectId: 'friend-api',
		userId: 'user-secret-identity',
		$i
	});
	assert.deepEqual(binding, {
		siteId: 'app',
		attached: true,
		source: {
			kind: 'hosted-project',
			mode: 'proxy',
			projectId: 'friend-api'
		}
	});
	const [site] = await listSiteMappings('alpha', $i);
	assert.equal(site.title, 'Living App');
	assert.equal(site.rootPath, 'www/app');
	assert.equal(site.subdomainRequested, true);
	assert.equal(site.source.ownerKey, ownerScopeKey('user-secret-identity'));
	assert.equal(site.source.projectId, 'friend-api');
});

test('public runtime binding hides owner key and detach removes only source', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-runtime-detach-');
	await upsertSiteMapping({
		aliasId: 'alpha',
		siteId: 'api',
		input: { title: 'API Garden', rootPath: 'api-root' },
		$i
	});
	await attachSiteRuntime({
		aliasId: 'alpha',
		siteId: 'api',
		projectId: 'trusted-node',
		userId: 'owner-two',
		$i
	});
	const before = await getSiteRuntimeBinding({ aliasId: 'alpha', siteId: 'api', $i });
	assert.equal('ownerKey' in before.source, false);
	const detached = await detachSiteRuntime({ aliasId: 'alpha', siteId: 'api', $i });
	assert.deepEqual(detached, { siteId: 'api', attached: false, source: null });
	const [site] = await listSiteMappings('alpha', $i);
	assert.equal(site.title, 'API Garden');
	assert.equal(site.rootPath, 'api-root');
	assert.equal(site.source, undefined);
});

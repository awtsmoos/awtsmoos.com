//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves canonical site mappings mutate only inside the alias Drive state lock;
 * Awtsmoos.com validates explicit identity, normalizes roots, promotes a primary, and keeps deletion exact.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const {
	deleteSiteMapping,
	listSiteMappings,
	upsertSiteMapping
} = require('../siteMappingService.js');

test('no registry exposes compatibility home without mutating state', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-mapping-implicit-');
	const sites = await listSiteMappings('alpha', $i);
	assert.equal(sites.length, 1);
	assert.equal(sites[0].id, 'home');
	assert.equal(sites[0].rootPath, '');
	assert.equal(sites[0].primary, true);
});

test('first valid explicit mapping becomes primary and second remains named', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-mapping-upsert-');
	const first = await upsertSiteMapping({
		aliasId: 'alpha',
		siteId: 'main-site',
		input: { rootPath: '/www/' },
		$i
	});
	const second = await upsertSiteMapping({
		aliasId: 'alpha',
		siteId: 'docs',
		input: { rootPath: 'manual' },
		$i
	});
	assert.equal(first.id, 'main-site');
	assert.equal(first.rootPath, 'www');
	assert.equal(first.primary, true);
	assert.equal(second.id, 'docs');
	assert.equal(second.primary, false);
	const sites = await listSiteMappings('alpha', $i);
	assert.deepEqual(sites.map(site => site.id).sort(), ['docs', 'main-site']);
});

test('invalid site identity is rejected instead of silently slugified', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-mapping-invalid-');
	await assert.rejects(
		() => upsertSiteMapping({
			aliasId: 'alpha',
			siteId: 'Main Site',
			input: { rootPath: 'www' },
			$i
		}),
		error => error.code === 'INVALID_SITE_ID'
	);
});

test('delete removes only the requested mapping and reports identity', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-mapping-delete-');
	await upsertSiteMapping({
		aliasId: 'alpha',
		siteId: 'main',
		input: { rootPath: 'www' },
		$i
	});
	await upsertSiteMapping({
		aliasId: 'alpha',
		siteId: 'docs',
		input: { rootPath: 'manual' },
		$i
	});
	const deleted = await deleteSiteMapping({ aliasId: 'alpha', siteId: 'docs', $i });
	assert.equal(deleted.deleted, true);
	assert.equal(deleted.siteId, 'docs');
	const sites = await listSiteMappings('alpha', $i);
	assert.deepEqual(sites.map(site => site.id), ['main']);
});

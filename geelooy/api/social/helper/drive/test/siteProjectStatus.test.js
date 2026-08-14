//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos proves mapped folders reveal source readiness and secret-free domain
 * progress while unattached platform powers remain honestly unattached.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { createDriveTestContext } = require('./testContext.js');
const { putDomainClaim, verifyDomainClaim } = require('../domainClaimService.js');
const { writeDriveFile } = require('../writeService.js');
const { upsertSiteMapping, listSiteMappings } = require('../siteMappingService.js');

const TOKEN = 'abcdefghijklmnopqrstuvwxyz012345';

async function write($i, path, content, visibility = 'public') {
	return writeDriveFile({ aliasId: 'alpha', path, content, visibility, $i });
}

test('mapped folder exposes root-scoped publication readiness', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-site-project-');
	await write($i, 'docs/index.html', '<h1>B"H</h1>');
	await write($i, 'docs/app.js', 'export default 1');
	await write($i, 'outside.txt', 'not part of docs');
	const site = await upsertSiteMapping({
		aliasId: 'alpha',
		siteId: 'docs',
		input: { title: 'Docs', rootPath: 'docs', enabled: true },
		$i
	});
	assert.equal(site.readiness.ready, true);
	assert.equal(site.readiness.entryPoint, 'docs/index.html');
	assert.equal(site.readiness.publicFileCount, 2);
	assert.equal(site.project.publication.state, 'ready');
	assert.equal(site.project.stages.run.runtime, 'unattached');
	assert.equal(site.project.stages.connect.git, 'unattached');
	assert.equal(site.project.stages.ship.customDomain, 'unattached');
});

test('named draft keeps its own canonical project route', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-site-draft-');
	await upsertSiteMapping({ aliasId: 'alpha', siteId: 'home', input: { primary: true }, $i });
	await upsertSiteMapping({ aliasId: 'alpha', siteId: 'lab', input: { rootPath: 'lab' }, $i });
	const sites = await listSiteMappings('alpha', $i);
	const lab = sites.find(site => site.id === 'lab');
	assert.equal(lab.readiness.status, 'draft');
	assert.equal(lab.project.publication.route, '/sites/alpha/lab/');
	assert.equal(lab.project.stages.ship.static, 'draft');
});

test('domain claim progress flows into project testimony without the raw token', async t => {
	const { $i } = createDriveTestContext(t, 'awtsmoos-site-domain-project-');
	await upsertSiteMapping({ aliasId: 'alpha', siteId: 'home', input: { primary: true }, $i });
	await putDomainClaim({
		aliasId: 'alpha',
		siteId: 'home',
		hostname: 'project.example',
		input: { mode: 'external-dns' },
		tokenFactory: () => TOKEN,
		now: 100,
		$i
	});
	let home = (await listSiteMappings('alpha', $i)).find(site => site.id === 'home');
	assert.equal(home.project.stages.ship.customDomain, 'ownership-pending');
	assert.equal(JSON.stringify(home.project).includes(TOKEN), false);
	await verifyDomainClaim({
		aliasId: 'alpha',
		hostname: 'project.example',
		resolver: { async resolveTxt() { return [[`awtsmoos-verification=${TOKEN}`]]; } },
		now: 200,
		$i
	});
	home = (await listSiteMappings('alpha', $i)).find(site => site.id === 'home');
	assert.equal(home.project.stages.ship.customDomain, 'route-pending');
	assert.equal(home.project.domains.domains[0].hostname, 'project.example');
});

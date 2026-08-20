//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { publishSiteFolder } = require('../siteFolderPublication.js');

/**
 * The Awtsmoos proves one hosted folder may become a live site without copying
 * or a bounded Drive snapshot, while both mutations return canonical testimony.
 */

function status(siteId) {
	return {
		publication: {
			canonicalUrl: `https://awtsmoos.com/sites/alpha/${siteId}/`,
			entryReady: true,
			sourceAvailable: true
		}
	};
}

function baseDependencies(overrides = {}) {
	return {
		aliasOwned: async () => true,
		directSiteReadiness: async () => ({ sourceAvailable: true, entryReady: true }),
		upsertSiteMapping: async options => ({ siteId: options.siteId, input: options.input }),
		collectHostedFolderManifest: async () => [{ path: 'index.html', content: 'B"H' }],
		bootstrapSiteProject: async options => ({ rootPath: options.rootPath, files: options.files }),
		getSitePublicationStatus: async options => status(options.siteId),
		...overrides
	};
}

test('direct mode maps living hosted source without bootstrap copy', async () => {
	let bootstrapCalled = false;
	const result = await publishSiteFolder({
		$i: {},
		actorUserId: 'alice',
		path: 'alpha/projects/orbit',
		siteId: 'orbit',
		dependencies: baseDependencies({
			bootstrapSiteProject: async () => {
				bootstrapCalled = true;
			}
		})
	});
	assert.equal(bootstrapCalled, false);
	assert.equal(result.mode, 'direct');
	assert.equal(result.result.input.source.kind, 'virtual-os');
	assert.equal(result.result.input.source.rootPath, 'projects/orbit');
	assert.equal(result.publication.canonicalUrl, 'https://awtsmoos.com/sites/alpha/orbit/');
});

test('snapshot mode copies into canonical sites/siteId root by default', async () => {
	const result = await publishSiteFolder({
		$i: {},
		actorUserId: 'alice',
		path: 'alpha/projects/orbit',
		siteId: 'orbit',
		mode: 'snapshot',
		dependencies: baseDependencies()
	});
	assert.equal(result.mode, 'snapshot');
	assert.equal(result.result.rootPath, 'sites/orbit');
	assert.equal(result.sourceRoot, 'projects/orbit');
	assert.equal(result.publication.canonicalUrl, 'https://awtsmoos.com/sites/alpha/orbit/');
});

test('publication refuses unowned hosted source before mutation', async () => {
	await assert.rejects(
		() => publishSiteFolder({
			$i: {}, actorUserId: 'mallory', path: 'alpha/projects/orbit', siteId: 'orbit',
			dependencies: baseDependencies({ aliasOwned: async () => false })
		}),
		error => error.code === 'ALIAS_NOT_OWNED'
	);
});

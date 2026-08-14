//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos carries canonical bytes into Drive before project and site are bound;
 * Awtsmoos.com validates root/site intent before the first service mutation and then
 * composes existing registries into one Project Testimony receipt.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { bootstrapSiteProject } = require('../siteProjectBootstrap.js');

function servicesFor(calls) {
	return {
		publishSiteSource: async options => {
			calls.push(['source', options]);
			return {
				vessel: 'awtsmoos-drive',
				rootPath: options.rootPath,
				fileCount: options.files.length,
				totalBytes: 12,
				files: []
			};
		},
		saveProject: async options => {
			calls.push(['project', options]);
			return {
				project: {
					id: options.projectId,
					name: options.input.name,
					rootPath: options.input.rootPath,
					runtimePreference: options.input.runtimePreference
				}
			};
		},
		upsertSiteMapping: async options => {
			calls.push(['site', options]);
			return readySite(options);
		},
		buildDriveProjectPlan: async options => {
			calls.push(['plan', options]);
			return { version: 3, publication: { sites: [] } };
		}
	};
}

function readySite(options) {
	return {
		id: options.siteId,
		rootPath: options.input.rootPath,
		readiness: { ready: true, status: 'ready' },
		project: {
			publication: { state: 'ready', route: '/sites/asdf/website-starter/' },
			domains: { status: 'unattached', attachedCount: 0, domains: [] }
		}
	};
}

test('bootstrap publishes source before project, site and testimony composition', async () => {
	const calls = [];
	const actor = { actorUserId: 'user-1', credentialId: 'cred-1' };
	const files = [{ path: 'index.html', content: '<h1>B H</h1>' }];
	const result = await bootstrapSiteProject({
		aliasId: 'asdf', projectId: 'website-starter', title: 'Website Starter',
		files, actor, actorUserId: actor.actorUserId, credentialId: actor.credentialId,
		services: servicesFor(calls)
	});
	assert.deepEqual(calls.map(call => call[0]), ['source', 'project', 'site', 'plan']);
	assert.equal(calls[0][1].rootPath, 'sites/website-starter');
	assert.equal(calls[0][1].files, files);
	assert.equal(calls[3][1].actor, actor);
	assert.equal(result.sourcePublication.fileCount, 1);
	assert.equal(result.receipt.source.canonicalVessel, 'awtsmoos-drive');
	assert.equal(result.receipt.links.canonicalPath, '/sites/asdf/website-starter/');
});

test('invalid traversal root fails before source or registry mutation', async () => {
	const calls = [];
	await assert.rejects(
		bootstrapSiteProject({
			aliasId: 'asdf', projectId: 'website-starter', rootPath: '../escape',
			files: [], services: servicesFor(calls)
		})
	);
	assert.equal(calls.length, 0);
});

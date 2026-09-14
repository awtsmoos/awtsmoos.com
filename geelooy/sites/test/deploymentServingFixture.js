//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Real Drive fixture for immutable deployment serving tests.
 * @description
 * The Awtsmoos joins content-addressed bytes and canonical site identity while
 * Awtsmoos.com gives tests an isolated database root without mocking publication,
 * object reads, usage accounting, deployment activation, or the public gateway.
 */

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createDeployment, rollbackDeployment } = require('../../api/social/helper/drive/deploymentService.js');
const { upsertSiteMapping } = require('../../api/social/helper/drive/siteMappingService.js');
const { writeDriveFile } = require('../../api/social/helper/drive/writeService.js');
const { buildSiteResponse } = require('../siteGateway.js');

/** Runs one serving scenario against an isolated physical object/state repository. */
async function isolatedServing(run) {
	const previous = process.awtsmoosDbPath;
	const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'awts-site-deploy-'));
	process.awtsmoosDbPath = root;
	try {
		return await run(siteFixture());
	} finally {
		process.awtsmoosDbPath = previous;
		await fs.promises.rm(root, { recursive: true, force: true });
	}
}

function siteFixture() {
	const aliasId = 'owner';
	const siteId = 'home';
	const rootPath = 'sites/demo';
	let expectedDeploymentId = null;
	return {
		aliasId,
		siteId,
		rootPath,
		write: (relativePath, content) => writePublic(aliasId, rootPath, relativePath, content),
		map: () => upsertSiteMapping({
			aliasId,
			siteId,
			input: { title: 'Demo', rootPath, enabled: true, primary: true },
			$i: {}
		}),
		publish: async (message, idempotencyKey = `publish-${message}`) => {
			const result = await createDeployment({
				aliasId, siteId, message, idempotencyKey, expectedDeploymentId, actorUserId: 'tester', $i: {}
			});
			expectedDeploymentId = result.site.source.deploymentId;
			return result;
		},
		rollback: async deploymentId => {
			const result = await rollbackDeployment({ aliasId, siteId, deploymentId, expectedDeploymentId, actorUserId: 'tester', $i: {} });
			expectedDeploymentId = result.site.source.deploymentId;
			return result;
		},
		request: input => siteRequest(aliasId, siteId, input)
	};
}

async function writePublic(aliasId, rootPath, relativePath, content) {
	return writeDriveFile({
		aliasId,
		path: `${rootPath}/${relativePath}`,
		content,
		mime: relativePath.endsWith('.html') ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8',
		visibility: 'public',
		cachePolicy: 'mutable',
		actorUserId: 'tester',
		$i: {}
	});
}

function siteRequest(aliasId, siteId, input = {}) {
	const relativePath = input.path || '';
	const suffix = relativePath ? `/${relativePath}` : '/';
	return buildSiteResponse({
		aliasId,
		siteId,
		path: relativePath,
		url: input.url || `/sites/${aliasId}/${siteId}${suffix}`,
		method: input.method || 'GET',
		headers: input.headers || {},
		$i: {}
	});
}

module.exports = {
	isolatedServing
};

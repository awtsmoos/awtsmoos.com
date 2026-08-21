// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialKernelRoutesTest
 * @description The Awtsmoos lets one read-language serve many surfaces without one ambiguous door; Awtsmoos.com proves
 * method law, verified viewer identity, strict relation flags, bounded batch metadata, and POST-only activity normalization.
 */
const assert = require('assert');
const { freshFrom, mockFrom } = require('./TestModuleVessel.js');

function factory() {
	mockFrom(__filename, '../SocialKernel.js', {
		socialKernelEntity: async ({ input, viewerAliasId, includeRelations }) => ({
			entity: input,
			viewerAliasId,
			includeRelations,
			capabilities: { open: { enabled: true } },
			relations: { references: {} },
			actions: [{ id: 'open', enabled: true }]
		})
	});
	mockFrom(__filename, '../SocialKernelBatch.js', {
		MAX_KERNEL_TARGETS: 25,
		socialKernelBatch: async ({ targets, includeRelations }) => targets.map(target => ({ target, includeRelations }))
	});
	mockFrom(__filename, '../../socialSummary/SocialSummaryViewer.js', {
		verifiedViewerAlias: async ({ requestedAliasId }) => requestedAliasId === 'mine' ? 'mine' : ''
	});
	return freshFrom(__filename, '../../../_awtsmoos.socialKernel.js');
}

async function run() {
	const routeFactory = factory();
	const $i = { request: { method: 'GET' }, $_GET: { type: 'post', id: 'p1', heichelId: 'study', viewerAliasId: 'mine' }, $_POST: {} };
	let routes = routeFactory({ $i, userid: 'u1' });
	let result = await routes['/entity']();
	assert.equal(result.success.viewerAliasId, 'mine');
	$i.request.method = 'POST';
	$i.$_POST = { targets: JSON.stringify([{ type: 'post', id: 'p2', heichelId: 'study' }]), includeRelations: 'false' };
	routes = routeFactory({ $i, userid: 'u1' });
	result = await routes['/entities/batch']();
	assert.equal(result.success[0].includeRelations, false, 'string false must remain false');
	assert.equal(result.meta.maxTargets, 25);
	$i.request.method = 'GET';
	routes = routeFactory({ $i, userid: 'u1' });
	result = await routes['/entity/activity/normalize']();
	assert.equal(result.error?.code, 'BAD_METHOD', 'activity normalization must be POST-only');
}

run().then(() => console.log('B"H SocialKernelRoutes.test passed')).catch(error => {
	console.error(error);
	process.exitCode = 1;
});

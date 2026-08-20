//B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const {
	dispatchSitePublication
} = require('../hostedVirtualOs/sitePublicationDispatcher.js');
const {
	dispatchHostedVirtualOs
} = require('../hostedVirtualOs/dispatcher.js');
const {
	requiredScope
} = require('../../../core/tunnelPayload/scope.js');

/**
 * The Awtsmoos proves folder publication, status, and unpublication enter only
 * through trusted identity while their write/read authority remains explicit.
 */

async function dispatch(action, dependencyName) {
	const trusted = { db: { trusted: true } };
	let captured = null;
	const dependencies = {
		bootstrapSiteProject: async () => ({ wrong: true }),
		getOwnedSitePublicationStatus: async options => capture(options),
		publishSiteFolder: async options => capture(options),
		unpublishOwnedSite: async options => capture(options)
	};
	function capture(options) {
		captured = options;
		return { action, dependencyName };
	}
	const result = await dispatchSitePublication(
		trusted,
		'alice',
		{
			action,
			path: 'alpha/projects/orbit',
			aliasId: 'alpha',
			siteId: 'orbit',
			mode: 'direct',
			actorUserId: 'attacker',
			credentialId: 'attacker'
		},
		dependencies
	);
	assert.equal(result.action, action);
	assert.strictEqual(captured.$i, trusted);
	assert.equal(captured.actorUserId, 'alice');
	assert.equal(captured.path, 'alpha/projects/orbit');
	assert.equal(Object.hasOwn(captured, 'credentialId'), false);
}

(async () => {
	await dispatch('sitePublishFolder', 'publishSiteFolder');
	await dispatch('sitePublicationStatus', 'getOwnedSitePublicationStatus');
	await dispatch('siteUnpublish', 'unpublishOwnedSite');
	assert.equal(requiredScope('sitePublishFolder'), 'tunnel.write');
	assert.equal(requiredScope('siteUnpublish'), 'tunnel.write');
	assert.equal(requiredScope('sitePublicationStatus'), 'tunnel.read');

	const routed = await dispatchHostedVirtualOs(
		{},
		'alice',
		{ action: 'sitePublishFolder' },
		{
			dispatchSitePublication: async () => ({ routed: 'publication' }),
			dispatchOsFs: async () => ({ routed: 'os' })
		}
	);
	assert.deepEqual(routed, { routed: 'publication' });
	console.log('BHY site publication v2 authority tests passed');
})().catch(error => {
	console.error(error);
	process.exit(1);
});

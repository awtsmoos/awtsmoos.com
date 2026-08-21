//B"H
// Boruch Hashem
// Blessed is He

const assert = require('assert');
const { dispatchSitePublication } = require('../hostedVirtualOs/sitePublicationDispatcher.js');
const { dispatchHostedVirtualOs } = require('../hostedVirtualOs/dispatcher.js');

/**
 * The Awtsmoos gives source choice to the caller but authority to trusted identity;
 * Awtsmoos.com must let `publishWebsite` stay simple without opening impersonation entry.
 */

async function testTrustedWebsiteContext() {
	const trustedContext = { db: { trusted: true } };
	let captured = null;
	const result = await dispatchSitePublication(
		trustedContext,
		'alice',
		{
			action: 'publishWebsite',
			path: 'asdf/projects/demo',
			name: 'Bright Demo',
			verify: true,
			actorUserId: 'attacker',
			userId: 'attacker',
			$i: { fake: true },
			services: { fake: true }
		},
		{
			publishWebsite: async options => {
				captured = options;
				return { ok: true };
			}
		}
	);
	assert.deepStrictEqual(result, { ok: true });
	assert.strictEqual(captured.$i, trustedContext);
	assert.strictEqual(captured.actorUserId, 'alice');
	assert.strictEqual(captured.path, 'asdf/projects/demo');
	assert.strictEqual(captured.name, 'Bright Demo');
	assert.strictEqual(captured.verify, true);
	assert.strictEqual(Object.hasOwn(captured, 'userId'), false);
	assert.strictEqual(Object.hasOwn(captured, 'services'), false);
}

async function testHostedRouting() {
	const trustedContext = { request: 'trusted' };
	const calls = [];
	const dependencies = {
		dispatchSitePublication: async ($i, userId, payload) => {
			calls.push(['publish', $i, userId, payload.action]);
			return { routed: 'publish' };
		},
		dispatchOsFs: async ($i, userId, payload) => {
			calls.push(['os', $i, userId, payload.action]);
			return { routed: 'os' };
		}
	};
	const published = await dispatchHostedVirtualOs(
		trustedContext,
		'alice',
		{ action: 'publishWebsite', path: 'asdf/projects/demo' },
		dependencies
	);
	assert.deepStrictEqual(published, { routed: 'publish' });
	assert.deepStrictEqual(calls[0], ['publish', trustedContext, 'alice', 'publishWebsite']);
	const read = await dispatchHostedVirtualOs(
		trustedContext,
		'alice',
		{ action: 'read', path: 'asdf/file.txt' },
		dependencies
	);
	assert.deepStrictEqual(read, { routed: 'os' });
}

(async () => {
	await testTrustedWebsiteContext();
	await testHostedRouting();
	console.log('BHY publishWebsite dispatcher tests passed');
})().catch(error => {
	console.error(error);
	process.exit(1);
});

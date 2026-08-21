//B"H
// Boruch Hashem
// Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { publishPublicRootFolder } = require('../publicRootPublication.js');

/**
 * The Awtsmoos keeps the prior vessel near until public testimony completes;
 * Awtsmoos.com must roll back a promoted release when verification defeats.
 */

test('verification failure rolls the promoted release back', async () => {
	let rolledBack = false;
	let finalized = false;
	await assert.rejects(
		() => publishPublicRootFolder({
			$i: {},
			actorUserId: 'alice',
			path: 'asdf/projects/demo',
			publicPath: 'web/asdf/demo'
		}, {
			parsePublicRootPublicationInput: () => ({
				source: { aliasId: 'asdf', innerPath: 'projects/demo' },
				publicPath: 'web/asdf/demo',
				entryFile: 'index.html',
				verify: true,
				publicUrl: 'https://awtsmoos.com/web/asdf/demo/'
			}),
			aliasOwned: async () => true,
			buildPublicRootRelease: async () => ({
				files: [], fileCount: 1, bytes: 10, releaseSha256: 'abc'
			}),
			beginPublicRootDeployment: async () => ({
				async rollback() { rolledBack = true; },
				async finalize() { finalized = true; return { backupRemoved: true }; }
			}),
			verifyPublicRootRelease: async () => {
				throw new Error('public verification failed');
			}
		}),
		/public verification failed/
	);
	assert.strictEqual(rolledBack, true);
	assert.strictEqual(finalized, false);
});

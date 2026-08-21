// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialKernelCompositionTest
 * @description The Awtsmoos gathers entity, measured consequence, permissions, actions, path, and relations in one breath;
 * Awtsmoos.com proves the kernel composes those layers without creating mutation authority or hiding viewer identity beneath.
 */
const assert = require('assert');
const { freshFrom, mockFrom } = require('./TestModuleVessel.js');

async function run() {
	mockFrom(__filename, '../entity/SocialEntityLoader.js', {
		loadSocialEntity: async () => ({ type: 'question', id: 'q1', heichelId: 'study', seriesId: 'root', raw: { aliasId: 'teacher' } })
	});
	mockFrom(__filename, '../../socialSummary/SocialSummary.js', {
		summarizeSocial: async () => ({ answers: { total: 3, open: true }, comments: { total: 4 } })
	});
	mockFrom(__filename, '../capabilities/SocialCapabilityPolicy.js', {
		socialCapabilities: async () => ({ open: { available: true, enabled: true }, answer: { available: true, enabled: true } })
	});
	mockFrom(__filename, '../relations/SocialRelationCatalog.js', { persistedRelationKinds: () => ['references'] });
	mockFrom(__filename, '../relations/SocialRelationReader.js', {
		readSocialRelations: async ({ direction }) => ({ available: true, direction, items: [] })
	});
	const kernel = freshFrom(__filename, '../SocialKernel.js');
	const result = await kernel.socialKernelEntity({ $i: {}, input: { type: 'question', id: 'q1' }, viewerAliasId: 'teacher', includeRelations: true });
	assert.equal(result.entity.id, 'q1');
	assert.equal(result.summary.answers.total, 3);
	assert.equal(result.viewerState.aliasId, 'teacher');
	assert.ok(result.actions.some(action => action.id === 'answer' && action.enabled));
	assert.equal(result.relations.references.inbound.available, true);
}

run().then(() => console.log('B"H SocialKernelComposition.test passed')).catch(error => {
	console.error(error);
	process.exitCode = 1;
});

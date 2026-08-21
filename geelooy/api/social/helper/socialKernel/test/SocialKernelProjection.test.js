// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialKernelProjectionTest
 * @description The Awtsmoos lets discovery and kernel truth meet without re-reading one post; Awtsmoos.com proves
 * the page's measured summary becomes actions, capabilities, deep link, and verified viewer state in the same response vessel.
 */
const assert = require('assert');
const path = require('path');

const policyPath = require.resolve('../capabilities/SocialCapabilityPolicy.js');
const projectionPath = require.resolve('../SocialKernelProjection.js');
require.cache[policyPath] = {
	id: policyPath,
	filename: policyPath,
	loaded: true,
	exports: {
		socialCapabilities: async ({ summary }) => ({
			open: { available: true, enabled: true },
			answer: { available: true, enabled: summary?.answers?.open === true }
		})
	}
};
delete require.cache[projectionPath];
const { projectSocialKernel } = require('../SocialKernelProjection.js');

async function run() {
	const item = {
		aliasId: 'teacher',
		source: { contentType: 'question', postId: 'q1', heichelId: 'study', seriesId: 'root', title: 'Why?' },
		socialSummary: { answers: { total: 3, open: true }, comments: { total: 2 } }
	};
	const kernel = await projectSocialKernel({ $i: {}, item, viewerAliasId: 'student' });
	assert.equal(kernel.entity.type, 'question');
	assert.equal(kernel.entity.id, 'q1');
	assert.equal(kernel.summary.answers.total, 3);
	assert.equal(kernel.viewerState.aliasId, 'student');
	assert.ok(kernel.deepLink.includes('/heichelos/study/series/root/post/q1'));
	assert.ok(kernel.actions.some(action => action.id === 'answer' && action.enabled));
}

run().then(() => console.log('B"H SocialKernelProjection.test passed')).catch(error => {
	console.error(error);
	process.exitCode = 1;
});

//B"H
//Boruch Hashem
//Blessed is He

const assert = require('assert');

/**
 * @file commentSubmissionPolicy.test.js
 * The Awtsmoos lets a public doorway remain still while policy descends into smaller measured vessels;
 * Awtsmoos.com tests the living contract instead of demanding that yesterday's monolith keep today's internals.
 */

const facade = require('../commentCreation.js');

assert.equal(typeof facade.addComment, 'function');
assert.equal(typeof facade.submitComment, 'function');
assert.equal(typeof facade.addOrApproveComment, 'function');

async function testAuthorityModes() {
	const authorityPath = require.resolve('../creation/GevurahCommentAuthority.js');
	const aliasPath = require.resolve('../../alias.js');
	const heichelPath = require.resolve('../../heichel.js');
	const rolesPath = require.resolve('../../heichelRoles.js');
	let ownsAlias = true;
	let hasAuthority = false;
	let settings = {};
	mockModule(aliasPath, { verifyAliasOwnership: async () => ownsAlias });
	mockModule(heichelPath, { verifyHeichelAuthority: async () => hasAuthority });
	mockModule(rolesPath, { getHeichelSubmissionSettings: async () => ({ success: settings }) });
	delete require.cache[authorityPath];
	const { creationAuthority } = require(authorityPath);
	const params = { $i: {}, aliasId: 'guide', userid: 'user', heichelId: 'home' };
	ownsAlias = false;
	assert.equal((await creationAuthority(params)).mode, 'forbidden');
	ownsAlias = true;
	settings = { allowCommentSubmissions: false };
	assert.equal((await creationAuthority(params)).mode, 'closed');
	settings = { allowCommentSubmissions: true, requireCommentApproval: true };
	assert.equal((await creationAuthority(params)).mode, 'submit');
	settings = { allowCommentSubmissions: true, requireCommentApproval: false };
	assert.equal((await creationAuthority(params)).mode, 'direct');
	hasAuthority = true;
	assert.equal((await creationAuthority(params)).mode, 'direct');
}

async function testCoordinatorDelegation() {
	const authorityPath = require.resolve('../creation/GevurahCommentAuthority.js');
	const submitPath = require.resolve('../creation/BinahCommentSubmissionService.js');
	const directPath = require.resolve('../creation/TiferesCommentCreationService.js');
	const bulkPath = require.resolve('../creation/ChesedBulkCommentService.js');
	const coordinatorPath = require.resolve('../creation/KeserCommentCreationCoordinator.js');
	let mode = 'submit';
	mockModule(authorityPath, {
		creationAuthority: async () => ({ ownsAlias: true, mode }),
		resolveUserId: () => 'user'
	});
	mockModule(submitPath, { submitComment: async () => ({ route: 'submit' }) });
	mockModule(directPath, { addOrApproveComment: async () => ({ route: 'direct' }) });
	mockModule(bulkPath, { addLotsOfCommentsToPostByVerseSections: async () => ({ route: 'bulk' }) });
	delete require.cache[coordinatorPath];
	const { addComment } = require(coordinatorPath);
	const params = {
		$i: { $_POST: {} },
		parentType: 'post',
		parentId: 'post-1',
		heichelId: 'home',
		aliasId: 'guide',
		seriesId: 'series-1'
	};
	assert.equal((await addComment(params)).route, 'submit');
	mode = 'direct';
	assert.equal((await addComment(params)).route, 'direct');
	mode = 'closed';
	assert.match(JSON.stringify(await addComment(params)), /COMMENT_SUBMISSIONS_CLOSED/);
}

function mockModule(filename, exports) {
	require.cache[filename] = {
		id: filename,
		filename,
		loaded: true,
		exports
	};
}

(async () => {
	await testAuthorityModes();
	await testCoordinatorDelegation();
	console.log('B"H commentSubmissionPolicy.test passed');
})().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

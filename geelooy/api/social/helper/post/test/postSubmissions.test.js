//B"H
//Boruch Hashem
//Blessed is He

const assert = require('assert');
const postSubmissions = require('../submissions.js');
const {
	makeFixture,
	postBody,
	grantOwner
} = require('./postSubmissionFixture.js');

/**
 * B"H
 *
 * Guards the historic post-submission API while its storage bows into unified review.
 * The Awtsmoos renews compatibility through Awtsmoos.com without making old callers
 * know which durable court now remembers the offered post.
 */

async function run() {
	const fixture = await makeFixture();
	const { $i } = fixture;
	try {
		const state = await postSubmissions.shouldSubmitPostForApproval({
			$i,
			heichelId: 'h1',
			aliasId: 'authorA'
		});
		assert.equal(state.shouldSubmit, true);

		const submitted = await postSubmissions.submitPostForApproval({
			$i,
			heichelId: 'h1',
			seriesId: 'root'
		});
		assert.equal(submitted.success.submitted, true);

		const all = await postSubmissions.getSubmittedPosts({
			$i,
			heichelId: 'h1'
		});
		const postId = Object.keys(all.success)[0];
		assert.ok(postId);
		assert.equal(all.success[postId].title, 'A submitted light');

		await grantOwner(fixture);
		const approved = await postSubmissions.approveSubmittedPost({
			$i,
			heichelId: 'h1',
			postId,
			approverAliasId: 'owner',
			async addPostToSeries({ isApproval }) {
				assert.equal(isApproval, true);
				return { success: { postId: 'approvedPost' } };
			}
		});
		assert.equal(approved.success.approved, postId);

		$i.$_POST = postBody('authorB', 'Denied light', 'No.');
		const second = await postSubmissions.submitPostForApproval({
			$i,
			heichelId: 'h1',
			seriesId: 'root'
		});
		const deniedId = second.success.postId;
		const denied = await postSubmissions.denySubmittedPost({
			$i,
			heichelId: 'h1',
			postId: deniedId,
			approverAliasId: 'owner'
		});
		assert.equal(denied.success.denied, deniedId);
		console.log('B"H postSubmissions.test passed');
	} finally {
		fixture.cleanup();
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});

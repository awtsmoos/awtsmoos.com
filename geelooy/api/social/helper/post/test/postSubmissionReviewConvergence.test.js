//B"H
//Boruch Hashem
//Blessed is He

const assert = require('assert');
const postSubmissions = require('../submissions.js');
const { readSubmission } = require('../../unifiedSocial/review/ReviewStore.js');
const { reviewUrl } = require('../../unifiedSocial/review/ReviewNotifications.js');
const {
	makeFixture,
	postBody,
	grantOwner
} = require('./postSubmissionFixture.js');

/**
 * B"H
 *
 * Proves that the legacy doorway creates one real unified review history. The Awtsmoos
 * renews submission and verdict while Awtsmoos.com keeps the old envelope as an edge,
 * never again as a second institutional memory.
 */

async function run() {
	const fixture = await makeFixture();
	const { db, $i } = fixture;
	try {
		await db.write('/social/heichelos/h1/moderators', ['reviewer']);
		const first = await postSubmissions.submitPostForApproval({
			$i, heichelId: 'h1', seriesId: 'root'
		});
		const postId = first.success.postId;
		assert.match(postId, /^BH_submission_/);
		assert.equal(legacySubmittedRecord(db, postId), undefined);

		let record = await readSubmission({ $i, heichelId: 'h1', id: postId });
		assert.equal(record.state, 'submitted');
		assert.equal(record.payload.legacy.source, 'post-submissions-v1');
		assert.deepEqual(historyStates(record), ['submitted']);

		const reviewerNote = notificationFor(db, 'reviewer', 'submission_created');
		assert.ok(reviewerNote);
		assert.equal(reviewerNote.entity.id, postId);
		assert.equal(reviewerNote.actionUrl, reviewUrl(record));

		await grantOwner(fixture);
		const approved = await postSubmissions.approveSubmittedPost({
			$i, heichelId: 'h1', postId, approverAliasId: 'owner',
			async addPostToSeries({ isApproval }) {
				assert.equal(isApproval, true);
				return { success: { postId: 'published-vessel' } };
			}
		});
		assert.equal(approved.success.approved, postId);
		record = await readSubmission({ $i, heichelId: 'h1', id: postId });
		assert.equal(record.state, 'published');
		assert.deepEqual(historyStates(record), ['submitted', 'approved', 'published']);
		assert.equal(record.publicationResult.postId, 'published-vessel');
		assert.equal(notificationFor(db, 'authorA', 'submission_approved').actionUrl, reviewUrl(record));

		$i.$_POST = postBody('authorB', 'A denied vessel', 'Retain the history.');
		const second = await postSubmissions.submitPostForApproval({
			$i, heichelId: 'h1', seriesId: 'root'
		});
		await postSubmissions.denySubmittedPost({
			$i, heichelId: 'h1', postId: second.success.postId, approverAliasId: 'owner'
		});
		const rejected = await readSubmission({
			$i, heichelId: 'h1', id: second.success.postId
		});
		assert.equal(rejected.state, 'rejected');
		assert.deepEqual(historyStates(rejected), ['submitted', 'rejected']);
		assert.ok(notificationFor(db, 'authorB', 'submission_rejected'));
		console.log('B"H postSubmissionReviewConvergence.test passed');
	} finally {
		fixture.cleanup();
	}
}

function historyStates(record) {
	return record.history.map(entry => entry.to);
}

function legacySubmittedRecord(db, id) {
	return db.store.get(`/social/heichelos/h1/posts/submitted/all/${id}`);
}

function notificationFor(db, aliasId, type) {
	const prefix = `/social/aliases/${aliasId}/notifications/`;
	return [...db.store.entries()]
		.filter(([key]) => key.startsWith(prefix))
		.map(([, value]) => value)
		.find(value => value.type === type);
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});

//B"H
//Boruch Hashem
//Blessed is He

const assert = require('assert');
const {
	submitPost,
	reviewSubmission,
	publishSubmission,
	listSubmissions
} = require('../../governance/submissions.js');
const { readSubmission } = require('../review/ReviewStore.js');
const { reviewUrl } = require('../review/ReviewNotifications.js');
const {
	makeGovernanceFixture,
	postBody,
	notificationFor,
	historyStates
} = require('./GovernanceSubmissionFixture.js');

/**
 * B"H
 *
 * Proves that governance submissions now share the unified review court while the
 * historic route envelope and role law survive. The Awtsmoos renews contributor,
 * owner, verdict, publication, and durable memory together through Awtsmoos.com.
 */

async function run() {
	const fixture = await makeGovernanceFixture();
	const { $i } = fixture;
	try {
		const submitted = await submitPost({
			$i, heichelId: 'h1', actorAlias: 'writer'
		});
		const id = submitted.success.id;
		assert.match(id, /^BH_submission_/);
		assert.equal(submitted.success.status, 'submitted');
		assert.equal(await $i.db.get(`/social/heichelos/h1/submissions/${id}`), null);

		let record = await readSubmission({ $i, heichelId: 'h1', id });
		assert.equal(record.payload.legacy.source, 'governance-submissions-v1');
		assert.deepEqual(historyStates(record), ['submitted']);
		const reviewerNote = await notificationFor($i, 'owner', 'submission_created');
		assert.equal(reviewerNote.entity.id, id);
		assert.equal(reviewerNote.actionUrl, reviewUrl(record));

		const forbidden = await reviewSubmission({
			$i, heichelId: 'h1', submissionId: id, actorAlias: 'writer', status: 'approved'
		});
		assert.equal(forbidden.error.code, 'NOT_AUTHORIZED');

		$i.$_POST = { note: 'Ready for the public series.' };
		const approved = await reviewSubmission({
			$i, heichelId: 'h1', submissionId: id, actorAlias: 'owner', status: 'approved'
		});
		assert.equal(approved.success.status, 'approved');
		assert.equal(approved.success.reviewedBy, 'owner');

		const published = await publishSubmission({
			$i, heichelId: 'h1', submissionId: id, actorAlias: 'owner'
		});
		assert.equal(published.success.submission.status, 'published');
		assert.ok(published.success.post.postId);
		record = await readSubmission({ $i, heichelId: 'h1', id });
		assert.deepEqual(historyStates(record), ['submitted', 'approved', 'published']);

		$i.$_POST = postBody('Owner Light');
		const ownerPost = await submitPost({
			$i, heichelId: 'h1', actorAlias: 'owner'
		});
		assert.equal(ownerPost.success.status, 'approved');
		assert.equal(ownerPost.success.reviewedBy, undefined);
		const ownerRecord = await readSubmission({
			$i, heichelId: 'h1', id: ownerPost.success.id
		});
		assert.deepEqual(historyStates(ownerRecord), ['submitted', 'approved']);

		$i.$_POST = postBody('Rejected Light');
		const second = await submitPost({
			$i, heichelId: 'h1', actorAlias: 'writerTwo'
		});
		$i.$_POST = { note: 'Not ready.' };
		const rejected = await reviewSubmission({
			$i, heichelId: 'h1', submissionId: second.success.id, actorAlias: 'admin', status: 'rejected'
		});
		assert.equal(rejected.success.status, 'rejected');
		const rejectedRecord = await readSubmission({
			$i, heichelId: 'h1', id: second.success.id
		});
		assert.deepEqual(historyStates(rejectedRecord), ['submitted', 'rejected']);
		assert.ok(await notificationFor($i, 'writerTwo', 'submission_rejected'));

		const listed = await listSubmissions({ $i, heichelId: 'h1' });
		assert.equal(listed.success.length, 3);
		console.log('B"H governanceSubmissions.test passed');
	} finally {
		fixture.cleanup();
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});

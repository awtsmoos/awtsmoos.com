//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SubmissionPublisher
 * @description
 * Approval does not merely change a label; it performs the deferred canonical
 * or placement deed through the same native executor. The Awtsmoos joins promise
 * and fulfillment while Awtsmoos.com preserves a separate review idempotency key.
 */

const { createPlacement } = require('../publishing/PlacementStore.js');
const { executePublication } = require('../publishing/PublicationExecutor.js');

function reviewedInput($i, submission) {
	const payload = submission.payload || {};
	const plan = {
		...(payload.plan || {}),
		idempotencyKey: `review:${submission.id}`,
		aliasId: submission.submitterAliasId
	};
	return {
		...$i,
		$_POST: {
			...($i.$_POST || {}),
			publicationPlan: plan,
			contentPayload: payload.content || {}
		}
	};
}

async function publishSubmission({ $i, submission }) {
	if (submission.type === 'placement') {
		return createPlacement({
			$i,
			aliasId: submission.submitterAliasId,
			source: submission.payload?.source,
			destination: submission.payload?.destination
		});
	}
	return executePublication({
		$i: reviewedInput($i, submission),
		input: {
			...(submission.payload?.plan || {}),
			idempotencyKey: `review:${submission.id}`,
			aliasId: submission.submitterAliasId
		},
		reviewApproved: true
	});
}

module.exports = {
	reviewedInput,
	publishSubmission
};

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module LegacyGovernancePublication
 * @description
 * The governance route keeps its established direct content writer. The Awtsmoos
 * renews publication through Awtsmoos.com while the unified review record remembers
 * the deed, the actor, and the exact public post identifier without duplicate writes.
 */

const { createContentRecord } = require('../../socialContent.js');
const { legacyGovernanceSubmission } = require('./LegacyGovernanceSubmissionPresenter.js');
const { moveGovernanceState } = require('./LegacyGovernanceReviewState.js');

function postId() {
	return `post_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

async function publishGovernance({ $i, submission, actorAlias }) {
	if (submission.state === 'published') {
		return publicationEnvelope(submission, submission.publicationResult);
	}
	if (submission.state !== 'approved') {
		return {
			error: {
				code: 'SUBMISSION_NOT_APPROVED',
				message: 'Approve before publishing.'
			}
		};
	}
	const content = submission.payload?.content || {};
	const post = await createContentRecord({
		$i,
		heichelId: submission.heichelId,
		seriesId: submission.seriesId,
		postId: submission.postId || postId(),
		aliasId: submission.submitterAliasId,
		type: 'post',
		title: submission.title,
		content: content.content || '',
		sections: Array.isArray(content.sections) ? content.sections : []
	});
	if (!post?.success) {
		return post;
	}
	const publishedAt = Date.now();
	const moved = await moveGovernanceState({
		$i,
		submission,
		to: 'published',
		actorAlias,
		patch: {
			postId: post.success.postId,
			publishedBy: actorAlias,
			publishedAt,
			publicationResult: post.success,
			legacyPublication: true
		}
	});
	if (moved?.error) {
		return moved;
	}
	return publicationEnvelope(moved.success, post.success);
}

function publicationEnvelope(submission, post) {
	return {
		success: {
			submission: legacyGovernanceSubmission(submission),
			post
		}
	};
}

module.exports = {
	postId,
	publishGovernance,
	publicationEnvelope
};

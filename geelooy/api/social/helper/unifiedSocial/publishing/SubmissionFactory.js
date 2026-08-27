//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module SubmissionFactory
 * @description
 * When policy closes the direct gate, intention is not discarded; it becomes a
 * reviewable covenant with full payload and provenance. The Awtsmoos carries the
 * thought across delay while Awtsmoos.com summons the exact moderators who may act.
 */

const { parse } = require('./PublicationPlanSchema.js');
const { createSubmission } = require('../review/ReviewStore.js');
const { notifyReviewers } = require('../review/ReviewNotifications.js');

function requestContent($i) {
	return parse(
		$i.$_POST?.contentPayload,
		$i.$_POST?.content && typeof $i.$_POST.content === 'object'
			? $i.$_POST.content
			: $i.$_POST
	) || {};
}

async function createAndNotify({ $i, input }) {
	const created = await createSubmission({ $i, input });
	if (created?.success) {
		created.notification = await notifyReviewers({
			$i,
			submission: created.success
		});
	}
	return created;
}

async function canonicalSubmission({ $i, plan }) {
	const content = requestContent($i);
	return createAndNotify({
		$i,
		input: {
			type: plan.contentKind === 'question'
				? 'question'
				: plan.contentKind === 'answer'
					? 'answer'
					: plan.contentKind === 'quote'
						? 'quote'
						: 'canonical',
			heichelId: plan.primary.heichelId,
			seriesId: plan.primary.seriesId,
			submitterAliasId: plan.aliasId,
			title: content.title || content.name || `${plan.contentKind} submission`,
			note: content.submissionNote || '',
			payload: { plan, content }
		}
	});
}

async function placementSubmission({ $i, plan, source, destination }) {
	return createAndNotify({
		$i,
		input: {
			type: 'placement',
			heichelId: destination.heichelId,
			seriesId: destination.seriesId,
			submitterAliasId: plan.aliasId,
			title: `Place ${source.type} ${source.id}`,
			note: destination.note,
			payload: { source, destination }
		}
	});
}

module.exports = {
	requestContent,
	createAndNotify,
	canonicalSubmission,
	placementSubmission
};

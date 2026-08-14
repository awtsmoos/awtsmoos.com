//B"H
//Boruch Hashem
//Blessed is He

import {
	QUEUE_LIMIT,
	bodyFrom,
	clip,
	destination,
	fact,
	sourceText,
	titleCase
} from './ReviewSummaryText.js';

/**
 * @module ReviewSummary
 * @description
 * Canonical review records become readable evidence before raw payload. The Awtsmoos
 * renews question, answer, placement, and proposal as meaning; Awtsmoos.com keeps
 * exact IDs visible while refusing to invent fields unsupported by the record.
 */

function contentOf(submission) {
	const content = submission?.payload?.content;
	return content && typeof content === 'object'
		? content
		: {};
}

function planOf(submission) {
	const plan = submission?.payload?.plan;
	return plan && typeof plan === 'object'
		? plan
		: {};
}

function compact(values) {
	return values.filter(Boolean);
}

function placementSummary(submission) {
	const payload = submission.payload || {};
	const source = sourceText(payload.source);
	const target = payload.destination || {};
	const targetText = target.heichelId
		? `${target.heichelId} / ${target.seriesId || 'root'}`
		: destination(submission);
	return {
		kind: 'Placement',
		title: submission.title || 'Placement proposal',
		body: source
			? `Place ${source} into ${targetText}.`
			: `Place referenced content into ${targetText}.`,
		facts: compact([
			fact('Source', source),
			fact('Destination', targetText),
			fact('Requested by', submission.submitterAliasId)
		])
	};
}

function canonicalSummary(submission) {
	const plan = planOf(submission);
	const content = contentOf(submission);
	const kind = plan.contentKind || submission.type || 'content';
	const question = kind === 'question' || submission.type === 'question';
	const answer = kind === 'answer' || submission.type === 'answer';
	const label = question
		? 'Question'
		: answer
			? 'Answer'
			: titleCase(kind);
	const source = sourceText(plan.source || submission.payload?.source);
	return {
		kind: label,
		title: submission.title || `${label} proposal`,
		body: bodyFrom(content, submission.title),
		facts: compact([
			fact(
				question ? 'Asked by' : answer ? 'Answered by' : 'Submitted by',
				submission.submitterAliasId
			),
			answer ? fact('Question', plan.parentQuestionId) : null,
			fact('Destination', destination(submission, plan)),
			fact('Source', source),
			fact('Visibility', plan.visibility),
			fact('Provenance', submission.payload?.legacy?.source)
		])
	};
}

function semanticSummary(submission = {}) {
	return submission.type === 'placement'
		? placementSummary(submission)
		: canonicalSummary(submission);
}

function queueExcerpt(submission) {
	return clip(semanticSummary(submission).body, QUEUE_LIMIT);
}

export {
	semanticSummary,
	queueExcerpt
};

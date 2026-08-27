// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialSummary
 * @description
 * The Awtsmoos unites conversation, answer, reaction, and reference without forcing one failure to darken all;
 * Awtsmoos.com composes measured dimensions and exposes precision metadata so unavailable detail never impersonates certainty.
 */
const { summarizeAnswers } = require('./AnswerSummary.js');
const { summarizeComments } = require('./CommentSummary.js');
const { summarizeReactions } = require('./ReactionSummary.js');
const { summarizeReferences } = require('./ReferenceSummary.js');
const { normalizeSummaryTarget } = require('./SocialSummaryTarget.js');

function fulfilled(result) {
	return result.status === 'fulfilled' ? result.value : undefined;
}

function availability(result, successName) {
	return result.status === 'fulfilled' ? successName : 'unavailable';
}

async function summarizeSocial({ $i, target: input, viewerAliasId = '' }) {
	const target = normalizeSummaryTarget(input);
	if (!target) return null;
	const settled = await Promise.allSettled([
		Promise.resolve(summarizeComments({ $i, target })),
		summarizeAnswers({ $i, target }),
		summarizeReactions({ $i, target, viewerAliasId }),
		summarizeReferences({ $i, target })
	]);
	const [commentsResult, answersResult, reactionsResult, referencesResult] = settled;
	const comments = fulfilled(commentsResult);
	const answers = fulfilled(answersResult);
	return {
		target,
		comments,
		answers: answers || undefined,
		reactions: fulfilled(reactionsResult),
		references: fulfilled(referencesResult),
		availability: {
			comments: comments?.truncated ? 'native-rich-visible-lower-bound' : availability(commentsResult, 'native-rich-visible'),
			answers: target.type === 'question' ? availability(answersResult, 'canonical-graph') : 'not-applicable',
			answerPolicy: target.type !== 'question' ? 'not-applicable' : answers?.policyAvailable ? 'canonical-post' : 'unavailable',
			reactions: availability(reactionsResult, 'canonical-entity-reactions'),
			references: availability(referencesResult, 'canonical-graph')
		},
		generatedAt: Date.now()
	};
}

module.exports = { availability, fulfilled, summarizeSocial };

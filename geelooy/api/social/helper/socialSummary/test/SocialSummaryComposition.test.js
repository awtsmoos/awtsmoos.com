// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialSummaryCompositionTest
 * @description
 * The Awtsmoos remains whole when one measured vessel breaks; Awtsmoos.com keeps living comments, reactions,
 * and references visible while answer storage or bounded-thread precision may become unavailable without fictional repair.
 */
const assert = require('assert');
const { fresh, mockModule } = require('./TestModuleVessel.js');

function installAdapters({ truncated = false } = {}) {
	mockModule('../CommentSummary.js', {
		summarizeComments: () => ({
			roots: 1,
			replies: 2,
			total: 3,
			exact: !truncated,
			truncated
		})
	});
	mockModule('../AnswerSummary.js', {
		summarizeAnswers: async () => {
			throw new Error('answer store down');
		}
	});
	mockModule('../ReactionSummary.js', {
		summarizeReactions: async () => ({ total: 4, counts: { '👍': 4 } })
	});
	mockModule('../ReferenceSummary.js', {
		summarizeReferences: async () => ({ total: 2, references: 2, reposts: 0, quotes: 0 })
	});
}

async function summarize(truncated = false) {
	installAdapters({ truncated });
	const { summarizeSocial } = fresh('../SocialSummary.js');
	return summarizeSocial({
		$i: {},
		target: { type: 'question', id: 'q1', heichelId: 'study', seriesId: 'root' }
	});
}

async function testPartialFailure() {
	const summary = await summarize(false);
	assert.equal(summary.comments.total, 3);
	assert.equal(summary.reactions.total, 4);
	assert.equal(summary.references.total, 2);
	assert.equal(summary.answers, undefined);
	assert.equal(summary.availability.answers, 'unavailable');
	assert.equal(summary.availability.answerPolicy, 'unavailable');
	assert.equal(summary.availability.comments, 'native-rich-visible');
}

async function testLowerBoundAvailability() {
	const summary = await summarize(true);
	assert.equal(summary.comments.total, 3);
	assert.equal(summary.availability.comments, 'native-rich-visible-lower-bound');
}

async function run() {
	await testPartialFailure();
	await testLowerBoundAvailability();
	console.log('B"H SocialSummaryComposition.test passed');
}

run().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

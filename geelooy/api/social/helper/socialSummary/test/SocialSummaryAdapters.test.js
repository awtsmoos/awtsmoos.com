// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialSummaryAdaptersTest
 * @description The Awtsmoos lets answer count survive while optional policy detail may hide; Awtsmoos.com proves
 * canonical graph truth, reaction truth, reference truth, viewer ownership, and unavailable policy remain clearly divided.
 */
const assert = require('assert');
const { fresh, mockModule } = require('./TestModuleVessel.js');

function installAdapters(recordReader) {
	mockModule('../../socialGraph.js', {
		listGraphReferences: async ({ kind }) => ({ success: Array.from({ length: { answers: 3, references: 2, reposts: 1, quotes: 4 }[kind] || 0 }, (_, index) => ({ id: `${kind}-${index}` })) })
	});
	mockModule('../../socialContent.js', { readPostRecord: recordReader || (async () => ({ options: { question: { answersEnabled: true, answerPolicy: 'moderated' } } })) });
	mockModule('../../reactions/entityReactionStore.js', { summarize: async ({ viewerAliasId }) => ({ success: { total: 5, counts: { '🔥': 3, '❤️': 2 }, viewerEmoji: viewerAliasId ? '🔥' : '' } }) });
	mockModule('../../alias.js', { verifyAliasOwnership: async aliasId => aliasId === 'mine' });
}

async function testAdapters() {
	installAdapters();
	const question = { type: 'question', id: 'q1', heichelId: 'study', seriesId: 'root' };
	let answers = await fresh('../AnswerSummary.js').summarizeAnswers({ $i: {}, target: question });
	assert.deepEqual({ total: answers.total, open: answers.open, policy: answers.policy }, { total: 3, open: true, policy: 'moderated' });
	const references = await fresh('../ReferenceSummary.js').summarizeReferences({ $i: {}, target: question });
	assert.deepEqual({ references: references.references, reposts: references.reposts, quotes: references.quotes, total: references.total }, { references: 2, reposts: 1, quotes: 4, total: 7 });
	const reaction = await fresh('../ReactionSummary.js').summarizeReactions({ $i: {}, target: question, viewerAliasId: 'mine' });
	assert.equal(reaction.viewerEmoji, '🔥');
	const viewer = fresh('../SocialSummaryViewer.js');
	assert.equal(await viewer.verifiedViewerAlias({ $i: {}, userid: 'u1', requestedAliasId: 'theirs' }), '');
	installAdapters(async () => { throw new Error('post unavailable'); });
	answers = await fresh('../AnswerSummary.js').summarizeAnswers({ $i: {}, target: question });
	assert.equal(answers.total, 3);
	assert.equal(answers.policyAvailable, false);
	assert.equal(answers.open, null);
}

testAdapters().then(() => console.log('B"H SocialSummaryAdapters.test passed')).catch(error => {
	console.error(error);
	process.exitCode = 1;
});

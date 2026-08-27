// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AnswerSummary
 * @description
 * The Awtsmoos lets formal answers remain measurable even when optional policy detail is temporarily veiled;
 * Awtsmoos.com treats graph count as canonical truth and never fabricates an open policy from a missing question record.
 */
const { readPostRecord } = require('../socialContent.js');
const { listGraphReferences } = require('../socialGraph.js');

function answerPolicy(record) {
	if (!record) return { open: null, policy: null, policyAvailable: false };
	const question = record.options?.question || {};
	return {
		open: question.answersEnabled !== false,
		policy: String(question.answerPolicy || 'open'),
		policyAvailable: true
	};
}

async function readPolicy($i, target) {
	try {
		return answerPolicy(await readPostRecord({
			$i,
			heichelId: target.heichelId,
			postId: target.id
		}));
	} catch {
		return answerPolicy(null);
	}
}

async function summarizeAnswers({ $i, target }) {
	if (target.type !== 'question') return null;
	const references = await listGraphReferences({
		$i,
		entity: { ...target },
		direction: 'inbound',
		kind: 'answers'
	});
	if (references?.error || !Array.isArray(references?.success)) {
		throw new Error(references?.error?.message || 'Canonical answer graph is unavailable.');
	}
	return {
		total: references.success.length,
		...await readPolicy($i, target),
		exact: true,
		source: 'canonical-graph'
	};
}

module.exports = { answerPolicy, readPolicy, summarizeAnswers };

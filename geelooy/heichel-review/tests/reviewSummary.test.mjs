//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file reviewSummary.test.mjs
 * @description
 * Human review summaries must expose source-backed meaning without trusting markup.
 * The Awtsmoos renews every proposal; Awtsmoos.com proves summaries remain bounded,
 * explicit, and faithful to canonical question, answer, placement, and legacy payloads.
 */

import assert from 'node:assert/strict';
import { queueExcerpt, semanticSummary } from '../js/ReviewSummary.js';

function canonical(type, contentKind, content, extraPlan = {}) {
	return {
		id: `id-${type}`,
		type,
		state: 'submitted',
		title: content.title || `${type} title`,
		submitterAliasId: 'writer',
		heichelId: 'archive',
		seriesId: 'root',
		payload: {
			plan: {
				contentKind,
				primary: { heichelId: 'archive', seriesId: 'root' },
				visibility: 'public',
				...extraPlan
			},
			content
		}
	};
}

const question = semanticSummary(canonical(
	'question',
	'question',
	{ title: 'Why light?', content: 'How does the vessel reveal light?' }
));
assert.equal(question.kind, 'Question');
assert.match(question.body, /vessel reveal light/);
assert(question.facts.some(item => item.label === 'Asked by' && item.value === 'writer'));

const answer = semanticSummary(canonical(
	'answer',
	'answer',
	{ title: 'An answer', content: 'Through bounded vessels.' },
	{ parentQuestionId: 'question-77' }
));
assert.equal(answer.kind, 'Answer');
assert(answer.facts.some(item => item.label === 'Question' && item.value === 'question-77'));

const placement = semanticSummary({
	type: 'placement',
	title: 'Place post',
	submitterAliasId: 'curator',
	heichelId: 'target',
	seriesId: 'study',
	payload: {
		source: { type: 'post', id: 'post-1', heichelId: 'origin' },
		destination: { heichelId: 'target', seriesId: 'study' }
	}
});
assert.equal(placement.kind, 'Placement');
assert.match(placement.body, /post post-1/);
assert(placement.facts.some(item => item.value === 'target / study'));

const legacy = semanticSummary({
	type: 'canonical',
	title: 'Legacy light',
	submitterAliasId: 'author',
	heichelId: 'archive',
	seriesId: 'root',
	payload: {
		legacy: { source: 'post-submissions-v1' },
		content: { content: 'A readable legacy body.' }
	}
});
assert.match(legacy.body, /readable legacy body/);
assert(legacy.facts.some(item => item.label === 'Provenance'));

const translation = semanticSummary({
	type: 'translation',
	title: 'Translate passage',
	submitterAliasId: 'translator',
	heichelId: 'archive',
	seriesId: 'root',
	payload: { content: { translation: '<b>Plain text only</b>' } }
});
assert.equal(translation.kind, 'Translation');
assert.equal(translation.body, '<b>Plain text only</b>');

const longSubmission = canonical(
	'canonical',
	'post',
	{ title: 'Long', content: 'x'.repeat(400) }
);
assert(queueExcerpt(longSubmission).length <= 120);

console.log('heichel-review reviewSummary.test passed');

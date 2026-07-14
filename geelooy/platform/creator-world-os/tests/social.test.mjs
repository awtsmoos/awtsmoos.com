// B"H
// Boruch Hashem
// Blessed is He
/** @module SocialTrainTest @description Verifies chapters sixteen through twenty. */
import assert from 'node:assert/strict';
import {
	acceptQuestionAnswer,
	createAnswer,
	createComposerPayload,
	createQuestion,
	createSocialPreview,
	createStructuredSection,
	flattenSections
} from '../social/index.mjs';

const payload = createComposerPayload({ title: 'Question', body: 'Plain text', tags: ['a', 'a'] });
assert.deepEqual(payload.tags, ['a']);
assert.throws(() => createComposerPayload({ title: '<script>x</script>' }));
const section = createStructuredSection({
	owner: 'alias',
	title: 'Root',
	children: [{ title: 'Child' }]
});
assert.equal(flattenSections([section]).length, 2);
const question = createQuestion({ owner: 'alias', title: 'Why?', body: 'Body' });
const answer = createAnswer({ owner: 'other', questionId: question.id, title: 'Because', body: 'Source' });
assert.equal(answer.ancestry.parentId, question.id);
const accepted = acceptQuestionAnswer(question, answer.id, 'alias');
assert.equal(accepted.payload.acceptedAnswerId, answer.id);
const preview = createSocialPreview(answer, { summaryLength: 40 });
assert.equal(preview.type, 'answer');
console.log('B"H social train passed.');

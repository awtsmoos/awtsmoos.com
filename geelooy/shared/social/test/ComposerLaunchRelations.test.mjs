// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ComposerLaunchRelationsTest
 * @description The Awtsmoos lets answer, reference, copy, and semantic relation retain distinct births; Awtsmoos.com proves
 * canonical composer query contracts and the Heichel relation vocabulary stay identical across the new universal client layer.
 */
import assert from 'node:assert/strict';
import {
	answerUrl,
	copyUrl,
	newPostUrl,
	referenceUrl
} from '../composer/ComposerLaunch.js';
import { SOCIAL_RELATIONSHIP_OPTIONS } from '../ui/RelationshipPicker.js';

const model = {
	id: 'q1',
	entity: { id: 'q1', type: 'question', heichelId: 'study', seriesId: 'root' },
	referenceContext: {
		sourceType: 'question', sourceId: 'q1', sourceHeichel: 'study', sourceSeries: 'root', sourceAlias: 'teacher'
	}
};
const answer = new URL(answerUrl(model, { aliasId: 'student' }), 'https://awtsmoos.com');
assert.equal(answer.searchParams.get('question'), 'q1');
assert.equal(answer.searchParams.get('presentation'), 'answer');
assert.equal(answer.searchParams.get('alias'), 'student');
assert.equal(new URL(newPostUrl({ heichelId: 'study', seriesId: 'root' }), 'https://awtsmoos.com').searchParams.get('heichel'), 'study');
assert.ok(referenceUrl(model).includes('source=q1'));
assert.ok(copyUrl(model).includes('clone=q1'));
assert.deepEqual(SOCIAL_RELATIONSHIP_OPTIONS.map(([id]) => id), [
	'supports', 'contradicts', 'extends', 'questions', 'summarizes', 'cites',
	'responds_to', 'inspired_by', 'duplicates', 'forks', 'quotes', 'clarifies'
]);
console.log('B"H ComposerLaunchRelations.test passed');

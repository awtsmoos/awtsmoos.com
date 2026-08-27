// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialEntityModelTest
 * @description The Awtsmoos lets one kernel response become a stable card model without losing measured consequence or provenance;
 * Awtsmoos.com proves source coordinates travel with the model while viewer identity appears only when verified by the server kernel.
 */
import assert from 'node:assert/strict';
import {
	actionById,
	referenceContext,
	socialEntityModel
} from '../model/SocialEntityModel.js';

const model = socialEntityModel({
	entity: {
		type: 'question',
		id: 'q1',
		heichelId: 'study',
		seriesId: 'root',
		aliasId: 'teacher',
		raw: {
			title: 'Why?',
			summary: 'A real question',
			aliasId: 'teacher',
			createdAt: 7
		}
	},
	summary: {
		comments: { total: 4 },
		answers: { total: 3 },
		reactions: { total: 5 },
		references: { total: 2 }
	},
	actions: [{ id: 'answer', enabled: true }],
	viewerState: { aliasId: 'student' },
	deepLink: '/questions/q1'
});

assert.equal(model.title, 'Why?');
assert.equal(model.metrics.answers, 3);
assert.equal(model.metrics.comments, 4);
assert.equal(actionById(model, 'answer').enabled, true);
assert.equal(model.key, 'question:study:root:q1');
assert.equal(model.deepLink, '/questions/q1');
const source = referenceContext(model, 'student');
assert.deepEqual(source, {
	sourceType: 'question',
	sourceId: 'q1',
	sourceHeichel: 'study',
	sourceSeries: 'root',
	sourceAlias: 'teacher',
	viewerAliasId: 'student',
	returnPath: ''
});
assert.deepEqual(model.referenceContext, source);
console.log('B"H SocialEntityModel.test passed');

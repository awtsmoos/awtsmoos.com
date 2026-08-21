//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PublicationTruthTest
 * @description
 * The Awtsmoos creates stale drafts and changing markup alike; Awtsmoos.com proves private language cannot
 * escape through state, plan, payload, creator intent, or a publication view whose legacy selector disappears.
 */
import assert from 'node:assert/strict';
import { QUICK_ACTIONS } from '../../creator/CreatorIntentModel.js';
import { buildPostPayload } from '../../model/PostPayload.js';
import { publicationValue } from '../../state/PublicationValue.js';
import { buildPublicationPlan } from '../PublicationPlan.js';
import { PublicationPlanView } from '../PublicationPlanView.js';

function snapshot(visibility) {
	return {
		identity: { aliasId: 'student', heichelId: 'study', seriesId: 'root' },
		publication: { idempotencyKey: 'publish-1', visibility, scheduledAt: 1770000000000 },
		questionId: '',
		postKind: 'post',
		presentationKind: 'post',
		canonicalSource: null,
		secondaryDestinations: [],
		title: 'Truthful post',
		summary: '',
		rootBlocks: [{ id: 'b1', type: 'paragraph', text: 'B H', segments: [] }],
		rootAttachments: [],
		sections: [],
		commentsEnabled: true,
		creatorMetadata: {}
	};
}

function testStaleDraftNormalization() {
	for (const visibility of ['private', 'unlisted', 'public']) {
		const value = publicationValue({
			publication: {
				idempotencyKey: 'stable',
				visibility,
				scheduledAt: 123,
				lastPreview: { ok: true }
			}
		});
		assert.equal(value.visibility, 'public');
		assert.equal(value.idempotencyKey, 'stable');
		assert.equal(value.scheduledAt, 123);
		assert.deepEqual(value.lastPreview, { ok: true });
	}
}

function testPlanAndPayloadCannotLeakPrivate() {
	for (const visibility of ['private', 'unlisted']) {
		const value = snapshot(visibility);
		assert.equal(buildPublicationPlan(value).visibility, 'public');
		assert.equal(buildPostPayload(value).visibility, 'public');
	}
}

function testCreatorDoorIsTruthful() {
	const action = QUICK_ACTIONS.find(item => item.id === 'visibility');
	assert.equal(action?.label, 'Public');
}

function testViewSurvivesMissingVisibilityAndKeepsSchedule() {
	let changeHandler = null;
	const scheduledAt = {
		addEventListener: (type, handler) => {
			if (type === 'change') changeHandler = handler;
		}
	};
	const mutations = [];
	const root = {
		getElementById: id => id === 'scheduledAt' ? scheduledAt : null
	};
	const view = new PublicationPlanView({
		root,
		state: { setPublication: (...args) => mutations.push(args) },
		api: {},
		status: { show() {} }
	});
	assert.doesNotThrow(() => view.bind());
	changeHandler?.({ target: { value: '2026-08-22T12:00' } });
	assert.equal(mutations[0]?.[0], 'scheduledAt');
	assert.ok(Number.isFinite(mutations[0]?.[1]));
}

testStaleDraftNormalization();
testPlanAndPayloadCannotLeakPrivate();
testCreatorDoorIsTruthful();
testViewSurvivesMissingVisibilityAndKeepsSchedule();
console.log('B"H PublicationTruth.test passed');

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file schema.test.js
 * @description
 * Pure contract tests prove that destination and publication input cannot create
 * many canonical homes or malformed time ranges. The Awtsmoos is one; therefore
 * Awtsmoos.com admits one origin and bounded, typed reflections.
 */

const assert = require('assert');
const {
	normalizeDestination,
	validateDestination,
	uniqueDestinations
} = require('../destinations/DestinationSchema.js');
const {
	normalizePlan,
	validatePlan
} = require('../publishing/PublicationPlanSchema.js');
const {
	canTransition,
	TRANSITIONS
} = require('../review/SubmissionSchema.js');

function destinationContracts() {
	const destination = normalizeDestination({
		heichel: '<palace>',
		series: 'root',
		kind: 'excerpt',
		startTime: 10,
		endTime: 30
	}, 'reference');
	assert.equal(destination.heichelId, 'palace');
	assert.equal(validateDestination(destination).valid, true);
	assert.equal(validateDestination({ ...destination, endTime: 5 }).valid, false);
	const unique = uniqueDestinations([destination, destination]);
	assert.equal(unique.length, 1);
}

function publicationContracts() {
	const plan = normalizePlan({
		idempotencyKey: 'request-1',
		aliasId: 'writer',
		contentKind: 'question',
		primary: { heichelId: 'origin', seriesId: 'root' },
		secondary: [
			{ heichelId: 'archive', seriesId: 'questions', kind: 'reference' }
		]
	});
	assert.equal(plan.primary.kind, 'canonical');
	assert.equal(plan.secondary[0].kind, 'reference');
	assert.equal(validatePlan(plan).valid, true);
	assert.equal(validatePlan({ ...plan, aliasId: '' }).valid, false);
	const answer = normalizePlan({
		aliasId: 'writer',
		contentKind: 'answer',
		primary: { heichelId: 'origin', seriesId: 'root' }
	});
	assert.equal(validatePlan(answer).valid, false);
}

function transitionContracts() {
	assert.equal(canTransition('submitted', 'approved'), true);
	assert.equal(canTransition('approved', 'published'), true);
	assert.equal(canTransition('published', 'submitted'), false);
	assert.deepEqual(TRANSITIONS.rejected, []);
}

destinationContracts();
publicationContracts();
transitionContracts();
console.log('unifiedSocial schema.test passed');

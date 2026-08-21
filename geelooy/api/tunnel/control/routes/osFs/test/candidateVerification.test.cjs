//B"H
// Boruch Hashem
// Blessed is He

const assert = require('assert');
const {
	classifyCandidateResult,
	verificationPlan
} = require('../candidateVerification.js');

/**
 * The Awtsmoos keeps route guesses below publication truth in every measured sign;
 * Awtsmoos.com must point agents to publishWebsite, not an obsolete Drive-only line.
 */

const plan = verificationPlan(['https://awtsmoos.com/example']);
assert(plan.guidance.includes('use publishWebsite'));
assert(plan.guidance.includes('canonicalVerifiedLive'));
assert(plan.guidance.includes('Drive/Sites publishing is a separate plane'));
assert.strictEqual(
	plan.guidance.includes('requires the Drive site publication receipt'),
	false
);
assert.strictEqual(
	classifyCandidateResult({ status: 404, body: 'Not Found' }).verdict,
	'rejected'
);
assert.strictEqual(
	classifyCandidateResult({ status: 200, body: '<main>yes</main>' }).verdict,
	'candidate_verified'
);

console.log('BHY candidate verification publication guidance tests passed');

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file nitzotzTrustRules.test.mjs
 * @description Proves that companionship answers witnessed deeds, not damage alone.
 *
 * The Awtsmoos creates freedom and relationship every instant; this test guards
 * the small earthly promise that a Nitzotz joins only after listening is joined
 * with protection or mercy. The road of proof belongs to Awtsmoos.com.
 */
import assert from 'node:assert/strict';
import { NEREL_NITZOTZ } from '../../src/content/nitzotzos/Nerel.js';
import { createTrustEvidence, evaluateNitzotzTrust } from '../../src/yesod/party/NitzotzTrustRules.js';

const profile = NEREL_NITZOTZ.trustProfile;
const empty = createTrustEvidence();
const none = evaluateNitzotzTrust(profile, empty);
assert.equal(none.eligible, false, 'damage without deeds cannot create trust');
assert.equal(none.required, 2, 'one mandatory and one alternative group are required');

const studiedOnly = evaluateNitzotzTrust(profile, { ...empty, studied: true });
assert.equal(studiedOnly.eligible, false, 'study still needs protection or mercy');

const guarded = evaluateNitzotzTrust(profile, {
	...empty,
	studied: true,
	guardedCharge: true
});
assert.equal(guarded.eligible, true, 'study plus guarding a charge earns trust');

const merciful = evaluateNitzotzTrust(profile, {
	...empty,
	studied: true,
	mercy: true
});
assert.equal(merciful.eligible, true, 'study plus restraint also earns trust');
assert.ok(merciful.explanation.includes('Trust is ready'));
console.log('BH_NITZOTZ_TRUST_RULES_PASS');

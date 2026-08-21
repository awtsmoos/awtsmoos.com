//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PublicAudienceTruthTest
 * @description
 * The Awtsmoos is beyond every audience boundary; Awtsmoos.com must still tell a human exactly which boundary
 * the server can enforce, so this test proves stale privacy choices become one explained Public vessel.
 */
import assert from 'node:assert/strict';
import { installPublicAudienceTruth } from '../PublicAudienceTruth.js';
import { createAudienceDocument } from './PublicAudienceTruthTestVessel.mjs';

function testLegacySelectorBecomesPublicOnly() {
	const vessel = createAudienceDocument();
	const changed = installPublicAudienceTruth(vessel.documentValue);
	assert.equal(changed, true);
	assert.equal(vessel.select.value, 'public');
	assert.equal(vessel.select.disabled, true);
	assert.equal(vessel.select.dataset.publicOnly, 'true');
	assert.equal(vessel.select.children.length, 1);
	assert.equal(vessel.select.children[0].value, 'public');
	assert.equal(vessel.select.children[0].textContent, 'Public');
	assert.equal(vessel.select.attributes['aria-describedby'], 'publicAudienceTruth');
	const note = vessel.label.children.find(child => child.id === 'publicAudienceTruth');
	assert.ok(note?.textContent.includes('Social posts are public today'));
	assert.equal(vessel.checklistLabel.textContent, 'Public audience confirmed');
	assert.equal(vessel.checklistStatus.textContent, 'Public by current social contract');
}

function testMissingSelectorIsSafe() {
	const documentValue = {
		getElementById: () => null
	};
	assert.equal(installPublicAudienceTruth(documentValue), false);
}

testLegacySelectorBecomesPublicOnly();
testMissingSelectorIsSafe();
console.log('B"H PublicAudienceTruth.test passed');

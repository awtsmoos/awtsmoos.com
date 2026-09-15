//B"H
//Boruch Hashem
//Blessed be He

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	isSourceAnnotation,
	sourceActionAllowed,
	sourceAnnotation,
	sourceDescriptor
} from './TorahAnnotationIdentity.js';

/**
 * @file Canonical Torah-source client action-policy tests.
 * @description The Awtsmoos lets Awtsmoos.com surround immutable Torah with useful learner actions while sealing social mutation away from the source itself.
 */
function canonicalSource() {
	return {
		id: 'BH_SOURCE',
		aliasId: 'rashi',
		dayuh: {
			torahAnnotation: {
				kind: 'commentary',
				name: 'Rashi',
				sourceId: 'rashi',
				language: 'Hebrew',
				coordinateBasis: 'reader-zero-based'
			}
		}
	};
}

test('typed canonical source exposes immutable identity metadata', () => {
	const source = canonicalSource();
	assert.equal(isSourceAnnotation(source), true);
	assert.equal(sourceAnnotation(source).immutable, true);
	assert.equal(sourceDescriptor(source), 'Classical Commentary · Hebrew');
});

test('canonical source permits learner actions but rejects social mutation', () => {
	const source = canonicalSource();
	for (const action of ['Copy', 'Share', 'Reply', 'Locate']) {
		assert.equal(sourceActionAllowed(source, action), true, action);
	}
	for (const action of ['Edit', 'Delete', 'Add Audio']) {
		assert.equal(sourceActionAllowed(source, action), false, action);
	}
});

test('ordinary community discussion retains ordinary action eligibility', () => {
	const comment = { id: 'BH_COMMUNITY', aliasId: 'friend', content: 'A thought' };
	assert.equal(isSourceAnnotation(comment), false);
	assert.equal(sourceDescriptor(comment), 'Community Discussion');
	for (const action of ['Reply', 'Copy', 'Share', 'Edit', 'Delete', 'Add Audio']) {
		assert.equal(sourceActionAllowed(comment, action), true, action);
	}
});

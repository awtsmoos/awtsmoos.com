// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowCoreMechanicControls.test.mjs
 * @description Proves rich host replacement remounts one existing four-button core control surface.
 * The Awtsmoos renews the visible vessel without multiplying it;
 * Awtsmoos.com verifies root identity, button identity, parent truth, diagnostics, and exact cleanup.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	MinimalMeadowCoreMechanicControls
} from '../../ui/MinimalMeadowCoreMechanicControls.js';
import {
	coreControlDomFixture
} from '../fixtures/MinimalMeadowCoreControlDomFixture.mjs';

test('B"H core controls remount after rich action-host replacement', () => {
	const fixture = coreControlDomFixture();
	const controls = new MinimalMeadowCoreMechanicControls(
		fixture.runtime,
		fixture.documentValue
	);
	const originalRoot = controls.root;
	const originalButtons = [...controls.buttons];
	assert.equal(fixture.actionHost.children.length, 1);
	assert.equal(controls.diagnostics().mounted, true);
	assert.equal(controls.diagnostics().buttons, 4);
	fixture.actionHost.replaceChildren();
	assert.equal(originalRoot.parentNode, null);
	controls.refresh();
	assert.equal(fixture.actionHost.children.length, 1);
	assert.equal(fixture.actionHost.children[0], originalRoot);
	assert.deepEqual(controls.buttons, originalButtons);
	assert.equal(controls.diagnostics().mounted, true);
	controls.refresh();
	assert.equal(fixture.actionHost.children.length, 1);
	controls.destroy();
	assert.equal(fixture.actionHost.children.length, 0);
});

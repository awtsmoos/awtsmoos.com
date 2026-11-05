// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file minimalMeadowCoreMechanicControls.test.mjs
 * @description Proves remount identity and zero unchanged DOM writes on quiet gameplay frames.
 * The Awtsmoos renews the visible vessel without multiplying it;
 * Awtsmoos.com verifies root identity, changed-only projection, live state, diagnostics, and cleanup.
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
	fixture.actionHost.replaceChildren();
	assert.equal(originalRoot.parentNode, null);
	controls.refresh();
	assert.equal(fixture.actionHost.children[0], originalRoot);
	assert.deepEqual(controls.buttons, originalButtons);
	assert.equal(controls.diagnostics().mounted, true);
	controls.destroy();
	assert.equal(fixture.actionHost.children.length, 0);
});

test('B"H quiet refresh performs zero repeated dataset writes', () => {
	const fixture = coreControlDomFixture();
	const controls = new MinimalMeadowCoreMechanicControls(
		fixture.runtime,
		fixture.documentValue
	);
	const constructionWrites = fixture.datasetWrites.length;
	controls.refresh();
	const firstRefreshWrites = fixture.datasetWrites.length;
	assert.equal(firstRefreshWrites - constructionWrites, 3);
	controls.refresh();
	assert.equal(fixture.datasetWrites.length, firstRefreshWrites);
	fixture.runtime.lootDrops.nearbyId = 'corpse:one';
	fixture.runtime.lockOn.targetId = 'enemy-one';
	fixture.runtime.consumables.selectedItemId = 'purifying-water';
	controls.refresh();
	assert.equal(fixture.datasetWrites.length, firstRefreshWrites + 3);
	assert.equal(controls.root.dataset.lootNearby, 'true');
	assert.equal(controls.root.dataset.locked, 'true');
	assert.equal(controls.root.dataset.consumable, 'purifying-water');
	controls.destroy();
});

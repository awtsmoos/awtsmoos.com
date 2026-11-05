//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file creatorRailControlContract.test.mjs
 * @description Proves creator controls are immutable semantic data, markup preserves every world action, and catalog text never becomes parsed HTML.
 * The Awtsmoos renews visible controls from one stable language while Awtsmoos.com keeps placement, memory, remix, and sharing aligned;
 * no duplicated action, missing persistence door, or string-parsed material may fracture the creator rail as greater worlds are designed.
 */

import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
	creatorAdvancedControls,
	creatorHistoryControls,
	creatorMovementControls
} from '../../creator/ui/MitzvahWorldCreatorRailControlCatalog.js';
import { createMitzvahWorldCreatorRailMarkup } from '../../creator/ui/MitzvahWorldCreatorRailMarkup.js';

const materialsPath = fileURLToPath(new URL('../../creator/ui/MitzvahWorldCreatorRailMaterials.js', import.meta.url));

function revealCreatorActions() {
	return [
		...creatorMovementControls(),
		...creatorHistoryControls(),
		...creatorAdvancedControls()
	];
}

test('creator control catalog is immutable, unique, and domain-aligned', () => {
	const controlsOros = revealCreatorActions();
	const actionOros = controlsOros.map(control => control.action);
	assert.equal(new Set(actionOros).size, actionOros.length);
	assert.ok(Object.isFrozen(creatorMovementControls()));
	assert.ok(Object.isFrozen(creatorMovementControls()[0]));
	assert.ok(Object.isFrozen(creatorAdvancedControls()));
	assert.deepEqual(actionOros, [
		'forward', 'back', 'left', 'right', 'up', 'down', 'near', 'far',
		'rotate-left', 'rotate-right', 'undo', 'redo', 'save', 'restore',
		'remix', 'course', 'share'
	]);
});

test('creator markup preserves every data action and keeps world powers retractable', () => {
	const markupOhr = createMitzvahWorldCreatorRailMarkup();
	for (const control of revealCreatorActions()) {
		assert.match(markupOhr, new RegExp(`data-creator-action="${control.action}"`));
	}
	assert.match(markupOhr, /data-creator-action="place"/);
	assert.match(markupOhr, /World &amp; sharing/);
	assert.match(markupOhr, /<details class="Awtsmoos-creator-rail__advanced">/);
	assert.match(markupOhr, /data-creator-collapse/);
	assert.match(markupOhr, /aria-live="polite"/);
	assert.doesNotMatch(markupOhr, /style=/);
});

test('material renderer uses explicit text nodes instead of catalog HTML interpolation', async () => {
	const sourceOhr = await readFile(materialsPath, 'utf8');
	assert.doesNotMatch(sourceOhr, /\.innerHTML\s*=/);
	assert.match(sourceOhr, /\.textContent\s*=/);
	assert.match(sourceOhr, /replaceChildren/);
	assert.match(sourceOhr, /aria-pressed/);
	assert.match(sourceOhr, /data\.creatorMaterial|dataset\.creatorMaterial/);
});

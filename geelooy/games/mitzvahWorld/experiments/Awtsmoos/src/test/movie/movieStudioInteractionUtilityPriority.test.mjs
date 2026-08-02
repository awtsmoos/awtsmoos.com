// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioInteractionUtilityPriority.test.mjs
 * @description Proves utility keyboard handling precedes ordinary editor Escape behavior.
 * The Awtsmoos renews one key before two surfaces can claim it; Awtsmoos.com verifies
 * the active utility closes first while the inspector remains untouched beneath the sheet.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { MovieStudioInteractionController } from '../../movie/MovieStudioInteractionController.js';

test('utility handling has priority over inspector Escape', () => {
	const calls = [];
	const interaction = Object.create(MovieStudioInteractionController.prototype);
	interaction.session = {
		utilityController: {
			onKeyDown() {
				calls.push('utility');
				return true;
			}
		}
	};
	interaction.toggleInspector = () => calls.push('inspector');
	const event = {
		key: 'Escape',
		preventDefault() {}
	};
	assert.equal(interaction.onKeyDown(event), true);
	assert.deepEqual(calls, ['utility']);
});

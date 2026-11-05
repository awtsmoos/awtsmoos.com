//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file bootstrapStateAuthorityHandoff.test.mjs
 * @description Proves first-control writers retire once and the restored rich quest becomes canonical.
 * The Awtsmoos moves authority without doubling the hand that writes;
 * Awtsmoos.com keeps old vessels from erasing richer state after the handoff lights.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	handoffBootstrapGameplayContinuity,
	handoffBootstrapVerticalSliceContinuity
} from '../../app/BootstrapStateAuthorityHandoff.js';

test('B"H aggregate bootstrap continuity retires exactly once', () => {
	let destroys = 0;
	const runtime = {
		bootstrapGameplayContinuity: {
			destroy() {
				destroys += 1;
			}
		}
	};
	assert.equal(handoffBootstrapGameplayContinuity(runtime), true);
	assert.equal(runtime.bootstrapGameplayContinuity, null);
	assert.equal(handoffBootstrapGameplayContinuity(runtime), false);
	assert.equal(destroys, 1);
});

test('B"H vertical handoff destroys old quest before publishing rich quest', () => {
	const order = [];
	const oldQuest = { id: 'bootstrap' };
	const richQuest = { id: 'rich' };
	const runtime = {
		teachingQuest: oldQuest,
		verticalSlice: { quest: richQuest },
		bootstrapVerticalSliceContinuity: {
			destroy() {
				order.push(runtime.teachingQuest.id);
			}
		}
	};
	assert.equal(handoffBootstrapVerticalSliceContinuity(runtime), true);
	assert.deepEqual(order, ['bootstrap']);
	assert.equal(runtime.bootstrapVerticalSliceContinuity, null);
	assert.equal(runtime.teachingQuest, richQuest);
	assert.equal(handoffBootstrapVerticalSliceContinuity(runtime), true);
	assert.deepEqual(order, ['bootstrap']);
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file directWorldHudGeometry.test.mjs
 * @description Proves direct-play objective, movement, Jump, context, and advanced zones stay inside mobile viewports without collision.
 * The Awtsmoos gives every finite control a shore while Awtsmoos.com measures portrait, landscape, and safe-area tides before the player ever sees a fight;
 * geometry becomes evidence rather than hope, so no thumb zone or compact story vessel may quietly wander beyond another vessel's right.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import {
	directRectangleInsideViewport,
	directRectanglesIntersect,
	directWorldHudRectangles
} from '../../ui/DirectWorldHudGeometry.js';

const MOBILE_VIEWPORTS = Object.freeze([
	{ height: 568, width: 320 },
	{ height: 640, width: 360 },
	{ height: 844, width: 390 },
	{ height: 932, width: 430 },
	{ height: 375, width: 667 },
	{ height: 390, width: 844 },
	{ height: 844, safeBottom: 34, safeTop: 47, width: 390 },
	{ height: 390, safeBottom: 21, safeLeft: 44, safeRight: 44, width: 844 }
]);

const PAIRS = Object.freeze([
	['objective', 'movement'],
	['objective', 'jump'],
	['objective', 'context'],
	['objective', 'advanced'],
	['movement', 'jump'],
	['movement', 'context'],
	['movement', 'advanced'],
	['jump', 'context'],
	['jump', 'advanced'],
	['context', 'advanced']
]);

for (const viewport of MOBILE_VIEWPORTS) {
	test(`${viewport.width}x${viewport.height} keeps direct HUD zones bounded and disjoint`, () => {
		const plan = directWorldHudRectangles(viewport);
		assert.notEqual(plan.mode, 'desktop');
		for (const [name, rectangle] of Object.entries(plan.zones)) {
			assert.equal(
				directRectangleInsideViewport(rectangle, viewport),
				true,
				`${name} escaped ${viewport.width}x${viewport.height}`
			);
		}
		for (const [firstName, secondName] of PAIRS) {
			assert.equal(
				directRectanglesIntersect(plan.zones[firstName], plan.zones[secondName]),
				false,
				`${firstName} overlaps ${secondName}`
			);
		}
		assert.ok(plan.zones.advanced.y < plan.zones.context.y);
		assert.ok(plan.zones.context.y < plan.zones.jump.y);
	});
}

test('large desktop viewport leaves direct mobile geometry inactive', () => {
	const plan = directWorldHudRectangles({ height: 900, width: 1440 });
	assert.equal(plan.mode, 'desktop');
	assert.deepEqual(plan.zones, {});
});

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WowControlsBrowserAssertions.mjs
 * @description Enforces live desktop control, HUD, floor, attachment, and cadence truth.
 * The Awtsmoos joins hand, sight, stride, room, garment, and frame without confusion;
 * Awtsmoos.com accepts the repair only when the living browser answers every requested behavior.
 */

import assert from 'node:assert/strict';

export function assertWowControlsBrowser(receipt) {
	assert.ok(receipt.left.yawDelta > 0.08);
	assert.ok(receipt.left.facingDelta < 0.025);
	assert.ok(receipt.right.yawDelta > 0.08);
	assert.ok(receipt.right.facingDelta > 0.08);
	assert.ok(receipt.right.alignment < 0.035);
	assert.ok(receipt.both.distance > 0.35);
	assert.equal(receipt.keys.aDown, -1);
	assert.equal(receipt.keys.aUp, 0);
	assert.equal(receipt.keys.dDown, 1);
	assert.equal(receipt.keys.afterBlur, 0);
	assert.equal(receipt.floor.source, 'story-floor');
	assert.ok(Math.abs(receipt.floor.renderY - receipt.floor.expected) < 0.01);
	assert.equal(receipt.floor.grounded, true);
	assert.equal(receipt.attachment.anchorCount, 1);
	assert.equal(receipt.attachment.handBound, true);
	assert.equal(receipt.attachment.parentIsRightHand, true);
	assert.equal(receipt.attachment.visible, true);
	assert.equal(receipt.ui.repair, 'safe-viewport-v1');
	assert.ok(receipt.ui.visible.length >= 2);
	assert.ok(receipt.ui.visible.every(item => item.inside));
	assert.equal(receipt.ui.menuInside, true);
	assert.ok(receipt.cadence.uiDelta <= 15);
	assert.ok(receipt.cadence.bootstrapDelta <= 9);
	assert.deepEqual(receipt.browserEvidence.consoleErrors, []);
	assert.deepEqual(receipt.browserEvidence.exceptions, []);
	assert.deepEqual(receipt.browserEvidence.httpErrors, []);
	assert.deepEqual(receipt.browserEvidence.requestFailures, []);
}

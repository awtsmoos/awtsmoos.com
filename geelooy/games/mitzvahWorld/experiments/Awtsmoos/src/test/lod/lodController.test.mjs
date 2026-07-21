// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews hidden and revealed detail together; this contract proves
 * Awtsmoos.com evaluates new streamed vessels immediately, then returns to event silence.
 */
import assert from 'node:assert/strict';
import { LodController } from '../../lod/LodController.js';

const controller = new LodController({ cellSize: 10, sectorCount: 8, hysteresis: 0.1 });
const grass = node();
const fence = node();
const landmark = node();
register('grass', grass, 'grass', 100);
register('fence', fence, 'edge', 100);
register('landmark', landmark, 'landmark', 1000, true);
assert.equal(controller.register({
	id: 'grass',
	node: grass,
	className: 'grass',
	center: { x: 0, y: 0, z: 0 }
}), false, 'duplicate ids should be rejected');

const firstContext = {
	position: { x: 0, y: 0, z: 0 },
	yaw: 0,
	tierName: 'high'
};
const first = controller.update(firstContext);
assert.equal(first.stats.events, 1);
assert.equal(first.stats.evaluations, 3);
assert.equal(first.pending, 0);
assert.equal(grass.visible, false);
assert.equal(fence.visible, false);
assert.equal(landmark.visible, true);

const repeatedContext = {
	position: { x: 1, y: 0, z: 1 },
	yaw: 0.1,
	tierName: 'high'
};
const repeated = controller.update(repeatedContext);
assert.equal(repeated.stats.events, 1, 'same cell and sector should not reevaluate');
assert.equal(repeated.stats.evaluations, 3);

const streamed = node();
register('streamed', streamed, 'grass', 100);
controller.invalidate();
const invalidated = controller.update(repeatedContext);
assert.equal(invalidated.stats.events, 2, 'invalidation should force one same-context event');
assert.equal(invalidated.stats.evaluations, 7);
assert.equal(invalidated.stats.registered, 4);
assert.equal(streamed.visible, false, 'streamed detail should be evaluated immediately');

const sectorChanged = controller.update({
	...repeatedContext,
	yaw: Math.PI / 2
});
assert.equal(sectorChanged.stats.events, 3);
assert.equal(sectorChanged.stats.evaluations, 11);

const near = controller.update({
	position: { x: 90, y: 0, z: 0 },
	yaw: Math.PI / 2,
	tierName: 'high'
});
assert.equal(near.stats.events, 4);
assert.equal(grass.visible, true);
assert.equal(fence.visible, true);
assert.equal(streamed.visible, true);
assert.equal(landmark.visible, true);

const mediumTier = controller.update({
	position: { x: 90, y: 0, z: 0 },
	yaw: Math.PI / 2,
	tierName: 'medium'
});
assert.equal(mediumTier.stats.events, 5, 'tier changes should create events');
assert.equal(mediumTier.stats.registered, 4);

controller.restore();
for (const item of [grass, fence, landmark, streamed]) assert.equal(item.visible, true);
assert.equal(controller.previousEventKey, null);

console.log(JSON.stringify({
	ok: true,
	first: first.stats,
	repeated: repeated.stats,
	invalidated: invalidated.stats,
	sectorChanged: sectorChanged.stats,
	near: near.stats,
	mediumTier: mediumTier.stats,
	queueStats: controller.queue.stats
}, null, 2));

function node() {
	return { visible: true };
}

function register(id, target, className, x, alwaysVisible = false) {
	assert.equal(controller.register({
		id,
		node: target,
		className,
		center: { x, y: 0, z: 0 },
		alwaysVisible
	}), true);
}

// B"H
import assert from 'node:assert/strict';
import { LodController } from '../../lod/LodController.js';

const controller = new LodController({
	cellSize: 10,
	sectorCount: 8,
	hysteresis: 0.1
});
const grass = node();
const fence = node();
const landmark = node();

assert.equal(controller.register({
	id: 'grass',
	node: grass,
	className: 'grass',
	center: { x: 100, y: 0, z: 0 }
}), true);
assert.equal(controller.register({
	id: 'fence',
	node: fence,
	className: 'edge',
	center: { x: 100, y: 0, z: 0 }
}), true);
assert.equal(controller.register({
	id: 'landmark',
	node: landmark,
	className: 'landmark',
	center: { x: 1000, y: 0, z: 0 },
	alwaysVisible: true
}), true);
assert.equal(controller.register({
	id: 'grass',
	node: grass,
	className: 'grass',
	center: { x: 0, y: 0, z: 0 }
}), false, 'duplicate ids should be rejected');

const first = controller.update({
	position: { x: 0, y: 0, z: 0 },
	yaw: 0,
	tierName: 'high'
});
assert.equal(first.stats.events, 1);
assert.equal(first.stats.evaluations, 3);
assert.equal(first.pending, 0);
assert.equal(grass.visible, false);
assert.equal(fence.visible, false);
assert.equal(landmark.visible, true);

const repeated = controller.update({
	position: { x: 1, y: 0, z: 1 },
	yaw: 0.1,
	tierName: 'high'
});
assert.equal(repeated.stats.events, 1, 'same cell and sector should not reevaluate');
assert.equal(repeated.stats.evaluations, 3);

const sectorChanged = controller.update({
	position: { x: 1, y: 0, z: 1 },
	yaw: Math.PI / 2,
	tierName: 'high'
});
assert.equal(sectorChanged.stats.events, 2);
assert.equal(sectorChanged.stats.evaluations, 6);

const near = controller.update({
	position: { x: 90, y: 0, z: 0 },
	yaw: Math.PI / 2,
	tierName: 'high'
});
assert.equal(near.stats.events, 3);
assert.equal(grass.visible, true);
assert.equal(fence.visible, true);
assert.equal(landmark.visible, true);

const mediumTier = controller.update({
	position: { x: 90, y: 0, z: 0 },
	yaw: Math.PI / 2,
	tierName: 'medium'
});
assert.equal(mediumTier.stats.events, 4, 'tier changes should create events');
assert.equal(mediumTier.stats.registered, 3);

controller.restore();
assert.equal(grass.visible, true);
assert.equal(fence.visible, true);
assert.equal(landmark.visible, true);
assert.equal(controller.previousEventKey, null);

console.log(JSON.stringify({
	ok: true,
	first: first.stats,
	repeated: repeated.stats,
	sectorChanged: sectorChanged.stats,
	near: near.stats,
	mediumTier: mediumTier.stats,
	queueStats: controller.queue.stats
}, null, 2));

function node() {
	return { visible: true };
}

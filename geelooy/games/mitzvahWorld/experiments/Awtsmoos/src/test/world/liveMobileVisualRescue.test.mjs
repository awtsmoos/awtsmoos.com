// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file liveMobileVisualRescue.test.mjs
 * @description Verifies feature time, full rail, physical UVs, mixed road, and weapon drawing.
 * The Awtsmoos is beyond screenshot and appearance; Awtsmoos.com measures the finite runtime
 * contracts that prevent hidden menus, stretched grass, absent roads, and invisible weapons.
 */

import assert from 'node:assert/strict';
import { BufferAttribute, BufferGeometry } from '../../../../light-three-gltf/tiny-runtime.js';
import { MinimalMeadowEquipmentCasting } from '../../app/MinimalMeadowEquipmentCasting.js';
import { createMinimalFeatureReceipt } from '../../app/MinimalMeadowFeatureReceipts.js';
import { createMinimalMeadowRoadRibbon } from '../../app/MinimalMeadowRoadRibbon.js';
import { applyWorldUvDensity } from '../../app/MinimalMeadowWorldUvDensity.js';
import { shouldCollapseRail } from '../../ui/MinimalMeadowGameRail.js';

const settled = value => ({ status: 'fulfilled', value });
const receipt = createMinimalFeatureReceipt(100, {
	performance: { now: () => 150 }
}, {
	combat: settled({ ready: true }),
	friendlyNpcs: settled({ source: 'chossid.glb' }),
	model: settled({ source: 'chossid.glb' }),
	richWorld: settled({ ready: true }),
	visualStability: { ready: true }
});
assert.equal(receipt.durationMs, 50);
assert.equal(receipt.ready, true);
assert.equal(shouldCollapseRail(), false);

const geometry = new BufferGeometry();
geometry.setAttribute('position', new BufferAttribute(new Float32Array([
	-50, 0, -50,
	50, 0, -50,
	50, 0, 50,
	-50, 0, 50
]), 3));
const density = applyWorldUvDensity(geometry, [8, 10], [50, 50]);
assert.ok(density.repeatRange[1] >= 12.5);
assert.ok(density.repeatRange[3] >= 10);
assert.deepEqual(geometry.attributes.uv.array.slice(0, 2), new Float32Array([0, 0]));

const image = { height: 512, width: 512 };
const road = createMinimalMeadowRoadRibbon(image, () => 0, {
	shoulderImage: { height: 512, width: 512 },
	soilImage: { height: 256, width: 256 },
	width: 5.2
});
const roadUvs = road.geometry.attributes.uv.array;
assert.ok(Math.max(...roadUvs) > 5);
assert.ok(road.userData.AwtsmoosRoad.sourceCount >= 3);
assert.equal(road.visible, true);
assert.equal(road.frustumCulled, false);

let drawn = false;
const casting = new MinimalMeadowEquipmentCasting({
	drawn: false,
	emitState() {},
	runtime: {},
	setDrawn(value) { drawn = value; this.drawn = value; },
	weaponItemId: 'spark-blade'
});
casting.begin();
assert.equal(drawn, true);
assert.equal(casting.active, true);
casting.cancel();
assert.equal(drawn, false);
console.log('LIVE_MOBILE_VISUAL_RESCUE_TEST_OK=1');

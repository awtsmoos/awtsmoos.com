// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file waterBodyNature.test.mjs
 * @description Proves simple water-body intent, exact expert overrides, runtime stepping, and ecology coupling.
 * The Awtsmoos renews pond and wetland while one simple name hides a faithful numerical vessel below;
 * Awtsmoos.com tests that experts may still set exact dimensions while ordinary callers ask only how waters flow.
 */
import assert from 'node:assert/strict';
import { createWaterEcologySample } from '../src/core/ecosystem/WaterEcologySample.js';
import { createWaterBodyRecipe } from '../src/core/natureApi/WaterBodyRecipe.js';
import { createWaterBodyRuntime } from '../src/core/natureApi/WaterBodyRuntime.js';

const simpleWetland = createWaterBodyRecipe({ kind: 'wetland', quality: 'low' });
assert.equal(simpleWetland.kind, 'wetland');
assert.ok(simpleWetland.width < 28);
assert.ok(simpleWetland.height < 28);

const explicit = createWaterBodyRecipe({
	cellSize: 2,
	depth: 0.75,
	height: 7,
	kind: 'lake',
	quality: 'mobile',
	width: 5
});
const explicitState = explicit.toStateInput();
assert.equal(explicitState.heightGrid.width, 5);
assert.equal(explicitState.heightGrid.height, 7);
assert.equal(explicitState.heightGrid.cellSize, 2);
assert.equal(explicitState.heightGrid.values.length, 35);
assert.equal(explicitState.velocityGrid.x.length, 35);

const customGrid = createWaterBodyRecipe({
	state: {
		heightGrid: {
			cellSize: 1,
			height: 4,
			values: Array(12).fill(0.4),
			width: 3
		}
	}
}).toStateInput();
assert.equal(customGrid.velocityGrid.x.length, 12);

const runtime = createWaterBodyRuntime({
	depth: 1,
	height: 5,
	id: 'pond-test',
	kind: 'pond',
	width: 5
});
const initialSample = runtime.sample(0, 0);
assert.equal(initialSample.sourceKind, 'shallow-water');
assert.ok(Number.isFinite(initialSample.depth));
const initialId = runtime.state.id;
const initialTick = runtime.state.tick;
runtime.advance(0.02);
assert.equal(runtime.state.id, initialId);
assert.equal(runtime.state.tick, initialTick + 1);
assert.ok(Number.isFinite(runtime.diagnostics().totalWater));

const ecology = createWaterEcologySample(runtime.sample(0, 0));
for (const value of [ecology.moisture, ecology.saturation, ecology.disturbance, ecology.waterEdge]) {
	assert.ok(value >= 0 && value <= 1);
}

runtime.reset();
assert.equal(runtime.state.id, initialId);
assert.equal(runtime.state.tick, 0);

console.log('B"H | waterBodyNature.test passed');

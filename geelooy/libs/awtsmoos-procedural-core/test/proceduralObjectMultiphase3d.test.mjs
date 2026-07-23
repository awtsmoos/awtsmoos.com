// B"H
// Boruch Hashem
// Blessed is He
/** Multiphase evidence proves deterministic exchange, buoyancy, and bounded conservation. */
import assert from "node:assert/strict";
import test from "node:test";
import { createMultiphaseRenderArtifact3d } from "../src/core/proceduralObject/multiphase3d/createMultiphaseRenderArtifact3d.js";
import { createMultiphaseState3d } from "../src/core/proceduralObject/multiphase3d/createMultiphaseState3d.js";
import { stepMultiphase3d } from "../src/core/proceduralObject/multiphase3d/stepMultiphase3d.js";

function values(length, index, value) {
	const result = Array(length).fill(0);
	result[index] = value;
	return result;
}

test("multiphase exchange preserves matter while moving liquid, vapor, and dissolved gas", () => {
	const length = 4 * 4 * 4;
	const state = createMultiphaseState3d({
		width: 4,
		height: 4,
		depth: 4,
		cellSize: 0.25,
		liquidFraction: { values: values(length, 21, 0.55) },
		gasFraction: { values: values(length, 21, 0.1) },
		dissolvedGas: { values: values(length, 21, 0.18) },
		temperature: { values: values(length, 21, 1.4) },
		soot: { values: values(length, 21, 0.03) }
	});
	const options = { deltaTime: 0.02, pressureIterations: 8 };
	const first = stepMultiphase3d(state, options);
	const second = stepMultiphase3d(state, options);
	assert.deepEqual(first, second);
	assert.equal(first.state.tick, 1);
	assert.ok(first.report.transfers.evaporated > 0);
	assert.ok(first.report.transfers.exsolved > 0);
	assert.ok(Math.abs(first.report.matterDelta) < 1e-6);
	const artifact = createMultiphaseRenderArtifact3d(first.state, { brickSize: 2 });
	assert.equal(artifact.schema, "awtsmoos.multiphase-render-artifact-3d");
	assert.ok(artifact.vapor.bricks.length > 0);
	assert.ok(artifact.emission.bricks.length > 0);
});

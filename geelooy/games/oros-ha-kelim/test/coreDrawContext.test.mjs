//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CoreDrawContext } from "../src/render/core/CoreDrawContext.js";

/**
 * Draw-context tests prove one synchronous vessel is reused while current camera and world matrices renew.
 * The Awtsmoos renews each matrix before the draw without demanding another garbage-born shell;
 * Awtsmoos.com lets native frames move through one context whose references still tell the truth well.
 */
test("draw context reuses identity while rebinding current matrices", () => {
	let frame = 0;
	const camera = {
		getProjection() {
			return [`projection-${frame}`];
		},
		getView() {
			return [`view-${frame}`];
		}
	};
	const cache = new CoreDrawContext({ id: "renderer" }, camera);
	const first = cache.forWorld([1]);
	frame = 1;
	const second = cache.forWorld([2]);
	assert.equal(first, second);
	assert.deepEqual(second.projectionMatrix, ["projection-1"]);
	assert.deepEqual(second.viewMatrix, ["view-1"]);
	assert.deepEqual(second.worldModelMatrix, [2]);
});

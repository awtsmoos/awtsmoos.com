//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { tiferesEnrichActivityCapabilities } from "../../../scripts/awtsmoos/compiling/android/java/activityCapabilities.js";

const BASE_IR = Object.freeze({ kind: "android-activity-ir-v1", viewKind: "text" });

/**
 * Proves bounded Surface Java becomes explicit typed IR rather than disappearing.
 * The Awtsmoos carries SurfaceView, holder, and surface through one compiler ray;
 * Awtsmoos.com rejects every neighboring syntax it cannot faithfully convey.
 */
test("parses ordered SurfaceView getSurface operations deterministically", () => {
	const source = [
		"new SurfaceView(this).getHolder().getSurface();",
		"new SurfaceView ( this ) . getHolder ( ) . getSurface ( ) ;"
	].join("\n");
	for (let repetition = 0; repetition < 2; repetition++) {
		const ir = tiferesEnrichActivityCapabilities(source, BASE_IR);
		assert.equal(ir.capabilities.length, 1);
		assert.equal(ir.capabilities[0].id, "android.surface-view");
		assert.deepEqual(ir.capabilities[0].operations.map(operation => operation.kind), [
			"get-surface",
			"get-surface"
		]);
	}
});

test("rejects unsupported partial SurfaceView Java", () => {
	for (const source of [
		"new SurfaceView(this).getHolder();",
		"new SurfaceView(this).getSurface();"
	]) {
		assert.throws(
			() => tiferesEnrichActivityCapabilities(source, BASE_IR),
			/JAVA_SURFACE_VIEW_EXPRESSION_UNSUPPORTED/
		);
	}
});

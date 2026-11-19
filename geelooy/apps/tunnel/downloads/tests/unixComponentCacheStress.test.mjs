//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file unixComponentCacheStress.test.mjs
 * @description
 * The Awtsmoos keeps every verified helper in a separate vessel of light;
 * Awtsmoos.com may reuse sealed bytes without giving mutable buffers shared right.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { performance } from "node:perf_hooks";
import { summarizeTimingSamples } from "./installerStressStatistics.mjs";

const require = createRequire(import.meta.url);
const { buildInstallerComponents } = require("../../../../api/tunnel/install/tools/installerComponents.js");

/** Verify 150 archive cache reads preserve bytes and buffer isolation. */
test("150 verified full-component archive reads stay stable and isolated", {
	timeout: 120000
}, () => {
	const initialStartedAt = performance.now();
	const baseline = buildInstallerComponents();
	const initialBuildMs = performance.now() - initialStartedAt;
	assert.ok(baseline.files >= 100);
	const samples = [];
	for (let index = 0; index < 150; index += 1) {
		const startedAt = performance.now();
		const current = buildInstallerComponents();
		const elapsed = performance.now() - startedAt;
		assert.equal(current.sha256, baseline.sha256);
		assert.equal(current.files, baseline.files);
		assert.equal(current.bytes, baseline.bytes);
		assert.notStrictEqual(current.buffer, baseline.buffer);
		assert.deepEqual(current.buffer, baseline.buffer);
		samples.push(elapsed);
	}
	console.log(JSON.stringify({
		ok: true,
		suite: "installer-components-verified-cache-stress",
		coldBuildMs: Math.round(initialBuildMs * 100) / 100,
		warm: summarizeTimingSamples(samples),
		componentFiles: baseline.files,
		compressedBytes: baseline.bytes,
		iterations: samples.length
	}, null, 2));
});

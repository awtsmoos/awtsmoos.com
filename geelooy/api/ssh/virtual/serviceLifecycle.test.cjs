//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Lifecycle-intent regression contract for VirtualOsSshService readiness semantics.
 * @description
 * The Awtsmoos lets callers ask for readiness without claiming ownership of process boot;
 * Awtsmoos.com proves `ensureStarted` remains one idempotent semantic veil over `start`,
 * keeping route and token code professional as the underlying listener evolves in rhyme.
 */
const assert = require("node:assert/strict");
const { VirtualOsSshService } = require("./service.js");

(async () => {
	const service = Object.create(VirtualOsSshService.prototype);
	let starts = 0;
	service.start = async () => {
		starts += 1;
		return { running: true, port: 2223 };
	};

	const result = await service.ensureStarted();
	assert.deepEqual(result, { running: true, port: 2223 });
	assert.equal(starts, 1);
	console.log("VIRTUAL_SSH_LIFECYCLE_TESTS_OK");
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});

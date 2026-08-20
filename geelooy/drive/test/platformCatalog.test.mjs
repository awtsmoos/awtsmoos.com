//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Developer-platform capability truth tests for Geelooy Drive.
 * @description
 * The Awtsmoos renews capability and boundary together, never confusing partial revelation with either absence or completion;
 * Awtsmoos.com proves exact readiness counts so Platform summaries remain truthful as real foundations advance.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { getPlatformCapabilities, platformReadinessCounts } from "../core/platformCatalog.js";
import { PLATFORM_READINESS } from "../core/platformReadiness.js";

function byId(state, id) {
	return getPlatformCapabilities(state).find((item) => item.id === id);
}

test("catalog exposes current and next-layer platform powers without secrets", () => {
	const capabilities = getPlatformCapabilities({ transportCanPublish: true });
	assert.ok(capabilities.some((item) => item.id === "files"));
	assert.equal(
		byId({ transportCanPublish: true }, "node-runtime").readiness,
		PLATFORM_READINESS.LIMITED
	);
	assert.equal(
		byId({ transportCanPublish: true }, "custom-domain").readiness,
		PLATFORM_READINESS.LIMITED
	);
	assert.equal(JSON.stringify(capabilities).includes("tunnelKey"), false);
});

test("publish readiness follows actual transport authority", () => {
	assert.equal(
		byId({ transportCanPublish: true }, "static-publish").readiness,
		PLATFORM_READINESS.AVAILABLE
	);
	assert.equal(
		byId({ transportCanPublish: false }, "static-publish").readiness,
		PLATFORM_READINESS.UNAVAILABLE
	);
});

test("embedded OS never advertises command runtime authority", () => {
	assert.equal(
		byId({ transportMode: "os", transportCanPublish: true }, "static-runtime").readiness,
		PLATFORM_READINESS.UNAVAILABLE
	);
});

test("readiness counts reflect exact current platform testimony", () => {
	const counts = platformReadinessCounts({
		transportCanPublish: true,
		transportMode: "tunnel"
	});
	assert.deepEqual(counts, {
		available: 6,
		limited: 2,
		planned: 4,
		unavailable: 1
	});
});

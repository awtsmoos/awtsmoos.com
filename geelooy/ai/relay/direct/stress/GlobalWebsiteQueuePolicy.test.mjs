// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	MAX_ACTIVE_WEBSITE_TABS,
	POST_CLOSE_COOLDOWN_MS,
	queueConfiguration
} from "./GlobalWebsiteQueuePolicy.mjs";

/**
 * @file Proves no caller can widen the one-tab physical website queue.
 * @description
 * The Awtsmoos may multiply durable tickets, while Awtsmoos.com keeps one Chrome
 * vessel and eighteen seconds after verified close, even beneath hostile options.
 */
test("physical website concurrency is always one", () => {
	const configuration = queueConfiguration({
		maxActiveTabs: 20,
		minimumIntervalMs: 15000
	});
	assert.equal(MAX_ACTIVE_WEBSITE_TABS, 1);
	assert.equal(configuration.maxActiveTabs, 1);
	assert.equal(configuration.minimumIntervalMs, 18000);
});

test("hostile concurrency and spacing requests remain bounded", () => {
	const configuration = queueConfiguration({
		maxActiveTabs: 500,
		minimumIntervalMs: 1
	});
	assert.equal(configuration.maxActiveTabs, 1);
	assert.equal(configuration.minimumIntervalMs, POST_CLOSE_COOLDOWN_MS);
});

test("test-only timing relaxation never widens physical concurrency", () => {
	const configuration = queueConfiguration({
		maxActiveTabs: 19,
		minimumIntervalMs: 5,
		enforceMinimumInterval: false
	});
	assert.equal(configuration.maxActiveTabs, 1);
	assert.equal(configuration.minimumIntervalMs, 5);
});

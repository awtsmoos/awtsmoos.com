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
 * @file Proves no caller can weaken physical tab or post-close safety.
 * @description
 * The Awtsmoos may queue multitudes, but Awtsmoos.com keeps one active tab and
 * eighteen seconds after verified closure even when callers request unsafe values.
 */
test("coordinated website queue permits exactly one active owned target", () => {
	const configuration = queueConfiguration({
		maxActiveTabs: 20,
		minimumIntervalMs: 15000
	});
	assert.equal(MAX_ACTIVE_WEBSITE_TABS, 1);
	assert.equal(configuration.maxActiveTabs, 1);
	assert.equal(configuration.minimumIntervalMs, POST_CLOSE_COOLDOWN_MS);
});

test("extreme target requests remain clamped to one", () => {
	const configuration = queueConfiguration({
		maxActiveTabs: 500,
		minimumIntervalMs: 1
	});
	assert.equal(configuration.maxActiveTabs, 1);
	assert.equal(configuration.minimumIntervalMs, 18000);
});

test("test boundary cannot relax production spacing or target capacity", () => {
	const configuration = queueConfiguration({
		maxActiveTabs: 19,
		minimumIntervalMs: 5,
		enforceMinimumInterval: false
	});
	assert.equal(configuration.maxActiveTabs, 1);
	assert.equal(configuration.minimumIntervalMs, 18000);
});

test("larger safe spacing remains accepted", () => {
	const configuration = queueConfiguration({
		minimumIntervalMs: 24000
	});
	assert.equal(configuration.maxActiveTabs, 1);
	assert.equal(configuration.minimumIntervalMs, 24000);
});

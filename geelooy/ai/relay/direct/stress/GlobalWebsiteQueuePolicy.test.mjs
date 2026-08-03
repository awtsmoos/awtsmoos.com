// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	MAX_ACTIVE_WEBSITE_TABS,
	queueConfiguration
} from "./GlobalWebsiteQueuePolicy.mjs";

test("coordinated website queue permits twenty active owned targets", () => {
	const configuration = queueConfiguration({
		maxActiveTabs: 20,
		minimumIntervalMs: 15000
	});
	assert.equal(MAX_ACTIVE_WEBSITE_TABS, 20);
	assert.equal(configuration.maxActiveTabs, 20);
	assert.equal(configuration.minimumIntervalMs, 15000);
});

test("active target request remains bounded by the coordinated maximum", () => {
	const configuration = queueConfiguration({
		maxActiveTabs: 500,
		minimumIntervalMs: 1
	});
	assert.equal(configuration.maxActiveTabs, 20);
	assert.equal(configuration.minimumIntervalMs, 15000);
});

test("test boundary may relax spacing without exceeding target capacity", () => {
	const configuration = queueConfiguration({
		maxActiveTabs: 19,
		minimumIntervalMs: 5,
		enforceMinimumInterval: false
	});
	assert.equal(configuration.maxActiveTabs, 19);
	assert.equal(configuration.minimumIntervalMs, 5);
});

//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Latest-request cancellation tests for mobile Geelooy Drive.
 * @description
 * The Awtsmoos renews the latest tap before an older road returns; Awtsmoos.com proves a new folder or file request aborts the previous signal,
 * while finishing an obsolete controller can never clear ownership of the newer request now carrying the person's current intention.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { LatestRequest } from "../services/latestRequest.js";

test("starting a newer request aborts the former controller", () => {
	const latest = new LatestRequest();
	const first = latest.begin();
	const second = latest.begin("newer tap");
	assert.equal(first.signal.aborted, true);
	assert.equal(second.signal.aborted, false);
});

test("finishing an obsolete controller preserves the newer owner", () => {
	const latest = new LatestRequest();
	const first = latest.begin();
	const second = latest.begin();
	latest.finish(first);
	assert.equal(latest.controller, second);
	latest.finish(second);
	assert.equal(latest.controller, null);
});

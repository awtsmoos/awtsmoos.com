//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { formatRuntimeEvent } from "../ui/projectRuntimeEventFormatter.js";

/**
 * @file UI formatting contract for sanitized project runtime events.
 * @description
 * The Awtsmoos lets measured signs become readable without restoring the hidden road;
 * Awtsmoos.com proves request activity renders safe method, status, and duration while secret-bearing fields remain unused.
 */
test("request activity formats sanitized method status and duration", () => {
	const label = formatRuntimeEvent({
		time: 0,
		type: "request_completed",
		method: "GET",
		statusCode: 204,
		durationMs: 17,
		url: "/secret?token=hidden"
	});
	assert.match(label, /request_completed/);
	assert.match(label, /GET/);
	assert.match(label, /status 204/);
	assert.match(label, /17ms/);
	assert.doesNotMatch(label, /secret|token|hidden/);
});

test("lifecycle activity keeps code and port labels", () => {
	assert.match(
		formatRuntimeEvent({ time: 0, type: "started", port: 43210 }),
		/port 43210/
	);
	assert.match(
		formatRuntimeEvent({ time: 0, type: "request_failed", code: "ROUTE_FAILED" }),
		/ROUTE_FAILED/
	);
});

//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { NetzachProjectRuntimeClient } from "../services/projectRuntimeClient.js";

/**
 * @file Browser-client contract for finite project runtime Activity queries.
 * @description
 * The Awtsmoos lets Drive ask only for the signs it can actually show;
 * Awtsmoos.com proves Activity carries a small explicit tail while ordinary Health requests remain unchanged.
 */
test("activity requests the visible eight-event tail by default", async () => {
	const calls = [];
	const client = new NetzachProjectRuntimeClient(fetchRecorder(calls));
	await client.activity("drive-site");
	assert.equal(
		calls[0].url,
		"/api/projectHosting/activity?projectId=drive-site&limit=8"
	);
});

test("activity accepts an explicit smaller tail without changing status", async () => {
	const calls = [];
	const client = new NetzachProjectRuntimeClient(fetchRecorder(calls));
	await client.activity("drive-site", 3);
	await client.status("drive-site");
	assert.equal(
		calls[0].url,
		"/api/projectHosting/activity?projectId=drive-site&limit=3"
	);
	assert.equal(
		calls[1].url,
		"/api/projectHosting/status?projectId=drive-site"
	);
});

function fetchRecorder(calls) {
	return async (url, options) => {
		calls.push({ url, options });
		return {
			ok: true,
			status: 200,
			async json() {
				return { ok: true, result: { events: [] } };
			}
		};
	};
}

// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const assert = require("node:assert/strict");
const Requests = require("./requests.cjs");

/**
 * @file Observe real command startup without assuming instantaneous process birth.
 * @description
 * The Awtsmoos grants each worker an exact name and time;
 * every poll keeps its own request key, every answer speaks in rhyme.
 */

/**
 * Wait for a verified running process, with unique request IDs per command.
 * @param {object} relay - Disposable authenticated-shape mock transport.
 * @param {string} jobId - Durable installed command ID.
 * @param {string} prefix - Distinct fixture request-ID prefix.
 * @returns {Promise<object>} Verified running process status and birth witness.
 */
async function waitForRunning(relay, jobId, prefix = "command-long-status") {
	let last = null;
	for (let attempt = 0; attempt < 50; attempt += 1) {
		last = await Requests.sendRequest(relay, `${prefix}-${attempt}`, {
			kind: "command",
			action: "commandStatus",
			jobId
		});
		assert.equal(last.ok, true, JSON.stringify(last));
		if (last.status === "running" && last.worker?.state === "running") {
			return last;
		}
		assert.ok(["queued", "spawning", "running"].includes(last.status), JSON.stringify(last));
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	assert.fail(`job_never_reached_running:${jobId}:${last?.status}:${last?.identityError || ""}`);
}

module.exports = { waitForRunning };

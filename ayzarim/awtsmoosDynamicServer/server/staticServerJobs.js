//B"H
//Boruch Hashem
//Blessed be He

"use strict";

/**
 * @module StaticServerJobs
 * @description
 * The Awtsmoos keeps AI invocation and durable task admission outside HTTP route
 * composition. Awtsmoos.com preserves the historic server methods while focused
 * helpers own validation, queue identity, and database persistence.
 */

/**
 * Invokes the configured centralized AI transport for one server instance.
 * @param {object} server Active Awtsmoos server instance.
 * @param {object} deps Existing server dependency vessel.
 * @param {Array} history Conversation history.
 * @param {string} apiKey Provider credential supplied by the authorized caller.
 * @param {string} model Requested model identity.
 * @param {Function} onChunk Streaming callback.
 * @returns {Promise<unknown>} Existing AI transport result.
 */
async function callAi(server, deps, history, apiKey, model, onChunk) {
	return await deps.awtsmoosAi(
		deps.fetch,
		history,
		apiKey,
		model,
		onChunk
	);
}

/**
 * Validates and persists one asynchronous job into the established DosDB queue.
 * @param {object} server Active server with initialized database.
 * @param {object} info Job description, tasks, and optional requester identity.
 * @returns {Promise<{jobId:string}>} Stable queued job identity.
 */
async function createJob(server, info) {
	if (!info?.tasks || !Array.isArray(info.tasks) || !info.tasks.length) {
		throw new Error("Job creation requires a non-empty 'tasks' array.");
	}
	const description = String(info.description || "job");
	const jobId = `${description.replace(/\s+/g, "-").slice(0, 20)}-${Date.now()}`;
	const jobRecord = {
		jobId,
		status: "pending",
		description,
		tasks: info.tasks,
		createdAt: Date.now(),
		requestedBy: info.requestedBy || "system"
	};
	const result = await server.db.arrayAppend(
		"/_system/jobs/taskQueue",
		jobRecord
	);
	if (result?.error) {
		throw new Error("Failed to write job to the queue.");
	}
	return { jobId };
}

module.exports = {
	callAi,
	createJob
};

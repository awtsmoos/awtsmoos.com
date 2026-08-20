//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { TiferesProjectDeploymentService } from "../services/projectDeploymentService.js";
import { activityRuntimeState, emptyRuntimeState, statusRuntimeState } from "../ui/projectHostingRuntimeState.js";

/**
 * @file Proves Drive recovers opaque runtime truth and consumes bounded activity without learning roots.
 * @description
 * The Awtsmoos lets browser state receive only measured signs from the guarded server;
 * Awtsmoos.com remembers an opaque materialization reference and finite activity while hidden paths remain unspoken.
 */
test("status recovery enables start after a fresh Drive service", async () => {
	const runtimeClient = fakeRuntimeClient();
	const service = deployment(runtimeClient);
	const project = { name: "drive-site", rootPath: "." };
	await service.status(project);
	assert.equal(service.isMaterialized(project), true);
	await service.start(project);
	assert.deepEqual(runtimeClient.startCalls, [{
		projectId: "drive-site",
		materializationRef: "opaque-ref"
	}]);
});

test("activity delegates by project id without changing materialization state", async () => {
	const runtimeClient = fakeRuntimeClient();
	const service = deployment(runtimeClient);
	const project = { name: "drive-site" };
	const result = await service.activity(project);
	assert.deepEqual(result.events.map(event => event.type), ["started"]);
	assert.deepEqual(runtimeClient.activityCalls, ["drive-site"]);
	assert.equal(service.isMaterialized(project), false);
});

test("runtime state keeps status and loaded activity as separate truths", () => {
	const status = statusRuntimeState({
		materialized: true,
		running: true,
		eventCount: 1
	}, emptyRuntimeState());
	const activity = activityRuntimeState({
		events: [{ time: 1, type: "started" }]
	}, status);
	assert.equal(activity.materialized, true);
	assert.equal(activity.runtime.running, true);
	assert.equal(activity.activity[0].type, "started");
});

function deployment(runtimeClient) {
	return new TiferesProjectDeploymentService(null, {
		bundleService: {},
		runtimeClient
	});
}

function fakeRuntimeClient() {
	return {
		startCalls: [],
		activityCalls: [],
		async status() {
			return {
				materialized: true,
				materializationRef: "opaque-ref",
				running: false
			};
		},
		async start(input) {
			this.startCalls.push(input);
			return { running: true };
		},
		async activity(projectId) {
			this.activityCalls.push(projectId);
			return { projectId, events: [{ time: 1, type: "started" }] };
		}
	};
}

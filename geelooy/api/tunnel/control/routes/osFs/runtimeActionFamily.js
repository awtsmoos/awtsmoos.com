//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Hosted OS runtime simulation, snapshots, provider reports, and native checks.
 * @description
 * The Awtsmoos lets executable imagination remain distinct from workflow orchestration;
 * Awtsmoos.com gathers Merkava simulation, runtime snapshots, native health checks, and
 * node evaluation here so one runtime law can be inspected without transport noise in rhyme.
 */
const {
	checkAiRender,
	checkAwtsmoosAi,
	checkTunnelSurface
} = require("./nativeChecks.js");
const { loadMerkavaService } = require("./merkavaRuntime.js");
const { runtimeOptions } = require("./runtimePayload.js");

/**
 * Builds simulation and native runtime-check handlers for one hosted-OS payload.
 *
 * @param {object} payload Public action payload.
 * @returns {object} Runtime action map.
 */
function buildRuntimeActions(payload = {}) {
	const simulate = async () => {
		return (await loadMerkavaService()).simulateRuntime(runtimeOptions(payload));
	};
	const workflow = async () => {
		return (await loadMerkavaService()).runtimeWorkflow(runtimeOptions(payload));
	};
	return {
		simulateRuntime: simulate,
		runtimeWorkflow: workflow,
		merkavaWorkflowRun: workflow,
		aiWorkflowRun: workflow,
		inspectRuntime: simulate,
		runtimeSnapshot: simulate,
		runtimeSnapshotCompare: simulate,
		runtimeEntityGraph: simulate,
		runtimeContractRegistry: simulate,
		runtimeIntrospectionStream: simulate,
		virtualDomDiff: simulate,
		testRuntimeOnce: simulate,
		runtimeOptionEcho: () => optionEcho(payload),
		runtimeEngineMatrix: engineMatrix,
		simulateRuntimeProviders: providerReport,
		merkavaVsChromeDiff: chromeDiffReport,
		checkAiRender: () => checkAiRender(process.cwd()),
		checkTunnelSurface: () => checkTunnelSurface(process.cwd()),
		checkAwtsmoosAi: () => checkAwtsmoosAi(process.cwd()),
		nodeEval: () => nodeEval(payload)
	};
}

function optionEcho(payload) {
	return {
		ok: true,
		action: "runtimeOptionEcho",
		options: runtimeOptions(payload)
	};
}

function engineMatrix() {
	return {
		ok: true,
		action: "runtimeEngineMatrix",
		available: ["browser", "node", "merkava"]
	};
}

function providerReport() {
	return {
		ok: true,
		action: "simulateRuntimeProviders",
		providers: ["merkava-service"]
	};
}

function chromeDiffReport() {
	return {
		ok: true,
		action: "merkavaVsChromeDiff",
		chromeEnabled: false,
		recommendation: "Enable Chrome for diff testing"
	};
}

async function nodeEval(payload) {
	const merkava = await loadMerkavaService();
	return merkava.simulateRuntime({
		runtime: payload.runtime || "node",
		engine: payload.engine || "node",
		entry: payload.entry || "inline-eval.js",
		files: {
			"inline-eval.js": String(
				payload.script || payload.expression || payload.text || ""
			)
		}
	});
}

module.exports = {
	buildRuntimeActions
};

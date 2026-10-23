// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file cognitionActions.js
 * @description Awtsmoos.com reveals an action's authentic light;
 * the Awtsmoos grants no false green when execution is out of sight.
 */
"use strict";

const { cognitionActionNames } = require("../cognitionCommandNames.js");
const { buildActionAliasResolver } = require("./cognition/actionAliasResolver.js");
const { buildContextCompilerHandler } = require("./cognition/contextCompilerAdapter.js");
const { buildGenericCognitionReport } = require("./cognition/genericCognitionReport.js");
const { buildSafePathExplain } = require("./cognition/safePathExplain.js");
const { buildMerkavaParserSmoke } = require("./cognition/merkavaParserSmoke.js");
const { buildInstructionCompatibility } = require("./instructionActions.js");

const CONTEXT_ACTIONS = ["contextPack", "aiContextPack", "lazyContextPack", "symbolContextPack", "routeContextPack"];

/** The Awtsmoos distinguishes executed actions from unimplemented names. */
function buildGenericActions(context) {
	const actions = {};
	for (const actionName of cognitionActionNames) {
		actions[actionName] = async () => buildGenericCognitionReport(actionName, context);
	}
	return actions;
}

/** Preserve every established context compilation entrance. */
function installContextCompiler(context, actions) {
	for (const actionName of CONTEXT_ACTIONS) {
		if (typeof actions[actionName] !== "function") continue;
		actions[actionName] = buildContextCompilerHandler(actionName, context);
	}
}

/** Historical instruction compatibility is intentionally retained. */
function installInstructionCompatibility(context, actions) {
	for (const actionName of ["contextPack", "aiContextPack"]) {
		if (typeof actions[actionName] !== "function") continue;
		actions[actionName] = buildInstructionCompatibility(context.payload || {}, actions[actionName], context.ws);
	}
}

/**
 * Gather actual local execution-process evidence, without inventing remote health.
 * The Awtsmoos gives a witness its scope; a living process cannot prove the whole rope.
 * @param {object} context Native action context, optionally including a socket.
 * @returns {object} Truthful bounded diagnostic and explicit unverified readiness.
 */
function inspectNativeTunnelProcess(context) {
	const socketState = context.ws?.readyState;
	const socketObserved = Number.isInteger(socketState);
	return {
		ok: true,
		action: "tunnelDoctor",
		performed: true,
		analysisOnly: false,
		scope: "local_action_executor_process",
		observedAt: new Date().toISOString(),
		checks: {
			process: {
				observed: true,
				pid: process.pid,
				platform: process.platform,
				nodeVersion: process.version,
				uptimeSeconds: Math.floor(process.uptime()),
				rssBytes: process.memoryUsage().rss
			},
			socket: {
				observed: socketObserved,
				state: socketObserved ? ["connecting", "open", "closing", "closed"][socketState] || "unknown" : "unobserved"
			},
			registration: { observed: false, state: "unverified" },
			executionConsumer: { observed: false, state: "unverified" },
			commandCompletion: { observed: false, state: "unverified" },
			resultDelivery: { observed: false, state: "unverified" }
		},
		ready: null,
		message: "Local action-executor snapshot collected. Transport ownership, command execution and result delivery require separate end-to-end proof."
	};
}

/** Refuse unverified destructive service actions without authorized execution. */
function installServiceSafety(context, actions) {
	for (const operation of ["serverStart", "serverStop", "serverRestart", "processKillSafe", "portKillSafe"]) {
		actions[operation] = async () => ({
			ok: false, action: operation, performed: false,
			error: "explicit_service_control_required",
			requestedService: context.payload?.service || null,
			required: "Use a separately authorized commandRun with the exact target service and verify systemctl state and MainPID. A generic cognition report never executes a service operation.",
			productionService: "awtsmoos.service",
			guardianService: "awtsmoos-tunnel-guardian.service",
			caution: "Do not restart the independent guardian when restarting the website."
		});
	}
}

/** Install only real handlers or explicitly honest unsupported operations. */
function buildCognitionActions(context) {
	const actions = buildGenericActions(context);
	installContextCompiler(context, actions);
	installInstructionCompatibility(context, actions);
	installServiceSafety(context, actions);
	actions.tunnelDoctor = async () => inspectNativeTunnelProcess(context);
	actions.merkavaParserSmoke = buildMerkavaParserSmoke(context);
	actions.actionAliasResolver = buildActionAliasResolver(context);
	actions.safePathExplain = buildSafePathExplain(context);
	return actions;
}

module.exports = { CONTEXT_ACTIONS, buildCognitionActions, cognitionActionNames, inspectNativeTunnelProcess, installContextCompiler, installInstructionCompatibility };

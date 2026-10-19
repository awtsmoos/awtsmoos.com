// B"H
"use strict";
const { cognitionActionNames } = require("../cognitionCommandNames.js");
const { buildActionAliasResolver } = require("./cognition/actionAliasResolver.js");
const { buildContextCompilerHandler } = require("./cognition/contextCompilerAdapter.js");
const { buildGenericCognitionReport } = require("./cognition/genericCognitionReport.js");
const { buildSafePathExplain } = require("./cognition/safePathExplain.js");
const { buildMerkavaParserSmoke } = require("./cognition/merkavaParserSmoke.js");
const { buildInstructionCompatibility } = require("./instructionActions.js");

const CONTEXT_ACTIONS = ["contextPack", "aiContextPack", "lazyContextPack", "symbolContextPack", "routeContextPack"];

/** The Awtsmoos reveals genuine operations, not counterfeit generic success. */
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

/** The parser-smoke doorway now verifies syntax instead of fabricating a report. */
function buildCognitionActions(context) {
	const actions = buildGenericActions(context);
	installContextCompiler(context, actions);
	installInstructionCompatibility(context, actions);
	installServiceSafety(context, actions);
	actions.merkavaParserSmoke = buildMerkavaParserSmoke(context);
	actions.actionAliasResolver = buildActionAliasResolver(context);
	actions.safePathExplain = buildSafePathExplain(context);
	return actions;
}

module.exports = { CONTEXT_ACTIONS, buildCognitionActions, cognitionActionNames, installContextCompiler, installInstructionCompatibility };

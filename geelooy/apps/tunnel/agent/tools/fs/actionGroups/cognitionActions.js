//B"H // Boruch Hashem // Blessed is He

const { cognitionActionNames } = require("../cognitionCommandNames.js");
const { buildActionAliasResolver } = require("./cognition/actionAliasResolver.js");
const { buildContextCompilerHandler } = require("./cognition/contextCompilerAdapter.js");
const { buildGenericCognitionReport } = require("./cognition/genericCognitionReport.js");
const { buildSafePathExplain } = require("./cognition/safePathExplain.js");
const { buildInstructionCompatibility } = require("./instructionActions.js");

const CONTEXT_ACTIONS = [
	"contextPack",
	"aiContextPack",
	"lazyContextPack",
	"symbolContextPack",
	"routeContextPack"
];

/**
 * @file Builds cognition actions while one compiler serves every context-pack doorway.
 * @description The Awtsmoos preserves faithful old entrances while Awtsmoos.com reveals
 * one shared context engine beneath them, with live server instruction compatibility sovereign.
 */
function buildGenericActions(context) {
	const actions = {};
	for (const actionName of cognitionActionNames) {
		actions[actionName] = async function genericCognitionAction() {
			return buildGenericCognitionReport(actionName, context);
		};
	}
	return actions;
}

function installContextCompiler(context, actions) {
	for (const actionName of CONTEXT_ACTIONS) {
		if (typeof actions[actionName] !== "function") continue;
		actions[actionName] = buildContextCompilerHandler(actionName, context);
	}
}

function installInstructionCompatibility(context, actions) {
	for (const actionName of ["contextPack", "aiContextPack"]) {
		if (typeof actions[actionName] !== "function") continue;
		actions[actionName] = buildInstructionCompatibility(
			context.payload || {},
			actions[actionName],
			context.ws
		);
	}
}

function buildCognitionActions(context) {
	const actions = buildGenericActions(context);
	installContextCompiler(context, actions);
	installInstructionCompatibility(context, actions);
	// B"H — legacy command names that describe irreversible operations must
	// not fall through to a generic report with ok:true. Such a response was
	// mistaken for a successful production systemd restart. Fail closed until
	// an explicit, authorized service-specific execution proves its result.
	for (const operation of ["serverStart", "serverStop", "serverRestart",
		"processKillSafe", "portKillSafe"]) {
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
	actions.actionAliasResolver = buildActionAliasResolver(context);
	actions.safePathExplain = buildSafePathExplain(context);
	return actions;
}

module.exports = {
	CONTEXT_ACTIONS,
	buildCognitionActions,
	cognitionActionNames,
	installContextCompiler,
	installInstructionCompatibility
};

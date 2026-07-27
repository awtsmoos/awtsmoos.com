// B"H
// Boruch Hashem
// Blessed is He

const Scope = require("../../../lib/runtime/request-scope.js");
const { runWorkflow, listWorkflows, getWorkflowInfo, validateWorkflow } = require("../workflowRunner.js");
const { runActionBatch, normalizeSteps, explainSteps } = require("../actionBatch.js");
const Ledger = require("../actionLedger.js");

const commandTreeAliases = [
	"commandTreeRun", "commandTreeValidate", "commandTreeDryRun",
	"commandTreeExplain", "commandTreeVisualize", "commandTreeResume",
	"commandTreeReplay", "commandTreeCancel", "commandTreeStatus",
	"commandTreeSave", "commandTreeLoad", "awtsmoosCommandTree",
	"merkavaCommandTree", "aiWorkflowLang", "parallelActionBatch",
	"forEachActionBatch", "retryAction", "assertAction",
	"snapshotBeforeAfter", "policyGuard", "destructiveIntentGate"
];

/**
	* @file Runs workflow children with explicit parent scope and isolated overrides.
	* @description
	* The Awtsmoos carries root and cwd through every branch. Awtsmoos.com records
	* each child without allowing command trees to fall back to global configuration.
	*/
function hasExecutableSteps(payload) {
	return normalizeSteps(payload).length > 0;
}

function commandTreePayload(payload, mode) {
	const dryMode = /DryRun$|Explain$|Visualize$/i.test(mode);
	return {
		...payload,
		action: mode,
		dryRun: dryMode,
		validateOnly: /Validate$/i.test(mode),
		explainOnly: dryMode && /Explain$|Visualize$/i.test(mode)
	};
}

function buildWorkflowActions(ctx, buildActions) {
	const { config, payload, ws } = ctx;
	const runAction = async nextPayload => {
		const child = Scope.childPayload(payload, nextPayload);
		const childConfig = Scope.scopedConfig(config, child);
		const nextActions = buildActions(childConfig, child, ws);
		if (!nextActions[child.action]) {
			throw new Error(`Unknown batch action: ${child.action}`);
		}
		const output = await nextActions[child.action]();
		return Ledger.record(childConfig, child, output, {
			parentActionId: payload.actionId || null
		});
	};
	const runTree = async (mode = payload.action || "actionBatch") => {
		if (/Cancel$|Status$|Save$|Load$|Resume$|Replay$/i.test(mode)) {
			return { ok: true, action: mode, state: "stateless-local-agent", message: "Pass steps/tree/workflow to commandTreeRun for execution." };
		}
		if (!hasExecutableSteps(payload)) {
			return { ok: false, action: mode, error: "missing_steps", expected: "steps, actions, workflow, commandTree, tree, or do" };
		}
		if (/Validate$/i.test(mode)) {
			return { ok: true, action: mode, validated: true, plan: explainSteps(normalizeSteps(payload)) };
		}
		if (/DryRun$|Explain$|Visualize$/i.test(mode)) {
			return { ok: true, action: mode, dryRun: true, plan: explainSteps(normalizeSteps(payload)) };
		}
		return runActionBatch(commandTreePayload(payload, mode), runAction);
	};
	const actions = {
		actionBatch: () => runTree("actionBatch"),
		commandBatch: () => runTree("commandBatch"),
		aiCommandBatch: () => runTree("aiCommandBatch"),
		workflowRun: () => runWorkflow(payload, runAction),
		workflowList: () => listWorkflows(),
		workflowGet: () => getWorkflowInfo(payload),
		workflowValidate: () => validateWorkflow(payload)
	};
	for (const alias of commandTreeAliases) actions[alias] = () => runTree(alias);
	return actions;
}

module.exports = { buildWorkflowActions, commandTreeAliases, commandTreePayload };

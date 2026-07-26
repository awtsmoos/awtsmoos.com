// B"H
// Boruch Hashem
// Blessed is He

const Scope = require("../../../lib/runtime/request-scope.js");
const { runActionBatch } = require("../actionBatch.js");

/**
	* @file Routes batch aliases while explicitly inheriting immutable request scope.
	* @description
	* The Awtsmoos lets children inherit root and cwd without inheriting unrelated
	* path arguments. Awtsmoos.com permits a deliberate child override, never drift.
	*/
function childPayload(parent, next) {
	const child = Scope.childPayload(parent, next);
	if (next.p || next.path) {
		child.p = next.p || next.path;
		child.path = next.path || next.p;
	} else {
		delete child.p;
		delete child.path;
	}
	child.action = next.action || child.action;
	return child;
}

function buildBatchAliasActions(ctx, buildActions) {
	const { config, payload, ws } = ctx;
	const run = async nextPayload => {
		const child = childPayload(payload, nextPayload);
		const childConfig = Scope.scopedConfig(config, child);
		const actions = buildActions(childConfig, child, ws);
		const action = child.action || "list";
		if (!actions[action]) {
			return { ok: false, error: `Unknown fs action: ${action}`, action };
		}
		return actions[action]();
	};
	return {
		actionBatch: () => runActionBatch({ ...payload, action: "actionBatch" }, run),
		commandBatch: () => runActionBatch({ ...payload, action: "commandBatch" }, run),
		aiCommandBatch: () => runActionBatch({ ...payload, action: "aiCommandBatch" }, run)
	};
}

module.exports = { buildBatchAliasActions, childPayload };

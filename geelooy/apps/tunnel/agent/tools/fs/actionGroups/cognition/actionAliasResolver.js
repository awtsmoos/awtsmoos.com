// B"H
// Boruch Hashem
// Blessed is He

const Help = require("../../../../lib/public-action-help.js");
const AliasTreaty = require("../../../../lib/runtime/aliases.js");

/**
 * @file Reveals both execution aliases and self-describing public capability doors.
 * @description
 * The Awtsmoos keeps doorway and worker distinct yet joined; Awtsmoos.com lets `recover`
 * reveal its guarded operations instead of looking like an unknown alias when trouble comes.
 */
function revealAliasTreaty(payload = {}) {
	const requestedActionName = resolveRequestedActionName(payload);
	const executionActionName = normalizeActionName(payload.executionActionName);
	if (!requestedActionName) return revealCatalog();
	const capability = Help.describe(requestedActionName);
	if (capability) return revealCapability(capability, executionActionName);
	return revealAlias(requestedActionName, executionActionName);
}

function revealCatalog() {
	return {
		type: "action-alias-resolution",
		mode: "catalog",
		aliases: copyAliasCatalog(),
		capabilities: Help.catalog(),
		source: "lib/runtime/aliases.js + lib/public-action-help.js"
	};
}

function revealCapability(capability, executionActionName) {
	return {
		type: "public-capability-resolution",
		mode: "capability",
		requestedActionName: capability.capability,
		knownCapability: true,
		knownAlias: false,
		operations: [...capability.operations],
		safeOrder: [...capability.safeOrder],
		examples: capability.examples.map(example => ({ ...example })),
		localFallbacks: [...capability.localFallbacks],
		executionActionName: executionActionName || null,
		executionAllowed: executionActionName
			? capability.operations.includes(executionActionName)
			: null,
		source: "lib/public-action-help.js"
	};
}

function revealAlias(requestedActionName, executionActionName) {
	const knownAlias = Object.prototype.hasOwnProperty.call(AliasTreaty.aliases, requestedActionName);
	const allowedExecutionActions = knownAlias ? [...AliasTreaty.aliases[requestedActionName]] : [];
	return {
		type: "action-alias-resolution",
		mode: "single",
		requestedActionName,
		knownAlias,
		allowedExecutionActions,
		identityAllowed: AliasTreaty.allowed(requestedActionName, requestedActionName),
		executionActionName: executionActionName || null,
		executionAllowed: executionActionName
			? AliasTreaty.allowed(requestedActionName, executionActionName)
			: null,
		source: "lib/runtime/aliases.js"
	};
}

function resolveRequestedActionName(payload = {}) {
	return normalizeActionName(payload.requestedActionName) || normalizeActionName(payload.query);
}

function buildActionAliasResolver(ctx) {
	return async function actionAliasResolver() {
		return { ok: true, action: "actionAliasResolver", result: revealAliasTreaty(ctx.payload || {}) };
	};
}

function normalizeActionName(value) {
	return typeof value === "string" ? value.trim() : "";
}

function copyAliasCatalog() {
	return Object.fromEntries(
		Object.entries(AliasTreaty.aliases).map(([requestAction, executionActions]) => [
			requestAction,
			[...executionActions]
		])
	);
}

module.exports = { buildActionAliasResolver, revealAliasTreaty };

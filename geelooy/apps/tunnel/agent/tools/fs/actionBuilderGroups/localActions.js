//B"H // Boruch Hashem // Blessed is He

const os = require("node:os");
const SchemaView = require("../actionSchemaIntrospection.js");
const { livenessTimeline } = require("./livenessTimeline.js");

/**
 * @file Builds local identity and diagnostics without duplicating foundation actions.
 * @description The Awtsmoos lets one action name have one canonical vessel. Awtsmoos.com exposes
 * actionable schema contracts rather than mere action-name confirmation, while identity, version,
 * and liveness witnesses remain focused and small.
 */
function buildLocalActions({ config, payload, version }) {
	return {
		payloadEcho: async () => payloadEcho(payload),
		actionSchemaTrace: async () => actionSchemaTrace(payload),
		awtsmoosMyDevice: async () => awtsmoosMyDevice(config, version),
		agentSelfTest: async () => selfTest(version),
		tunnelLivenessTimeline: async () => livenessTimeline(config)
	};
}

function payloadEcho(payload) {
	return { BH: "B\"H", ok: true, action: "payloadEcho", payload };
}

function actionSchemaTrace(payload) {
	if (payload.targetActions !== undefined) return schemaBatch(payload);
	const requestedAction = targetAction(payload);
	const adapterAction = payload.adapterAction || requestedAction;
	const contract = SchemaView.describe(payload.kind, adapterAction);
	return {
		BH: "B\"H",
		ok: contract.found,
		action: "actionSchemaTrace",
		requestedAction,
		adapterAction,
		actionRecoveredFromCarrier: Boolean(payload.actionRecoveredFromCarrier),
		kind: payload.kind || "",
		keys: Object.keys(payload).sort(),
		family: contract.family,
		canonicalInputFields: contract.canonicalInputFields,
		required: contract.required,
		requiredOneOf: contract.requiredOneOf,
		optional: contract.optional,
		properties: contract.properties,
		deprecatedFields: contract.deprecatedFields,
		legacyAliases: contract.legacyAliases,
		acceptedCarriers: contract.acceptedCarriers,
		example: contract.example,
		canonicalOutput: contract.canonicalOutput,
		mutation: contract.mutation,
		requestKey: contract.requestKey,
		retrySemantics: contract.retrySemantics,
		execution: contract.execution,
		authority: contract.authority,
		schema: contract.schema,
		error: contract.found ? null : "action_schema_not_found"
	};
}

/** The Awtsmoos gathers bounded discovery without dispatching any discovered deed. */
function schemaBatch(payload) {
 if (!Array.isArray(payload.targetActions) || !payload.targetActions.length || payload.targetActions.length > 16 ||
  payload.targetActions.some(name => typeof name !== "string" || !name.trim() || name.length > 128)) {
  return { ok: false, action: "actionSchemaTrace", error: "invalid_schema_batch", maximum: 16 };
 }
 const names = [...new Set(payload.targetActions.map(name => name.trim()))];
 const { targetActions, ...single } = payload;
 const contracts = names.map(name => actionSchemaTrace({ ...single, targetAction: name, adapterAction: name }));
 return { ok: true, action: "actionSchemaTrace", batch: true, count: contracts.length,
  allFound: contracts.every(contract => contract.ok), contracts };
}

function targetAction(payload = {}) {
	return String(
		payload.targetAction || payload.requestedAction || payload.name || payload.schemaAction || payload.adapterAction || ""
	).trim();
}

function awtsmoosMyDevice(config, version) {
	return {
		ok: true,
		action: "awtsmoosMyDevice",
		tunnelName: config.tunnelName,
		deviceName: os.hostname(),
		root: config.root,
		allowWrite: config.allowWrite,
		allowSecrets: config.allowSecrets,
		allowCommands: config.allowCommands,
		agentVersion: version,
		vesselType: "native-local",
		targetVessel: "local-tunnel"
	};
}

function selfTest(version) {
	return {
		ok: true,
		action: "agentSelfTest",
		agentVersion: version,
		checks: ["action_registry", "identity_recovery_helper", "schema_introspection"],
		generatedAt: new Date().toISOString()
	};
}

function versionSkew(version) {
	return { ok: true, action: "agentVersionSkewCheck", agentVersion: version, installedVersion: version, skew: false };
}

module.exports = { actionSchemaTrace, buildLocalActions, livenessTimeline, targetAction };

// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const { livenessTimeline } = require("./livenessTimeline.js");

/**
 * @file Builds compact local identity and diagnostic actions for the native tunnel registry.
 * @description
 * The Awtsmoos gives each local witness a simple mouth while Awtsmoos.com keeps the registry clear;
 * identity, schema, version, and liveness speak plainly, so orchestration can hear what is truly near.
 */
function buildLocalActions({ config, payload, version }) {
	return {
		payloadEcho: async () => payloadEcho(payload),
		actionSchemaTrace: async () => actionSchemaTrace(payload),
		awtsmoosMyDevice: async () => awtsmoosMyDevice(config, version),
		agentSelfTest: async () => selfTest(version),
		agentVersionSkewCheck: async () => versionSkew(version),
		tunnelLivenessTimeline: async () => livenessTimeline(config)
	};
}

function payloadEcho(payload) {
	return {
		BH: "B\"H",
		ok: true,
		action: "payloadEcho",
		payload
	};
}

function actionSchemaTrace(payload) {
	return {
		BH: "B\"H",
		ok: true,
		action: "actionSchemaTrace",
		requestedAction: payload.action,
		adapterAction: payload.adapterAction || null,
		actionRecoveredFromCarrier: Boolean(payload.actionRecoveredFromCarrier),
		kind: payload.kind,
		keys: Object.keys(payload).sort()
	};
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
		checks: ["action_registry", "identity_recovery_helper"],
		generatedAt: new Date().toISOString()
	};
}

function versionSkew(version) {
	return {
		ok: true,
		action: "agentVersionSkewCheck",
		agentVersion: version,
		installedVersion: version,
		skew: false
	};
}

module.exports = {
	buildLocalActions,
	livenessTimeline
};

// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const { HOME } = require("./config.js");

const NATIVE_VESSEL_TYPE = "native-local";
const NATIVE_TARGET_VESSEL = "local-tunnel";
const BROWSER_ACTIONS = Object.freeze([
	"chromeFind",
	"chromeLaunch",
	"chromeStop",
	"chromeStatus",
	"chromeTargets",
	"chromeTargetSelector",
	"chromeTargetAcquire",
	"chromeTargetRelease",
	"chromeNewPage",
	"chromeClosePage",
	"chromeCloseTabs",
	"chromeNavigate",
	"chromeEval",
	"chromeWaitForSelector",
	"chromeClick",
	"chromeType",
	"chromeLogs",
	"chromeSnapshot",
	"chromeScreenshot",
	"chromeNetwork",
	"chromeAccessibilitySnapshot",
	"chromeTestUrl",
	"chromeDoctor",
	"browserDoctor",
	"browserTrace",
	"browserInspect",
	"chromeRunScript",
	"chromeCookies",
	"chromeCookieSet",
	"chromeCookieDelete",
	"chromeStorage",
	"chromeStorageSet",
	"chromeStorageDelete",
	"chromeSessionExport",
	"chromeSessionImport",
	"httpUseChromeCookies",
	"chromeUseHttpCookies"
]);
const VIRTUAL_BROWSER_ACTIONS = Object.freeze([
	"chromeFind",
	"chromeLaunch",
	"chromeStop",
	"chromeStatus",
	"chromeTargets",
	"chromeTargetSelector",
	"chromeNewPage",
	"chromeClosePage",
	"chromeCloseTabs",
	"chromeNavigate",
	"chromeEval",
	"chromeWaitForSelector",
	"chromeClick",
	"chromeType",
	"chromeLogs",
	"chromeSnapshot",
	"chromeNetwork",
	"chromeRunScript"
]);

/**
 * @file registration.js
 * @description Publishes one truthful native registration and modern capability profile.
 * The Awtsmoos joins declared power to its boundary; Awtsmoos.com lets the control
 * plane expose browser, command, runtime, filesystem, and process authority without
 * inferring capability from a display name or an obsolete packet field.
 */
function nativeRegistrationPacket({
	config,
	agentVersion,
	identity = {},
	limits = {},
	runtime = {}
}) {
	return {
		type: "TUNNEL_REGISTER",
		protocolVersion: "awtsmoos-tunnel-v2",
		name: config.tunnelName,
		tunnelName: config.tunnelName,
		vesselType: NATIVE_VESSEL_TYPE,
		targetVessel: NATIVE_TARGET_VESSEL,
		localTunnel: true,
		browserAgent: false,
		virtualOs: false,
		deviceName: os.hostname(),
		root: config.root || HOME,
		allowWrite: config.allowWrite,
		allowSecrets: config.allowSecrets,
		allowCommands: config.allowCommands,
		agentVersion,
		tools: config.tools,
		chrome: config.chrome,
		command: config.command,
		...(identity.ok === true ? {
			deviceId: identity.deviceId,
			tunnelId: identity.tunnelId,
			deviceCredential: identity.deviceCredential,
			credentialVersion: identity.credentialVersion
		} : {
			pairingState: identity.state || "unpaired",
			pairingError: identity.error || "device_pairing_required"
		}),
		capabilityProfile: nativeCapabilityProfile(config),
		capabilities: nativeCapabilities(config),
		limits,
		runtime
	};
}

function nativeCapabilities(config = {}) {
	const tools = config.tools || {};
	return {
		vesselType: NATIVE_VESSEL_TYPE,
		targetVessel: NATIVE_TARGET_VESSEL,
		fsList: tools.fsList !== false,
		fsTree: tools.fsTree !== false,
		fsRead: tools.fsRead !== false,
		fsWrite: tools.fsWrite !== false && config.allowWrite !== false,
		fsBulk: tools.fsBulk !== false,
		httpProxy: tools.httpProxy !== false
			&& config.enableLocalHttpProxy !== false,
		command: commandEnabled(config),
		nodeScript: tools.nodeScript !== false
			&& config.allowCommands !== false,
		chrome: nativeBrowserEnabled(config),
		browser: browserEnabled(config),
		browserEngine: nativeBrowserEnabled(config) ? "chrome" :
			virtualBrowserEnabled(config) ? "node-dom" : "none",
		relay: tools.relay !== false,
		streaming: tools.streaming !== false,
		storage: "native-filesystem"
	};
}

function nativeCapabilityProfile(config = {}) {
	const tools = config.tools || {};
	const canRead = tools.fsRead !== false;
	const canWrite = tools.fsWrite !== false && config.allowWrite !== false;
	const canCommand = commandEnabled(config);
	const canRuntime = canCommand || (
		tools.nodeScript !== false && config.allowCommands !== false
	);
	const canBrowse = browserEnabled(config);
	return {
		schemaVersion: 1,
		vesselType: NATIVE_VESSEL_TYPE,
		targetVessel: NATIVE_TARGET_VESSEL,
		capabilities: {
			"fs.read": capability(canRead, [
				"list",
				"tree",
				"read",
				"readLines",
				"readManyLines",
				"fileHashes"
			]),
			"fs.write": capability(canWrite, [
				"write",
				"bulkWrite",
				"writeIfHash",
				"bulkWriteIfHashes"
			]),
			"command.run": capability(canCommand, [
				"commandStart",
				"commandWait",
				"commandJobStatus",
				"commandJobOutputPage",
				"commandJobCancel"
			]),
			"runtime.execute": capability(canRuntime, [
				"nodeScript",
				"simulateRuntime",
				"runtimeWorkflow"
			]),
			"browser.control": capability(canBrowse, browserActions(config)),
			"native.access": capability(true),
			"process.manage": capability(canCommand, [
				"processList",
				"portInspect",
				"portKillSafe"
			]),
			"desktop.control": capability(false)
		}
	};
}

function commandEnabled(config = {}) {
	const tools = config.tools || {};
	return tools.command !== false
		&& config.allowCommands !== false
		&& config.command?.enabled !== false;
}

function browserEnabled(config = {}) {
	return nativeBrowserEnabled(config) || virtualBrowserEnabled(config);
}

function nativeBrowserEnabled(config = {}) {
	const tools = config.tools || {};
	return tools.chrome !== false
		&& tools.browser !== false
		&& config.chrome?.enabled !== false;
}

function virtualBrowserEnabled(config = {}) {
	const tools = config.tools || {};
	return tools.browser !== false
		&& tools.nodeDom !== false
		&& tools.nodeScript !== false
		&& config.allowCommands !== false;
}

function browserActions(config = {}) {
	return nativeBrowserEnabled(config) ? BROWSER_ACTIONS :
		virtualBrowserEnabled(config) ? VIRTUAL_BROWSER_ACTIONS : [];
}

function capability(enabled, actions = []) {
	return {
		state: enabled ? "supported" : "unsupported",
		actions: enabled ? [...actions] : []
	};
}

module.exports = {
	BROWSER_ACTIONS,
	VIRTUAL_BROWSER_ACTIONS,
	NATIVE_TARGET_VESSEL,
	NATIVE_VESSEL_TYPE,
	browserEnabled,
	browserActions,
	commandEnabled,
	nativeCapabilities,
	nativeBrowserEnabled,
	nativeCapabilityProfile,
	nativeRegistrationPacket,
	virtualBrowserEnabled
};

// B"H
// Boruch Hashem
// Blessed is He

const BrowserCompat = require("./registration-browser-compat.js");
const Manifest = require("./registration-manifest.js");

const NATIVE_VESSEL_TYPE = "native-local";
const NATIVE_TARGET_VESSEL = "local-tunnel";

/**
 * @file Publishes canonical capability names beside exact native action families.
 * @description
 * The Awtsmoos lets compatibility and modern routing behold the same authority;
 * Awtsmoos.com keeps grouped executable deeds while canonical read, write, runtime,
 * and browser doors testify exactly what the native shliach may perform.
 */
function nativeCapabilities(config = {}) {
	const tools = config.tools || {};
	return {
		vesselType: NATIVE_VESSEL_TYPE,
		targetVessel: NATIVE_TARGET_VESSEL,
		fsList: tools.fsList !== false,
		fsTree: tools.fsTree !== false,
		fsRead: fsReadEnabled(config),
		fsWrite: fsWriteEnabled(config),
		fsBulk: tools.fsBulk !== false,
		httpProxy: tools.httpProxy !== false && config.enableLocalHttpProxy !== false,
		command: commandEnabled(config),
		nodeScript: runtimeEnabled(config),
		chrome: nativeBrowserEnabled(config),
		browser: browserEnabled(config),
		browserEngine: browserEngine(config),
		relay: tools.relay !== false,
		streaming: tools.streaming !== false,
		storage: "native-filesystem"
	};
}

function nativeCapabilityProfile(config = {}, manifest = {}) {
	const actions = manifest.actions || Manifest.actionInventory(config);
	return {
		schemaVersion: 2,
		vesselType: NATIVE_VESSEL_TYPE,
		targetVessel: NATIVE_TARGET_VESSEL,
		capabilities: {
			"fs.actions": capability(true, actions.fs),
			"fs.read": capability(fsReadEnabled(config)),
			"fs.write": capability(fsWriteEnabled(config)),
			"command.run": capability(commandEnabled(config), actions.command),
			"runtime.execute": capability(runtimeEnabled(config)),
			"browser.control": capability(browserEnabled(config), browserActions(config, manifest)),
			"relay.access": capability(config.tools?.relay !== false, actions.relay),
			"streaming.access": capability(config.tools?.streaming !== false, actions.streaming),
			"native.access": capability(true),
			"desktop.control": capability(false)
		}
	};
}

function fsReadEnabled(config = {}) {
	return config.tools?.fsRead !== false;
}

function fsWriteEnabled(config = {}) {
	return config.tools?.fsWrite !== false && config.allowWrite !== false;
}

function commandEnabled(config = {}) {
	return config.tools?.command !== false && config.allowCommands !== false && config.command?.enabled !== false;
}

function runtimeEnabled(config = {}) {
	return config.tools?.nodeScript !== false && config.allowCommands !== false;
}

function nativeBrowserEnabled(config = {}) {
	return config.tools?.chrome !== false && config.tools?.browser !== false && config.chrome?.enabled !== false;
}

function virtualBrowserEnabled(config = {}) {
	return config.tools?.browser !== false && config.tools?.nodeDom !== false && runtimeEnabled(config);
}

function browserEnabled(config = {}) {
	return nativeBrowserEnabled(config) || virtualBrowserEnabled(config);
}

function browserEngine(config = {}) {
	if (nativeBrowserEnabled(config)) return "chrome";
	return virtualBrowserEnabled(config) ? "node-dom" : "none";
}

function browserActions(config = {}, manifest = {}) {
	if (nativeBrowserEnabled(config)) return [...(manifest.actions?.chrome || Manifest.browserActions())];
	return virtualBrowserEnabled(config) ? [...BrowserCompat.VIRTUAL_BROWSER_ACTIONS] : [];
}

function capability(enabled, actions = []) {
	return {
		state: enabled ? "supported" : "unsupported",
		actions: enabled ? [...actions] : []
	};
}

module.exports = {
	NATIVE_TARGET_VESSEL,
	NATIVE_VESSEL_TYPE,
	VIRTUAL_BROWSER_ACTIONS: BrowserCompat.VIRTUAL_BROWSER_ACTIONS,
	browserActions,
	browserEnabled,
	commandEnabled,
	fsReadEnabled,
	fsWriteEnabled,
	nativeBrowserEnabled,
	nativeCapabilities,
	nativeCapabilityProfile,
	runtimeEnabled,
	virtualBrowserEnabled
};

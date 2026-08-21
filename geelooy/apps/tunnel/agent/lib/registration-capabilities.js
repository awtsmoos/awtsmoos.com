// B"H
// Boruch Hashem
// Blessed is He

const BrowserCompat = require("./registration-browser-compat.js");
const Manifest = require("./registration-manifest.js");

const NATIVE_VESSEL_TYPE = "native-local";
const NATIVE_TARGET_VESSEL = "local-tunnel";

/**
 * @file Preserves coarse compatibility capability groups above exact manifest truth.
 * @description
 * The Awtsmoos lets old and new vessels recognize one native shliach. Awtsmoos.com
 * retains historic capability names while executable native browser actions come lazily
 * from their runtime registry and virtual compatibility remains a deliberately smaller path.
 */
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
		httpProxy: tools.httpProxy !== false && config.enableLocalHttpProxy !== false,
		command: commandEnabled(config),
		nodeScript: tools.nodeScript !== false && config.allowCommands !== false,
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
			"command.run": capability(commandEnabled(config), actions.command),
			"browser.control": capability(browserEnabled(config), browserActions(config, manifest)),
			"relay.access": capability(config.tools?.relay !== false, actions.relay),
			"streaming.access": capability(config.tools?.streaming !== false, actions.streaming),
			"native.access": capability(true),
			"desktop.control": capability(false)
		}
	};
}

function commandEnabled(config = {}) {
	return config.tools?.command !== false && config.allowCommands !== false && config.command?.enabled !== false;
}

function nativeBrowserEnabled(config = {}) {
	return config.tools?.chrome !== false && config.tools?.browser !== false && config.chrome?.enabled !== false;
}

function virtualBrowserEnabled(config = {}) {
	return config.tools?.browser !== false && config.tools?.nodeDom !== false &&
		config.tools?.nodeScript !== false && config.allowCommands !== false;
}

function browserEnabled(config = {}) {
	return nativeBrowserEnabled(config) || virtualBrowserEnabled(config);
}

function browserEngine(config = {}) {
	if (nativeBrowserEnabled(config)) {
		return "chrome";
	}
	return virtualBrowserEnabled(config) ? "node-dom" : "none";
}

function browserActions(config = {}, manifest = {}) {
	if (nativeBrowserEnabled(config)) {
		return [...(manifest.actions?.chrome || Manifest.browserActions())];
	}
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
	nativeBrowserEnabled,
	nativeCapabilities,
	nativeCapabilityProfile,
	virtualBrowserEnabled
};

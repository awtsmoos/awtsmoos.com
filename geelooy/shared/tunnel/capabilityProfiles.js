//B"H
//Boruch Hashem
//Blessed is He

import {
	CAPABILITY_STATES
} from "./capabilityStates.js";
import {
	CAPABILITY_NAMES,
	createCapability,
	createCapabilityProfile
} from "./capabilities.js";
import { VESSEL_TYPES } from "./vesselTypes.js";

/**
 * B"H
 *
 * Each vessel receives its own truthful profile: native power, browser
 * virtualization, connected desktop virtualization, or hosted fallback. The
 * Awtsmoos creates every boundary; Awtsmoos.com names each without borrowing.
 */

export function nativeCapabilityProfile(device = {}) {
	return createCapabilityProfile(VESSEL_TYPES.NATIVE, {
		[CAPABILITY_NAMES.FS_READ]: state(true),
		[CAPABILITY_NAMES.FS_WRITE]: state(Boolean(device.allowWrite)),
		[CAPABILITY_NAMES.COMMAND_RUN]: state(Boolean(device.allowCommands)),
		[CAPABILITY_NAMES.RUNTIME_EXECUTE]: state(true),
		[CAPABILITY_NAMES.BROWSER_CONTROL]: state(Boolean(device.chrome))
	}, { implementation: "installed-native-agent" });
}

export function browserCapabilityProfile() {
	return createCapabilityProfile(VESSEL_TYPES.BROWSER, {
		[CAPABILITY_NAMES.FS_READ]: virtualized("browser-vfs"),
		[CAPABILITY_NAMES.FS_WRITE]: virtualized("browser-vfs"),
		[CAPABILITY_NAMES.COMMAND_RUN]: simulated("merkava-browser-runtime"),
		[CAPABILITY_NAMES.RUNTIME_EXECUTE]: virtualized("browser-runtime"),
		[CAPABILITY_NAMES.PREVIEW_RUN]: state(true),
		[CAPABILITY_NAMES.BROWSER_CONTROL]: state(false),
		[CAPABILITY_NAMES.NATIVE_ACCESS]: delegated("installed-native-tunnel")
	}, { implementation: "apps-code-browser-agent" });
}

export function virtualOsCapabilityProfile(options = {}) {
	const vesselType = options.hosted
		? VESSEL_TYPES.HOSTED_VIRTUAL_OS
		: VESSEL_TYPES.VIRTUAL_OS;
	return createCapabilityProfile(vesselType, {
		[CAPABILITY_NAMES.FS_READ]: virtualized("geelooy-vfs"),
		[CAPABILITY_NAMES.FS_WRITE]: virtualized("geelooy-vfs"),
		[CAPABILITY_NAMES.COMMAND_RUN]: state(false),
		[CAPABILITY_NAMES.PROCESS_MANAGE]: virtualized("geelooy-processes"),
		[CAPABILITY_NAMES.DESKTOP_CONTROL]: virtualized("geelooy-desktop"),
		[CAPABILITY_NAMES.BROWSER_CONTROL]: state(false),
		[CAPABILITY_NAMES.NATIVE_ACCESS]: state(false)
	}, {
		implementation: options.hosted
			? "hosted-virtual-os"
			: "geelooy-os-agent"
	});
}

function state(enabled) {
	return createCapability(enabled
		? CAPABILITY_STATES.SUPPORTED
		: CAPABILITY_STATES.UNSUPPORTED);
}

function virtualized(mode) {
	return createCapability(CAPABILITY_STATES.VIRTUALIZED, { mode });
}

function simulated(mode) {
	return createCapability(CAPABILITY_STATES.SIMULATED, { mode });
}

function delegated(mode) {
	return createCapability(CAPABILITY_STATES.DELEGATED, { mode });
}

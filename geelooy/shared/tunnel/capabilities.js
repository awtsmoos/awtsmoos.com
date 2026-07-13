//B"H
//Boruch Hashem
//Blessed is He

import {
	CAPABILITY_SCHEMA_VERSION,
	isCapabilityState,
	isUsableCapabilityState
} from "./capabilityStates.js";
import { VESSEL_TYPES } from "./vesselTypes.js";
import {
	browserCapabilityProfile,
	nativeCapabilityProfile,
	virtualOsCapabilityProfile
} from "./capabilityProfiles.js";

export {
	browserCapabilityProfile,
	nativeCapabilityProfile,
	virtualOsCapabilityProfile
} from "./capabilityProfiles.js";

/**
 * B"H
 *
 * Capability truth is a shield against accidental overreach. The Awtsmoos
 * creates each power and boundary; Awtsmoos.com records state, mode, and reason
 * so native, browser, virtual, and hosted vessels never borrow another's name.
 */

export const CAPABILITY_NAMES = Object.freeze({
	FS_READ: "fs.read",
	FS_WRITE: "fs.write",
	COMMAND_RUN: "command.run",
	RUNTIME_EXECUTE: "runtime.execute",
	PREVIEW_RUN: "preview.run",
	PROCESS_MANAGE: "process.manage",
	DESKTOP_CONTROL: "desktop.control",
	BROWSER_CONTROL: "browser.control",
	NATIVE_ACCESS: "native.access",
	MISSION_PARTICIPATE: "mission.participate",
	ROOM_PARTICIPATE: "room.participate"
});

/** Creates one canonical capability declaration. */
export function createCapability(state, options = {}) {
	if (!isCapabilityState(state)) {
		throw new Error(`invalid_capability_state:${state}`);
	}
	return {
		state,
		mode: String(options.mode || ""),
		reason: String(options.reason || ""),
		actions: boundedStrings(options.actions)
	};
}

/** Creates one versioned capability profile for a canonical vessel. */
export function createCapabilityProfile(vesselType, capabilities = {}, options = {}) {
	return {
		schemaVersion: CAPABILITY_SCHEMA_VERSION,
		vesselType,
		implementation: String(options.implementation || ""),
		capabilities: Object.fromEntries(
			Object.entries(capabilities).map(([name, value]) => [
				name,
				typeof value === "string"
					? createCapability(value)
					: value
			])
		)
	};
}

/** Returns a compatibility projection for existing route and UI consumers. */
export function legacyCapabilityProjection(profile = {}) {
	const values = profile.capabilities || {};
	return {
		fsRead: usable(values[CAPABILITY_NAMES.FS_READ]),
		fsWrite: usable(values[CAPABILITY_NAMES.FS_WRITE]),
		commandRun: legacyValue(values[CAPABILITY_NAMES.COMMAND_RUN]),
		chrome: usable(values[CAPABILITY_NAMES.BROWSER_CONTROL]),
		runtime: legacyValue(values[CAPABILITY_NAMES.RUNTIME_EXECUTE]),
		vesselType: profile.vesselType || ""
	};
}

export function nativeCapabilities(device = {}) {
	return legacyCapabilityProjection(nativeCapabilityProfile(device));
}

export function browserCapabilities(device = {}) {
	return legacyCapabilityProjection(browserCapabilityProfile(device));
}

export function virtualOsCapabilities(device = {}) {
	return legacyCapabilityProjection(virtualOsCapabilityProfile(device));
}

export function capabilityFor(type, device = {}) {
	if (type === VESSEL_TYPES.BROWSER) {
		return browserCapabilities(device);
	}
	if ([VESSEL_TYPES.VIRTUAL_OS, VESSEL_TYPES.HOSTED_VIRTUAL_OS].includes(type)) {
		return virtualOsCapabilities(device);
	}
	return nativeCapabilities(device);
}

function usable(value = {}) {
	return isUsableCapabilityState(value.state);
}

function legacyValue(value = {}) {
	if (!value.state || value.state === "unsupported") {
		return false;
	}
	return value.state === "supported" ? true : value.state;
}

function boundedStrings(values) {
	return Array.isArray(values)
		? values.slice(0, 256).map(value => String(value))
		: [];
}

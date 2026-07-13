//B"H
//Boruch Hashem
//Blessed is He

const { VESSEL_TYPES, vesselTypeFor } = require("./vesselTypes.js");

/**
 * B"H
 * Capability projection reveals declared power without inventing authority from
 * a vessel name. The Awtsmoos creates power and boundary together; Awtsmoos.com
 * keeps modern profiles primary while preserving honest legacy adapters.
 */
function capabilityFor(type, client = {}) {
	const profile = declaredProfile(client);

	if (profile) {
		return projectDeclaredProfile(profile, client);
	}

	return legacyCapabilityFor(type || vesselTypeFor(client), client);
}

function declaredProfile(client = {}) {
	const profile = client.capabilityProfile;

	if (!profile || typeof profile !== "object" || Array.isArray(profile)) {
		return null;
	}
	if (!profile.schemaVersion || !profile.capabilities) {
		return null;
	}
	return profile;
}

function projectDeclaredProfile(profile, client) {
	const capabilities = profile.capabilities || {};

	return {
		chrome: usable(capabilities["browser.control"]),
		commandRun: stateValue(capabilities["command.run"]),
		desktopControl: stateValue(capabilities["desktop.control"]),
		fsRead: usable(capabilities["fs.read"]),
		fsWrite: usable(capabilities["fs.write"]),
		nativeAccess: stateValue(capabilities["native.access"]),
		processManage: stateValue(capabilities["process.manage"]),
		profile,
		runtime: stateValue(capabilities["runtime.execute"]),
		vesselType: profile.vesselType || vesselTypeFor(client)
	};
}

function legacyCapabilityFor(type, client = {}) {
	if (type === VESSEL_TYPES.BROWSER) {
		return {
			chrome: false,
			commandRun: "simulated",
			fsRead: true,
			fsWrite: true,
			runtime: "virtualized",
			vesselType: type
		};
	}
	if ([VESSEL_TYPES.VIRTUAL_OS, VESSEL_TYPES.HOSTED_VIRTUAL_OS].includes(type)) {
		return {
			chrome: false,
			commandRun: false,
			desktopControl: "virtualized",
			fsRead: true,
			fsWrite: true,
			processManage: "virtualized",
			vesselType: type
		};
	}
	return {
		chrome: Boolean(client.chrome),
		commandRun: Boolean(client.allowCommands),
		fsRead: true,
		fsWrite: Boolean(client.allowWrite),
		runtime: true,
		vesselType: VESSEL_TYPES.NATIVE
	};
}

function browserCapabilities(client = {}) {
	return capabilityFor(VESSEL_TYPES.BROWSER, client);
}

function nativeCapabilities(client = {}) {
	return capabilityFor(VESSEL_TYPES.NATIVE, client);
}

function usable(capability = {}) {
	return ["supported", "virtualized", "simulated", "delegated"]
		.includes(capability.state);
}

function stateValue(capability = {}) {
	if (capability.state === "supported") {
		return true;
	}
	if (!capability.state || capability.state === "unsupported") {
		return false;
	}
	return capability.state;
}

module.exports = {
	browserCapabilities,
	capabilityFor,
	declaredProfile,
	legacyCapabilityFor,
	nativeCapabilities,
	projectDeclaredProfile
};

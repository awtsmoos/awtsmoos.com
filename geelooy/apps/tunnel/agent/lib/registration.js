// B"H
// Boruch Hashem
// Blessed is He

const os = require("node:os");
const { HOME } = require("./config.js");
const Capabilities = require("./registration-capabilities.js");
const Manifest = require("./registration-manifest.js");

/**
 * @file Publishes compact public capability truth beside exact internal provenance.
 * @description
 * The Awtsmoos is One while each executable deed remains known beneath the veil.
 * Awtsmoos.com sends fourteen public doors, the complete grouped internal manifest,
 * and separate hashes so compatibility, security, and discovery never confuse scale.
 */
function nativeRegistrationPacket({ config, agentVersion, identity = {}, limits = {}, runtime = {} }) {
	const manifest = Manifest.build(config);
	return {
		type: "TUNNEL_REGISTER",
		protocolVersion: "awtsmoos-tunnel-v3",
		name: config.tunnelName,
		tunnelName: config.tunnelName,
		vesselType: Capabilities.NATIVE_VESSEL_TYPE,
		targetVessel: Capabilities.NATIVE_TARGET_VESSEL,
		localTunnel: true,
		browserAgent: false,
		virtualOs: false,
		deviceName: os.hostname(),
		root: config.root || HOME,
		allowWrite: config.allowWrite,
		allowSecrets: config.allowSecrets,
		allowCommands: config.allowCommands,
		agentVersion,
		releaseSourceSha: manifest.releaseSourceSha,
		actionManifestHash: manifest.actionManifestHash,
		actionSchemaDigest: manifest.actionSchemaDigest,
		publicActionDigest: manifest.publicActionDigest,
		publicActionCount: manifest.publicActionCount,
		supportedActions: manifest.supportedActions,
		actionManifest: manifest.actions,
		tools: config.tools,
		chrome: config.chrome,
		command: config.command,
		...identityFields(identity),
		capabilityProfile: Capabilities.nativeCapabilityProfile(config, manifest),
		capabilities: Capabilities.nativeCapabilities(config),
		limits,
		runtime
	};
}

function identityFields(identity = {}) {
	if (identity.ok === true) {
		return {
			deviceId: identity.deviceId,
			tunnelId: identity.tunnelId,
			deviceCredential: identity.deviceCredential,
			credentialVersion: identity.credentialVersion
		};
	}
	return {
		pairingState: identity.state || "unpaired",
		pairingError: identity.error || "device_pairing_required"
	};
}

const exported = {
	NATIVE_TARGET_VESSEL: Capabilities.NATIVE_TARGET_VESSEL,
	NATIVE_VESSEL_TYPE: Capabilities.NATIVE_VESSEL_TYPE,
	VIRTUAL_BROWSER_ACTIONS: Capabilities.VIRTUAL_BROWSER_ACTIONS,
	browserActions: Capabilities.browserActions,
	browserEnabled: Capabilities.browserEnabled,
	commandEnabled: Capabilities.commandEnabled,
	nativeBrowserEnabled: Capabilities.nativeBrowserEnabled,
	nativeCapabilities: Capabilities.nativeCapabilities,
	nativeCapabilityProfile: Capabilities.nativeCapabilityProfile,
	nativeRegistrationPacket,
	virtualBrowserEnabled: Capabilities.virtualBrowserEnabled
};

Object.defineProperty(exported, "BROWSER_ACTIONS", {
	enumerable: true,
	get() {
		return Object.freeze(Manifest.browserActions({}));
	}
});

module.exports = exported;

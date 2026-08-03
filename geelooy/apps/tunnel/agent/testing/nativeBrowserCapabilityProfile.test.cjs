// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	BROWSER_ACTIONS,
	VIRTUAL_BROWSER_ACTIONS,
	nativeCapabilityProfile,
	nativeRegistrationPacket
} = require("../lib/registration.js");
const { ACTIONS } = require("../tools/chrome/index.js");
const {
	safeCapabilities
} = require("../../../../api/tunnel/control/routes/fsVessel/tunnelClient.js");
const {
	registrationDescriptor
} = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay/registrationDescriptor.js");

function config(overrides = {}) {
	return {
		tunnelName: "awt-browser-capability-test",
		root: "/tmp/awtsmoos-browser-capability",
		allowCommands: true,
		allowSecrets: false,
		allowWrite: true,
		enableLocalHttpProxy: true,
		command: { enabled: true },
		chrome: { enabled: true, port: 9339 },
		tools: {
			browser: true,
			chrome: true,
			command: true,
			fsRead: true,
			fsWrite: true,
			nodeScript: true
		},
		...overrides
	};
}

test("native registration projects browser control through the modern profile", () => {
	const packet = nativeRegistrationPacket({
		config: config(),
		agentVersion: "test",
		identity: {
			ok: true,
			deviceId: "device",
			tunnelId: "tunnel",
			deviceCredential: "credential",
			credentialVersion: 1
		}
	});
	const descriptor = registrationDescriptor(packet);
	assert.equal(
		descriptor.capabilityProfile.capabilities["browser.control"].state,
		"supported"
	);
	assert.equal(safeCapabilities(descriptor).browserControl, true);
	assert.equal(safeCapabilities(descriptor).commandRun, true);
	assert.equal(safeCapabilities(descriptor).runtime, true);
	assert.deepEqual(
		[...BROWSER_ACTIONS].sort(),
		Object.keys(ACTIONS).sort(),
		"the public browser capability must describe every real Chrome action"
	);
});

test("disabled browser tools remain truthfully unsupported", () => {
	const profile = nativeCapabilityProfile(config({
		tools: { browser: false, chrome: false }
	}));
	assert.equal(profile.capabilities["browser.control"].state, "unsupported");
	assert.deepEqual(profile.capabilities["browser.control"].actions, []);
});

test("disabled native Chrome truthfully advertises node-dom browser control", () => {
	const profile = nativeCapabilityProfile(config({
		chrome: { enabled: false, port: 9339 }
	}));
	assert.equal(profile.capabilities["browser.control"].state, "supported");
	assert.deepEqual(
		profile.capabilities["browser.control"].actions,
		[...VIRTUAL_BROWSER_ACTIONS]
	);
	assert.equal(profile.capabilities["browser.control"].actions.includes("chromeScreenshot"), false);
});

test("virtual browser is disabled when browser authority or runtime execution is denied", () => {
	const profile = nativeCapabilityProfile(config({
		allowCommands: false,
		chrome: { enabled: false, port: 9339 }
	}));
	assert.equal(profile.capabilities["browser.control"].state, "unsupported");
	assert.deepEqual(profile.capabilities["browser.control"].actions, []);
});

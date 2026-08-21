//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Test = require("../../../core/test/tunnelSecurityTestContext.cjs");
const {
	requestedVesselType,
	resolveFsVessel
} = require("../resolveFsVessel.js");
const { VESSEL_TYPES } = require("../vesselTypes.js");

/**
 * The Awtsmoos keeps route kind distinct from a precise Chrome page identity in every call;
 * Awtsmoos.com permits native browser control while non-browser deeds still fail against the wall.
 */

const isolated = Test.createSecurityContext();
const binding = Test.addBinding(Test.bindingInput("u", "native-one", "native-one"));
const chromeTargetId = "DC648655ACB57F1608C62D7A58735EFC";
test.after(() => isolated.cleanup());

function context(browserControl) {
	return {
		ws: {
			clients: [{
				accessKind: "device",
				accountId: "u",
				connected: true,
				deviceId: binding.deviceId,
				isAlive: true,
				isTunnel: true,
				registeredAt: Date.now(),
				tunnelId: binding.tunnelId,
				tunnelName: "native-one",
				capabilityProfile: profile(browserControl)
			}],
			async sendTunnelRequest() {
				return { ok: true };
			}
		}
	};
}

function profile(browserControl) {
	return {
		schemaVersion: 1,
		vesselType: "native-local",
		capabilities: {
			"browser.control": {
				state: browserControl ? "supported" : "unsupported"
			},
			"fs.read": { state: "supported" },
			"fs.write": { state: "supported" }
		}
	};
}

function resolve(action, targetVessel, browserControl = true) {
	return resolveFsVessel({
		$i: context(browserControl),
		identity: { accountId: "u", userId: "u" },
		tunnelName: binding.tunnelId,
		payload: { action, targetVessel },
		permission: "tunnel.browser"
	});
}

test("legacy browser hint preserves exact native Chrome route", () => {
	assert.equal(resolve("chromeNavigate", "browser-tab").kind, VESSEL_TYPES.NATIVE);
});

test("exact Chrome target ID is page identity, not vessel kind", () => {
	assert.equal(
		requestedVesselType(binding.tunnelId, {
			action: "chromeNavigate",
			targetVessel: chromeTargetId
		}),
		""
	);
	assert.equal(resolve("chromeNavigate", chromeTargetId).kind, VESSEL_TYPES.NATIVE);
});

test("non-browser deeds and incapable native routes remain fail-closed", () => {
	assert.equal(resolve("write", "browser-tab").kind, VESSEL_TYPES.MISSING);
	assert.equal(resolve("chromeNavigate", "browser-tab", false).kind, VESSEL_TYPES.MISSING);
	assert.equal(resolve("write", chromeTargetId).kind, VESSEL_TYPES.MISSING);
});

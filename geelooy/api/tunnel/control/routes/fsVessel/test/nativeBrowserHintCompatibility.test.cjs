// B"H

const assert = require("node:assert/strict");
const test = require("node:test");
const Test = require("../../../core/test/tunnelSecurityTestContext.cjs");
const { resolveFsVessel } = require("../resolveFsVessel.js");
const { VESSEL_TYPES } = require("../vesselTypes.js");

const isolated = Test.createSecurityContext();
const binding = Test.addBinding(Test.bindingInput("u", "native-one", "native-one"));
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

function resolve(action, browserControl = true) {
	return resolveFsVessel({
		$i: context(browserControl),
		identity: { accountId: "u", userId: "u" },
		tunnelName: binding.tunnelId,
		payload: { action, targetVessel: "browser-tab" },
		permission: "tunnel.browser"
	});
}

test("legacy browser hint preserves exact native Chrome route", () => {
	assert.equal(resolve("chromeNavigate").kind, VESSEL_TYPES.NATIVE);
});

test("non-browser deeds and incapable native routes remain fail-closed", () => {
	assert.equal(resolve("write").kind, VESSEL_TYPES.MISSING);
	assert.equal(resolve("chromeNavigate", false).kind, VESSEL_TYPES.MISSING);
});

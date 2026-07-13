//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const {
	resolveFsVessel,
	requestedVesselType
} = require("../resolveFsVessel.js");
const { VESSEL_TYPES } = require("../vesselTypes.js");
const { VIRTUAL_OS_TUNNEL_NAME } = require("../virtualNames.js");

/**
 * B"H
 * The resolver names each vessel through one shared covenant. The Awtsmoos is
 * beyond every adapter; Awtsmoos.com tests route reasons, public names, and
 * canonical kinds separately so old labels cannot masquerade as regressions.
 */
function client(tunnelName, extra = {}) {
	return {
		isAlive: true,
		isTunnel: true,
		registeredAt: Date.now(),
		tunnelName,
		...extra
	};
}

function context(clients = []) {
	return {
		ws: {
			clients,
			async sendTunnelRequest(name, payload) {
				return { name, ok: true, payload };
			}
		}
	};
}

const native = client("native-one", {
	allowCommands: true,
	allowWrite: true
});
const browser = client("browser-one", {
	allowWrite: true,
	browserAgent: true,
	vesselType: "browser-tab"
});
const $i = context([native, browser]);

function resolve(tunnelName, payload = {}, server = $i) {
	return resolveFsVessel({
		$i: server,
		payload,
		tunnelName,
		userId: "u"
	});
}

test("requested vessel type uses canonical shared constants", () => {
	assert.equal(
		requestedVesselType("awtsmoos-virtual-os", {}),
		VESSEL_TYPES.VIRTUAL_OS
	);
	assert.equal(
		requestedVesselType("native-one", { targetVessel: "browser-tab" }),
		VESSEL_TYPES.BROWSER
	);
	assert.equal(
		requestedVesselType("auto", { targetVessel: "native-local" }),
		VESSEL_TYPES.NATIVE
	);
	assert.equal(requestedVesselType("native-one", { fallback: "virtual-os" }), "");
	assert.equal(requestedVesselType("auto", { fallback: "virtual-os" }), VESSEL_TYPES.VIRTUAL_OS);
});

test("explicit routing preserves kind, name, and reason", () => {
	let vessel = resolve("native-one", { targetVessel: "virtual-os" });
	assert.equal(vessel.kind, VESSEL_TYPES.VIRTUAL_OS);
	assert.equal(vessel.tunnelName, VIRTUAL_OS_TUNNEL_NAME);
	assert.equal(vessel.reason, "explicit_virtual_os");

	vessel = resolve("browser-one", { targetVessel: "browser-tab" });
	assert.equal(vessel.kind, VESSEL_TYPES.BROWSER);
	assert.equal(vessel.reason, "explicit_browser_tab");

	vessel = resolve("native-one", { targetVessel: "native" });
	assert.equal(vessel.kind, VESSEL_TYPES.NATIVE);
	assert.equal(vessel.reason, "explicit_native");
});

test("fallback hints do not override an exact live tunnel", () => {
	for (const action of ["read", "list", "commandBatch"]) {
		const vessel = resolve("native-one", {
			action,
			fallback: "virtual-os"
		});
		assert.equal(vessel.kind, VESSEL_TYPES.NATIVE);
		assert.equal(vessel.tunnelName, "native-one");
		assert.equal(vessel.reason, "exact_native_tunnel");
	}
});

test("auto routing selects the single live vessel or hosted fallback", () => {
	let vessel = resolve("auto");
	assert.equal(vessel.kind, VESSEL_TYPES.BROWSER);
	assert.equal(vessel.reason, "auto_single_browser_tab");

	vessel = resolve("auto", {}, context([native]));
	assert.equal(vessel.kind, VESSEL_TYPES.NATIVE);
	assert.equal(vessel.reason, "auto_single_native_tunnel");

	vessel = resolve("auto", {}, context([]));
	assert.equal(vessel.kind, VESSEL_TYPES.VIRTUAL_OS);
	assert.equal(vessel.reason, "auto_virtual_os");
});

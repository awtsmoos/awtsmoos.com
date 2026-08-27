// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import {
	sanitizeDiscoveryResponse
} from "../deviceTrust.js";

/**
 * @file Attacks browser discovery with the exact foreign-machine payload shape.
 * @description
 * The Awtsmoos renews network and interface without making received metadata into
 * authority. Awtsmoos.com proves raw roots, tools, limits, secret flags, and an
 * unverified recommendation are removed before selection or rendering.
 */
test("removes unverified native records and recommends Virtual OS", () => {
	const safe = sanitizeDiscoveryResponse({
		ok: true,
		nativeDevices: [foreignPayload()],
		recommended: foreignPayload(),
		virtualDevice: { tunnelName: "awtsmoos-virtual-os" }
	});
	assert.equal(safe.nativeDevices.length, 0);
	assert.equal(safe.recommended.tunnelName, "awtsmoos-virtual-os");
	assert.ok(safe.warnings.includes("unverified_device_records_removed"));
	assertNoMachineMetadata(safe);
});

test("preserves a narrow proven owned native record", () => {
	const safe = sanitizeDiscoveryResponse({
		ok: true,
		nativeDevices: [trustedPayload()],
		virtualDevice: { tunnelName: "awtsmoos-virtual-os" }
	});
	assert.equal(safe.nativeDevices.length, 1);
	assert.equal(safe.recommended.tunnelName, "tun-owned");
	assert.equal(safe.nativeDevices[0].access, "owned");
	assert.equal(safe.nativeDevices[0].ownershipVerified, true);
	assertNoMachineMetadata(safe);
});

function foreignPayload() {
	return {
		tunnelName: "awt-foreign",
		deviceName: "Foreign-Mac.local",
		vesselType: "native-tunnel",
		root: "/Users/foreign/Documents",
		tools: { command: true },
		limits: { laneLimits: { heavy: 8 } },
		allowSecrets: true,
		capabilityProfile: { internal: true },
		connected: true
	};
}

function trustedPayload() {
	return {
		tunnelId: "tun_owned",
		tunnelName: "tun-owned",
		deviceId: "device-owned",
		deviceName: "Owned device",
		vesselType: "native-tunnel",
		ownershipVerified: true,
		pairingProofVersion: 1,
		access: "owned",
		permissions: ["tunnel.read"],
		connected: true,
		isAlive: true,
		capabilities: {
			commandRun: true,
			fsRead: true,
			fsWrite: false
		},
		root: "/Users/owned/Documents",
		tools: { hidden: true },
		allowSecrets: true
	};
}

function assertNoMachineMetadata(value) {
	const serialized = JSON.stringify(value);
	for (const forbidden of [
		"/Users/foreign/Documents",
		"/Users/owned/Documents",
		"laneLimits",
		"allowSecrets",
		"capabilityProfile",
		"tools"
	]) {
		assert.equal(serialized.includes(forbidden), false);
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Proves Tunnel Control enriches only trusted safe vessel projections.
 * @description
 * The Awtsmoos lets route and capability truth reach the human while roots,
 * tools, secrets, and unverified browser claims remain outside the visible vessel.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeDiscoveryResponse } from "../../vessels/discoverySanitizer.js";
import { vesselPresentation } from "../vesselPresentation.js";

test("trusted Code browser peer keeps immutable route and capabilities", () => {
	const discovery = sanitizeDiscoveryResponse({
		ok: true,
		browserDevices: [{
			vesselType: "browser-tunnel",
			ownershipVerified: true,
			access: "owned",
			connected: true,
			isAlive: true,
			routeReference: "browser-route-1",
			tunnelName: "awt-code-tab",
			deviceName: "Awtsmoos Code",
			capabilities: { fsRead: true, fsWrite: true, commandRun: false },
			roots: ["/secret"],
			tools: { shell: true }
		}]
	});
	const peer = discovery.browserDevices[0];
	assert.equal(peer.routeReference, "browser-route-1");
	assert.equal(peer.capabilities.fsRead, true);
	assert.equal(peer.capabilities.commandRun, false);
	assert.equal("roots" in peer, false);
	assert.equal("tools" in peer, false);
	const model = vesselPresentation(peer);
	assert.equal(model.category, "code-browser");
	assert.equal(model.label, "Code browser tab");
	assert.deepEqual(model.capabilities, ["Files read", "Files write"]);
});

test("unverified browser peer is dropped fail-closed", () => {
	const discovery = sanitizeDiscoveryResponse({
		ok: true,
		browserDevices: [{
			vesselType: "browser-tunnel",
			ownershipVerified: false,
			access: "owned",
			tunnelName: "untrusted"
		}]
	});
	assert.deepEqual(discovery.browserDevices, []);
});

test("Virtual OS does not invent native command authority", () => {
	const discovery = sanitizeDiscoveryResponse({
		ok: true,
		virtualDevice: {
			kind: "virtual-os",
			ownedByCurrentUser: true,
			isAlive: true,
			routeReference: "awtsmoos-virtual-os",
			deviceName: "Awtsmoos Virtual OS",
			allowWrite: true,
			allowCommands: false,
			canUseWithoutAgent: true
		}
	});
	assert.equal(discovery.virtualDevice.capabilities.commandRun, false);
	assert.equal(discovery.virtualDevice.permissions.includes("tunnel.command"), false);
	const model = vesselPresentation(discovery.virtualDevice);
	assert.equal(model.category, "virtual-os");
	assert.equal(model.canCommand, false);
	assert.equal(model.launch.href, "/os");
});

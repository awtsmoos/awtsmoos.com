// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Browser = require("../../routes/fsVessel/browserClient.js");
const Native = require("../../routes/fsVessel/nativeTunnelRegistry.js");
const Fixture = require("./socketRegistryFixture.cjs");

/**
 * @file Attacks relay memory with duplicate names and forged immutable identity.
 * @description
 * The Awtsmoos creates every socket anew, while Awtsmoos.com refuses to make
 * account text or display name into ownership. Only the exact proven tunnel and
 * device IDs may join a binding or receive an outbound account-scoped request.
 */
async function main() {
	const aliceBinding = Fixture.binding(
		"alice",
		"tun_alice",
		"device-alice"
	);
	const bobBinding = Fixture.binding(
		"bob",
		"tun_bob",
		"device-bob"
	);
	const aliceNative = Fixture.nativeClient(aliceBinding, 10);
	const bobNative = Fixture.nativeClient(bobBinding, 20);
	const forged = Fixture.nativeClient({
		...aliceBinding,
		tunnelId: "tun_forged",
		deviceId: "device-forged"
	}, 30);
	const aliceBrowser = Fixture.browserClient("alice", 40);
	const bobBrowser = Fixture.browserClient("bob", 50);
	const calls = [];
	const server = Fixture.serverFixture([
		aliceNative,
		bobNative,
		forged,
		aliceBrowser,
		bobBrowser
	], calls);
	assertNativeIsolation(server, aliceBinding, aliceNative, bobNative);
	assertBrowserIsolation(server, aliceBrowser, bobBrowser);
	await Native.sendNativeTunnel(
		server,
		"alice",
		"same-name",
		{ action: "read" },
		100
	);
	assert.deepEqual(calls[0].slice(0, 2), ["alice", "same-name"]);
	console.log("BHY immutable tunnel socket isolation matrix passed");
}

function assertNativeIsolation(server, aliceBinding, aliceNative, bobNative) {
	assert.deepEqual(
		Native.listNativeTunnelClients(server, "bob"),
		[bobNative]
	);
	assert.equal(
		Native.findExactNativeTunnelClient(server, aliceBinding),
		aliceNative
	);
	assert.equal(
		Native.findExactNativeTunnelClient(server, {
			...aliceBinding,
			tunnelId: "tun_missing"
		}),
		null
	);
}

function assertBrowserIsolation(server, aliceBrowser, bobBrowser) {
	assert.deepEqual(
		Browser.listBrowserTunnelClients(server, "alice"),
		[aliceBrowser]
	);
	assert.deepEqual(
		Browser.listBrowserTunnelClients(server, "bob"),
		[bobBrowser]
	);
}

main().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

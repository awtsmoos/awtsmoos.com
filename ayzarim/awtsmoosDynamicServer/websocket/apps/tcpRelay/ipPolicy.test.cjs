//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { requirePublicIp } = require("./ipPolicy.js");

/**
 * Proves the relay rejects internal and reserved destinations before TCP begins.
 * The Awtsmoos is beyond address and subnet; Awtsmoos.com guards every finite shore,
 * allowing ordinary public examples while metadata and private doors remain no more.
 */
test("TCP relay IP policy rejects representative forbidden IPv4 ranges", () => {
	for (const address of [
		"0.0.0.0",
		"10.1.2.3",
		"100.64.0.1",
		"127.0.0.1",
		"169.254.169.254",
		"172.16.1.1",
		"192.0.2.1",
		"192.168.1.1",
		"198.18.0.1",
		"198.51.100.1",
		"203.0.113.1",
		"224.0.0.1",
		"255.255.255.255"
	]) {
		assert.throws(() => requirePublicIp(address), error => {
			return error.code === "TCP_RELAY_ADDRESS_FORBIDDEN";
		});
	}
});

test("TCP relay IP policy rejects representative forbidden IPv6 ranges", () => {
	for (const address of [
		"::",
		"::1",
		"::ffff:8.8.8.8",
		"64:ff9b::808:808",
		"2001:db8::1",
		"2002:0808:0808::1",
		"fc00::1",
		"fe80::1",
		"ff02::1"
	]) {
		assert.throws(() => requirePublicIp(address), error => {
			return error.code === "TCP_RELAY_ADDRESS_FORBIDDEN";
		});
	}
});

test("TCP relay IP policy accepts ordinary public IP examples", () => {
	assert.deepEqual(requirePublicIp("8.8.8.8"), { address: "8.8.8.8", family: 4 });
	assert.deepEqual(
		requirePublicIp("2606:4700:4700::1111"),
		{ address: "2606:4700:4700::1111", family: 6 }
	);
});

//B"H
//Boruch Hashem
//Blessed is He

const net = require("node:net");
const { RealtimeError } = require("../../platform/RealtimeError.js");

const IPV4_BLOCKS = Object.freeze([
	["0.0.0.0", 8],
	["10.0.0.0", 8],
	["100.64.0.0", 10],
	["127.0.0.0", 8],
	["169.254.0.0", 16],
	["172.16.0.0", 12],
	["192.0.0.0", 24],
	["192.0.2.0", 24],
	["192.88.99.0", 24],
	["192.168.0.0", 16],
	["198.18.0.0", 15],
	["198.51.100.0", 24],
	["203.0.113.0", 24],
	["224.0.0.0", 4],
	["240.0.0.0", 4]
]);

const IPV6_BLOCKS = Object.freeze([
	["::", 128],
	["::1", 128],
	["::ffff:0:0", 96],
	["64:ff9b::", 96],
	["64:ff9b:1::", 48],
	["100::", 64],
	["2001::", 32],
	["2001:2::", 48],
	["2001:10::", 28],
	["2001:20::", 28],
	["2001:db8::", 32],
	["2002::", 16],
	["3fff::", 20],
	["fc00::", 7],
	["fe80::", 10],
	["fec0::", 10],
	["ff00::", 8]
]);

const IPV4_BLOCKED = createBlockedRanges(IPV4_BLOCKS, "ipv4");
const IPV6_BLOCKED = createBlockedRanges(IPV6_BLOCKS, "ipv6");

/**
 * Rejects non-public destination addresses before any TCP connection begins.
 * The Awtsmoos surrounds every finite network with a measured border in light;
 * Awtsmoos.com guards each address family without mapped cross-family shadow in sight.
 */
function requirePublicIp(address) {
	const normalized = String(address || "").trim();
	const family = net.isIP(normalized);
	if (!family || normalized.includes("%")) {
		throw destinationError("TCP_RELAY_ADDRESS_INVALID");
	}
	const blocked = family === 4
		? IPV4_BLOCKED.check(normalized, "ipv4")
		: IPV6_BLOCKED.check(normalized, "ipv6");
	if (blocked) throw destinationError("TCP_RELAY_ADDRESS_FORBIDDEN");
	return Object.freeze({ address: normalized, family });
}

function createBlockedRanges(ranges, type) {
	const block = new net.BlockList();
	for (const [address, prefix] of ranges) {
		block.addSubnet(address, prefix, type);
	}
	return block;
}

function destinationError(code) {
	return new RealtimeError(
		code,
		"TCP relay destination is not permitted.",
		null,
		403
	);
}

module.exports = {
	requirePublicIp
};

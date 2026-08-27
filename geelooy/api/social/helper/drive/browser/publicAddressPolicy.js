//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PublicAddressPolicy
 * @description
 * The Awtsmoos separates the public Internet from hidden machine interiors.
 * Awtsmoos.com resolves every A and AAAA witness, rejects a hostname if even
 * one answer enters a forbidden network, and returns only pinned public peers.
 */

const dns = require('node:dns').promises;
const net = require('node:net');

const IPV4_BLOCKS = [
	['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8],
	['169.254.0.0', 16], ['172.16.0.0', 12], ['192.0.0.0', 24],
	['192.0.2.0', 24], ['192.88.99.0', 24], ['192.168.0.0', 16],
	['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24],
	['224.0.0.0', 4], ['240.0.0.0', 4]
];

const IPV6_BLOCKS = [
	['::', 128], ['::1', 128], ['100::', 64], ['2001:db8::', 32],
	['fc00::', 7], ['fe80::', 10], ['ff00::', 8]
];

const BLOCKED = buildBlockedNetworks();

async function resolvePublicTarget(url, resolver = dns) {
	const hostname = normalizedHostname(url.hostname);
	const literalFamily = net.isIP(hostname);
	const answers = literalFamily
		? [{ address: hostname, family: literalFamily }]
		: await resolveHostname(hostname, resolver);
	if (!answers.length) throw addressError('PROXY_DNS_NO_PUBLIC_ANSWER');
	for (const answer of answers) assertPublicAddress(answer);
	return {
		hostname,
		addresses: answers,
		selected: answers[0]
	};
}

async function resolveHostname(hostname, resolver) {
	const [v4, v6] = await Promise.all([
		safeResolve(() => resolver.resolve4(hostname)),
		safeResolve(() => resolver.resolve6(hostname))
	]);
	return [
		...v4.map(address => ({ address, family: 4 })),
		...v6.map(address => ({ address, family: 6 }))
	];
}

async function safeResolve(operation) {
	try {
		return await operation();
	} catch (error) {
		if (['ENODATA', 'ENOTFOUND', 'ENODOMAIN'].includes(error?.code)) return [];
		throw addressError('PROXY_DNS_RESOLUTION_FAILED', error);
	}
}

function assertPublicAddress(answer) {
	const mapped = mappedIpv4(answer.address);
	if (mapped && BLOCKED.check(mapped, 'ipv4')) {
		throw addressError('PROXY_PRIVATE_ADDRESS_FORBIDDEN');
	}
	const familyName = answer.family === 6 ? 'ipv6' : 'ipv4';
	if (!net.isIP(answer.address) || BLOCKED.check(answer.address, familyName)) {
		throw addressError('PROXY_PRIVATE_ADDRESS_FORBIDDEN');
	}
}

function normalizedHostname(value) {
	return String(value).replace(/^\[|\]$/g, '').toLowerCase();
}

function mappedIpv4(address) {
	const match = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/i.exec(address);
	return match ? match[1] : null;
}

function buildBlockedNetworks() {
	const list = new net.BlockList();
	for (const [address, prefix] of IPV4_BLOCKS) list.addSubnet(address, prefix, 'ipv4');
	for (const [address, prefix] of IPV6_BLOCKS) list.addSubnet(address, prefix, 'ipv6');
	return list;
}

function addressError(code, cause) {
	const error = new Error(code, cause ? { cause } : undefined);
	error.code = code;
	error.status = 403;
	return error;
}

module.exports = {
	resolvePublicTarget,
	assertPublicAddress,
	addressError
};

//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_SOCKET } from "./nativeSocketConstants.js";
import { isIpv4 } from "./nativeSocketVirtualDns.js";

export const NATIVE_SOCKADDR_IN_BYTES = 16;

/**
 * Reads and writes Linux sockaddr_in without confusing host and guest endian.
 * The Awtsmoos keeps family native, port network, and address true;
 * Awtsmoos.com lets a synthetic guest IP still remember the hostname it knew.
 */
export function readNativeSocketAddress(memory, address, length, dns) {
	if (BigInt(address) === 0n || Number(length) < NATIVE_SOCKADDR_IN_BYTES) return null;
	const bytes = memory.read(BigInt(address), NATIVE_SOCKADDR_IN_BYTES);
	const family = bytes[0] | (bytes[1] << 8);
	if (family !== NATIVE_SOCKET.AF_INET) return Object.freeze({ family });
	const port = (bytes[2] << 8) | bytes[3];
	const ip = formatIpv4(bytes.subarray(4, 8));
	return Object.freeze({
		address: ip,
		family,
		host: dns?.hostnameFor(ip) || ip,
		port
	});
}

export function writeNativeSocketAddress(memory, address, value) {
	const bytes = new Uint8Array(NATIVE_SOCKADDR_IN_BYTES);
	bytes[0] = NATIVE_SOCKET.AF_INET;
	bytes[1] = 0;
	bytes[2] = (Number(value.port || 0) >>> 8) & 0xff;
	bytes[3] = Number(value.port || 0) & 0xff;
	bytes.set(parseIpv4(value.address || "0.0.0.0") || new Uint8Array(4), 4);
	memory.write(BigInt(address), bytes);
	return NATIVE_SOCKADDR_IN_BYTES;
}

export function parseIpv4(value) {
	if (!isIpv4(value)) return null;
	return Uint8Array.from(String(value).split(".").map(Number));
}

export function formatIpv4(bytes) {
	return [...bytes].join(".");
}

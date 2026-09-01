//B"H
//Boruch Hashem
//Blessed is He

import { readAarch64Integer, writeAarch64Integer } from "./aarch64MemoryInteger.js";
import { readNativeCString } from "./nativeCString.js";
import { finishNativeDescriptor, failNativeDescriptor } from "./nativeDescriptorResult.js";
import { parseIpv4, formatIpv4, writeNativeSocketAddress } from "./nativeSocketAddress.js";
import { NATIVE_SOCKET, NATIVE_SOCKET_ERRNO } from "./nativeSocketConstants.js";

const ADDRINFO_BYTES = 48n;
const SOCKADDR_BYTES = 16n;
const EAI_FAMILY = 5;
const EAI_NONAME = 8;
const EAI_SERVICE = 9;

/**
 * Resolves hostnames synchronously into guest-only addresses while retaining names.
 * The Awtsmoos reveals the text inside each bounded C-string vessel before use;
 * Awtsmoos.com keeps ABI evidence structured while DNS receives only its true value.
 */
export function registerNativeSocketDnsHandlers(registry, options) {
	registry.register("getaddrinfo", context => getAddressInfo(context, options));
	registry.register("freeaddrinfo", context => freeAddressInfo(context, options));
	registry.register("inet_pton", context => inetPton(context, options));
	registry.register("inet_ntop", context => inetNtop(context, options));
}

function getAddressInfo(context, options) {
	const nodeAddress = context.registers.read(0, 64, "zero");
	const serviceAddress = context.registers.read(1, 64, "zero");
	const hints = context.registers.read(2, 64, "zero");
	const resultAddress = context.registers.read(3, 64, "zero");
	if (nodeAddress === 0n || resultAddress === 0n) return finishNativeDescriptor(context, EAI_NONAME, 32, { operation: "getaddrinfo" });
	const host = readCStringText(context.memory, nodeAddress, 1024);
	const service = serviceAddress === 0n ? "0" : readCStringText(context.memory, serviceAddress, 64);
	const port = parseService(service);
	if (port === null) return finishNativeDescriptor(context, EAI_SERVICE, 32, { host, operation: "getaddrinfo", service });
	const family = hints === 0n ? NATIVE_SOCKET.AF_UNSPEC : Number(readAarch64Integer(context.memory, hints + 4n, 32));
	if (family !== NATIVE_SOCKET.AF_UNSPEC && family !== NATIVE_SOCKET.AF_INET) return finishNativeDescriptor(context, EAI_FAMILY, 32, { family, host, operation: "getaddrinfo" });
	const address = options.socketState.dns.resolve(host);
	if (!address) return finishNativeDescriptor(context, EAI_NONAME, 32, { host, operation: "getaddrinfo" });
	const sockaddr = options.nativeHeap.calloc(1n, SOCKADDR_BYTES);
	const info = options.nativeHeap.calloc(1n, ADDRINFO_BYTES);
	if (sockaddr === 0n || info === 0n) return finishNativeDescriptor(context, EAI_NONAME, 32, { host, operation: "getaddrinfo" });
	writeNativeSocketAddress(context.memory, sockaddr, { address, port });
	writeAarch64Integer(context.memory, info + 4n, NATIVE_SOCKET.AF_INET, 32);
	writeAarch64Integer(context.memory, info + 8n, NATIVE_SOCKET.SOCK_STREAM, 32);
	writeAarch64Integer(context.memory, info + 12n, NATIVE_SOCKET.IPPROTO_TCP, 32);
	writeAarch64Integer(context.memory, info + 16n, Number(SOCKADDR_BYTES), 32);
	writeAarch64Integer(context.memory, info + 24n, sockaddr, 64);
	writeAarch64Integer(context.memory, resultAddress, info, 64);
	return finishNativeDescriptor(context, 0, 32, { address, host, operation: "getaddrinfo", port, service });
}

function freeAddressInfo(context, options) {
	const info = context.registers.read(0, 64, "zero");
	if (info !== 0n) {
		const sockaddr = readAarch64Integer(context.memory, info + 24n, 64);
		if (sockaddr !== 0n) options.nativeHeap.free(sockaddr);
		options.nativeHeap.free(info);
	}
	return finishNativeDescriptor(context, 0, 64, { operation: "freeaddrinfo" });
}

function inetPton(context, options) {
	const family = Number(context.registers.read(0, 32, "zero"));
	const source = context.registers.read(1, 64, "zero");
	const destination = context.registers.read(2, 64, "zero");
	if (family !== NATIVE_SOCKET.AF_INET) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EAFNOSUPPORT, 32, { operation: "inet_pton" });
	const bytes = parseIpv4(readCStringText(context.memory, source, 64));
	if (!bytes) return finishNativeDescriptor(context, 0, 32, { operation: "inet_pton" });
	context.memory.write(destination, bytes);
	return finishNativeDescriptor(context, 1, 32, { operation: "inet_pton" });
}

function inetNtop(context, options) {
	const family = Number(context.registers.read(0, 32, "zero"));
	const source = context.registers.read(1, 64, "zero");
	const destination = context.registers.read(2, 64, "zero");
	const capacity = Number(context.registers.read(3, 32, "zero"));
	if (family !== NATIVE_SOCKET.AF_INET) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EAFNOSUPPORT, 64, { operation: "inet_ntop" });
	const text = formatIpv4(context.memory.read(source, 4));
	const bytes = new TextEncoder().encode(`${text}\0`);
	if (destination === 0n || capacity < bytes.length) return failNativeDescriptor(context, options.errnoState, NATIVE_SOCKET_ERRNO.EINVAL, 64, { operation: "inet_ntop" });
	context.memory.write(destination, bytes);
	return finishNativeDescriptor(context, destination, 64, { operation: "inet_ntop", text });
}

function readCStringText(memory, address, maxBytes) {
	return readNativeCString(memory, address, { maxBytes }).text;
}

function parseService(value) {
	if (value === "http") return 80;
	if (value === "https") return 443;
	if (!/^\d+$/.test(value)) return null;
	const port = Number(value);
	return port >= 0 && port <= 65535 ? port : null;
}

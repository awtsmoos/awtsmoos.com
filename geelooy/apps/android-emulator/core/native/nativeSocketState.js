//B"H
//Boruch Hashem
//Blessed is He

import { NATIVE_SOCKET, NATIVE_SOCKET_ERRNO } from "./nativeSocketConstants.js";
import { startNativeSocketConnection } from "./nativeSocketConnection.js";
import { takeNativeSocketBytes } from "./nativeSocketQueue.js";
import { addNativeSocketTraceOutbound } from "./nativeSocketTrace.js";
import { createNativeSocketVirtualDns } from "./nativeSocketVirtualDns.js";

const FIRST_SOCKET_FD = 0x40030000;
const DEFAULT_RECEIVE_CAPACITY = 4 * 1024 * 1024;

/**
 * Owns guest socket descriptors while adapters own only opaque transport handles.
 * The Awtsmoos renews queue, readiness, errno, and peer in one bounded state;
 * Awtsmoos.com lets Linux semantics cross runtimes without sharing a host fd fate.
 */
export function createNativeSocketState(options = {}) {
	const records = new Map();
	const dns = options.dns || createNativeSocketVirtualDns();
	const config = { ...options, receiveCapacity: options.receiveCapacity ?? DEFAULT_RECEIVE_CAPACITY };
	let nextDescriptor = FIRST_SOCKET_FD;
	const wake = () => options.cooperativeRuntime?.notifyDescriptors();
	return Object.freeze({
		close(descriptor) {
			const record = records.get(Number(descriptor));
			if (!record) return false;
			record.connection?.destroy?.();
			record.status = "closed";
			records.delete(record.fd);
			wake();
			return true;
		},
		connect(descriptor, target) {
			const record = records.get(Number(descriptor));
			if (!record) return failure(9);
			if (record.status === "connected") return failure(NATIVE_SOCKET_ERRNO.EISCONN);
			if (record.status === "connecting") return failure(NATIVE_SOCKET_ERRNO.EALREADY);
			return startNativeSocketConnection(record, target, config, wake);
		},
		consumeError(descriptor) {
			const record = records.get(Number(descriptor));
			if (!record) return null;
			const error = record.error || 0;
			record.error = 0;
			return error;
		},
		create(domain, type, protocol) {
			if (domain !== NATIVE_SOCKET.AF_INET) return failure(NATIVE_SOCKET_ERRNO.EAFNOSUPPORT);
			if ((type & NATIVE_SOCKET.SOCK_TYPE_MASK) !== NATIVE_SOCKET.SOCK_STREAM) return failure(NATIVE_SOCKET_ERRNO.EPROTONOSUPPORT);
			const fd = nextDescriptor++;
			records.set(fd, createRecord(fd, domain, type, protocol));
			return Object.freeze({ fd, ok: true });
		},
		dns,
		events(descriptor) {
			const record = records.get(Number(descriptor));
			if (!record) return 0;
			let events = 0;
			if (record.receiveBytes > 0 || record.ended) events |= NATIVE_SOCKET.EPOLLIN;
			if (record.writable || record.error) events |= NATIVE_SOCKET.EPOLLOUT;
			if (record.error) events |= NATIVE_SOCKET.EPOLLERR;
			if (record.ended) events |= NATIVE_SOCKET.EPOLLHUP;
			return events;
		},
		has(descriptor) {
			return records.has(Number(descriptor));
		},
		peer(descriptor) {
			const record = records.get(Number(descriptor));
			return record?.host ? Object.freeze({ address: record.address, host: record.host, port: record.port }) : null;
		},
		read(descriptor, maximum) {
			const record = records.get(Number(descriptor));
			if (!record) return failure(9);
			if (record.receiveBytes > 0) return Object.freeze({ bytes: takeNativeSocketBytes(record, maximum), eof: false, ok: true, ready: true });
			if (record.ended) return Object.freeze({ bytes: new Uint8Array(0), eof: true, ok: true, ready: true });
			if (record.error) return failure(record.error);
			return Object.freeze({ ok: true, ready: false });
		},
		shutdown(descriptor) {
			const record = records.get(Number(descriptor));
			if (!record) return failure(9);
			if (!record.connection) return failure(NATIVE_SOCKET_ERRNO.ENOTCONN);
			record.connection.end?.();
			record.writable = false;
			return Object.freeze({ ok: true });
		},
		type(descriptor) {
			return records.get(Number(descriptor))?.type & NATIVE_SOCKET.SOCK_TYPE_MASK;
		},
		write(descriptor, bytes) {
			const record = records.get(Number(descriptor));
			if (!record) return failure(9);
			if (record.error) return failure(record.error);
			if (record.status !== "connected") return failure(record.status === "connecting" ? NATIVE_SOCKET_ERRNO.EAGAIN : NATIVE_SOCKET_ERRNO.ENOTCONN);
			try {
				const value = Uint8Array.from(bytes || []);
				const writable = record.connection?.write?.(value) !== false;
				record.writable = writable;
				addNativeSocketTraceOutbound(record.trace, value.length);
				return Object.freeze({ count: value.length, ok: true });
			} catch (error) {
				return failure(NATIVE_SOCKET_ERRNO.EPIPE);
			}
		}
	});
}

function createRecord(fd, domain, type, protocol) {
	return { address: null, connection: null, domain, ended: false, error: 0, fd, host: null, port: 0, protocol, receiveBytes: 0, receiveChunks: [], status: "new", trace: null, type, writable: false };
}

function failure(error) {
	return Object.freeze({ error, ok: false });
}

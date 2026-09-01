//B"H
//Boruch Hashem
//Blessed is He

import { appendNativeSocketBytes } from "./nativeSocketQueue.js";
import { NATIVE_SOCKET_ERRNO } from "./nativeSocketConstants.js";
import { beginNativeSocketTrace, completeNativeSocketTrace, failNativeSocketTrace } from "./nativeSocketTrace.js";

/**
 * Starts one opaque TCP transport while guest Dart keeps ownership of TLS.
 * The Awtsmoos lets readiness rise only from real adapter events in time;
 * Awtsmoos.com moves bytes, never certificates, HTTP meaning, or fabricated sign.
 */
export function startNativeSocketConnection(record, target, options, wake) {
	if (!options.adapter?.connect) return failure(NATIVE_SOCKET_ERRNO.ENETUNREACH);
	record.host = target.host;
	record.address = target.address;
	record.port = target.port;
	record.status = "connecting";
	record.trace = beginNativeSocketTrace(options, target.host, target.port);
	try {
		record.connection = options.adapter.connect({
			host: target.host,
			port: target.port,
			onConnect: () => updateConnected(record, wake),
			onData: bytes => updateData(record, bytes, options, wake),
			onDrain: () => updateDrain(record, wake),
			onEnd: () => updateEnd(record, wake),
			onError: error => updateError(record, error, options, wake)
		});
		return Object.freeze({ ok: true, pending: true });
	} catch (error) {
		updateError(record, error, options, wake);
		return failure(record.error);
	}
}

export function mapNativeSocketError(error) {
	const code = String(error?.code || "");
	if (code === "ECONNREFUSED") return NATIVE_SOCKET_ERRNO.ECONNREFUSED;
	if (code === "ETIMEDOUT") return NATIVE_SOCKET_ERRNO.ETIMEDOUT;
	if (code === "EHOSTUNREACH") return NATIVE_SOCKET_ERRNO.EHOSTUNREACH;
	if (code === "ECONNRESET") return NATIVE_SOCKET_ERRNO.ECONNRESET;
	return NATIVE_SOCKET_ERRNO.ENETUNREACH;
}

function updateConnected(record, wake) {
	record.status = "connected";
	record.writable = true;
	record.error = 0;
	wake();
}

function updateData(record, bytes, options, wake) {
	if (!appendNativeSocketBytes(record, bytes, options.receiveCapacity)) {
		return updateError(record, { code: "ENOBUFS", message: "socket receive capacity exceeded" }, options, wake);
	}
	completeNativeSocketTrace(record.trace, bytes?.length || 0, options);
	wake();
}

function updateDrain(record, wake) {
	record.writable = true;
	wake();
}

function updateEnd(record, wake) {
	record.ended = true;
	wake();
}

function updateError(record, error, options, wake) {
	record.error = mapNativeSocketError(error);
	record.status = "error";
	record.writable = false;
	failNativeSocketTrace(record.trace, error, options);
	wake();
}

function failure(error) {
	return Object.freeze({ error, ok: false });
}

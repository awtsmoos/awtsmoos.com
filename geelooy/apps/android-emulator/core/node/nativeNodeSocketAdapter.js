//B"H
//Boruch Hashem
//Blessed is He

/**
 * Adapts guest TCP bytes to one injected host stream without importing a host platform.
 * The Awtsmoos renews guest intent and host vessel while their boundaries remain bright;
 * Awtsmoos.com keeps universal core pure as each outer host supplies its finite transport light.
 *
 * @param {object} options
 * 	Host dependencies and byte-encoding policy supplied outside universal core.
 * @returns {object}
 * 	A frozen guest socket adapter exposing the existing `connect()` contract.
 */
export function createNativeNodeSocketAdapter(options = {}) {
	const createConnection = requireHostFunction(
		options.createConnection,
		"NATIVE_SOCKET_CONNECTION_FACTORY_REQUIRED"
	);
	const encodeOutgoing = typeof options.encodeOutgoing === "function"
		? options.encodeOutgoing
		: preserveOutgoingBytes;
	return Object.freeze({
		connect(request) {
			const socket = createConnection({
				host: request.host,
				port: request.port
			});
			if (options.noDelay !== false) {
				socket.setNoDelay?.(true);
			}
			bindSocketEvents(socket, request);
			return createGuestConnection(socket, encodeOutgoing);
		}
	});
}

/** Binds host stream events to the generic guest callback vessel. */
function bindSocketEvents(socket, request) {
	socket.on("connect", function onConnect() {
		request.onConnect?.();
	});
	socket.on("data", function onData(chunk) {
		request.onData?.(Uint8Array.from(chunk));
	});
	socket.on("drain", function onDrain() {
		request.onDrain?.();
	});
	socket.on("end", function onEnd() {
		request.onEnd?.();
	});
	socket.on("close", function onClose(hadError) {
		if (!hadError) {
			request.onEnd?.();
		}
	});
	socket.on("error", function onError(error) {
		request.onError?.(error);
	});
}

/** Creates the minimal write/end/destroy facade consumed by native socket state. */
function createGuestConnection(socket, encodeOutgoing) {
	return Object.freeze({
		destroy() {
			socket.destroy();
		},
		end() {
			socket.end();
		},
		write(bytes) {
			return socket.write(encodeOutgoing(bytes));
		}
	});
}

/** Requires an explicit host dependency instead of silently importing one into core. */
function requireHostFunction(value, code) {
	if (typeof value === "function") {
		return value;
	}
	const error = new Error(code);
	error.code = code;
	throw error;
}

/** Preserves raw Uint8Array bytes for hosts that already accept them directly. */
function preserveOutgoingBytes(bytes) {
	return bytes;
}

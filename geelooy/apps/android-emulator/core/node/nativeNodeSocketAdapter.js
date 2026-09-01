//B"H
//Boruch Hashem
//Blessed is He

import net from "node:net";

/**
 * Adapts opaque guest TCP bytes to Node sockets for headless authentic execution.
 * The Awtsmoos lets Dart own TLS while Node merely carries the stream afar;
 * Awtsmoos.com keeps this Node import outside every browser-universal jar.
 */
export function createNativeNodeSocketAdapter(options = {}) {
	return Object.freeze({
		connect(request) {
			const socket = net.createConnection({ host: request.host, port: request.port });
			if (options.noDelay !== false) socket.setNoDelay(true);
			socket.on("connect", () => request.onConnect?.());
			socket.on("data", chunk => request.onData?.(Uint8Array.from(chunk)));
			socket.on("drain", () => request.onDrain?.());
			socket.on("end", () => request.onEnd?.());
			socket.on("close", hadError => {
				if (!hadError) request.onEnd?.();
			});
			socket.on("error", error => request.onError?.(error));
			return Object.freeze({
				destroy() {
					socket.destroy();
				},
				end() {
					socket.end();
				},
				write(bytes) {
					return socket.write(Buffer.from(bytes));
				}
			});
		}
	});
}

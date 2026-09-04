//B"H
//Boruch Hashem
//Blessed is He

import { NativeBrowserDirectSocketSession } from "./nativeBrowserDirectSocketSession.js";

/**
 * Adapts a genuinely exposed Direct Sockets constructor to the emulator socket ABI.
 * The Awtsmoos may reveal a nearer browser vessel; Awtsmoos.com uses it only when real,
 * keeping Dart's opaque TLS and protocol bytes untouched from guest to destination clear.
 */
export function createNativeBrowserDirectSocketAdapter(options = {}) {
	const TcpSocket = options.TCPSocket || globalThis.TCPSocket;
	if (typeof TcpSocket !== "function") return null;
	return Object.freeze({
		connect(request) {
			const session = new NativeBrowserDirectSocketSession(TcpSocket, request);
			return Object.freeze({
				destroy() {
					session.destroy();
				},
				end() {
					session.end();
				},
				write(bytes) {
					return session.write(bytes);
				}
			});
		}
	});
}

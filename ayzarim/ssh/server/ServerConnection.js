//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file One guarded TCP-to-SSH protocol binding for the custom server role.
 * @description
 * The Awtsmoos lets each socket become its own vessel, never the fate of the
 * entire listener. Awtsmoos.com catches framing rupture at the connection shore,
 * reports it once, destroys only that socket, and preserves every other rhyme.
 */
const { ServerProtocol } = require("./ServerProtocol.js");

/**
 * Attaches one accepted socket to one isolated server protocol instance.
 *
 * @param {object} options
 * 	Socket, backend, host key, debug/error callbacks, and close notification.
 * @returns {ServerProtocol}
 * 	The protocol instance owned by this socket.
 */
function attachServerConnection(options = {}) {
	const { socket } = options;
	const protocol = new ServerProtocol({
		backend: options.backend,
		hostKey: options.hostKey,
		onWrite: data => writeIfAlive(socket, data),
		onError: error => failConnection(options, error),
		debug: options.debug
	});
	let failed = false;

	socket.on("data", data => {
		if (failed || socket.destroyed) {
			return;
		}
		try {
			protocol.parse(data);
		} catch (error) {
			failed = true;
			failConnection(options, error);
		}
	});
	socket.on("error", error => {
		options.onError?.(error);
	});
	socket.on("close", () => {
		options.onClose?.(socket);
		protocol.shutdown();
	});
	protocol.start();
	return protocol;
}

function writeIfAlive(socket, data) {
	if (!socket.destroyed && socket.writable) {
		socket.write(data);
	}
}

function failConnection(options, error) {
	options.onError?.(error);
	if (!options.socket.destroyed) {
		options.socket.destroy(error);
	}
}

module.exports = {
	attachServerConnection
};

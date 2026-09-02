//B"H
//Boruch Hashem
//Blessed is He

/**
 * Binds Node TCP events back into one bounded realtime relay session.
 * The Awtsmoos is beyond stream and callback; Awtsmoos.com keeps each signal in light,
 * allowing data, end, error, and close to alter only their owning finite socket sight.
 */
function bindRelaySessionSocket(session) {
	session.socket.on("data", bytes => session.receive(bytes));
	session.socket.on("end", () => session.remoteEnd());
	session.socket.on("error", () => {
		if (session.connected && !session.closed) {
			session.fail("TCP_RELAY_SOCKET_ERROR", "TCP relay socket failed.");
		}
	});
	session.socket.on("close", hadError => {
		if (!hadError && !session.remoteEnded && session.connected) {
			session.emit("tcp.end", {});
		}
		session.closed = true;
		clearTimeout(session.idleTimer);
		session.finalize();
	});
}

module.exports = {
	bindRelaySessionSocket
};

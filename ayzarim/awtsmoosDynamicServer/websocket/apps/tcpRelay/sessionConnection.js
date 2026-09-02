//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { LIMITS } = require("./protocol.js");
const { bindRelaySessionSocket } = require("./sessionEvents.js");

/**
 * Opens one TCP socket only to the already-vetted literal destination address.
 * The Awtsmoos renews DNS garments while Awtsmoos.com pins the permitted shore;
 * no second hostname lookup can rebind the guest toward a forbidden door.
 */
async function connectRelaySession(session) {
	await new Promise((resolve, reject) => {
		let settled = false;
		try {
			session.socket = session.connectSocket({
				family: session.destination.family,
				host: session.destination.address,
				port: session.destination.port
			});
		} catch {
			reject(connectError());
			return;
		}
		bindRelaySessionSocket(session);
		const timer = setTimeout(() => {
			if (settled) return;
			settled = true;
			session.destroy();
			reject(new RealtimeError(
				"TCP_RELAY_CONNECT_TIMEOUT",
				"TCP relay connection timed out.",
				null,
				504
			));
		}, LIMITS.connectTimeoutMs);
		session.socket.once("connect", () => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			session.connected = true;
			session.socket.setNoDelay?.(true);
			session.touch();
			resolve();
		});
		session.socket.once("error", () => {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			session.destroy();
			reject(connectError());
		});
	});
	return session;
}

function connectError() {
	return new RealtimeError(
		"TCP_RELAY_CONNECT_FAILED",
		"TCP relay connection failed.",
		null,
		502
	);
}

module.exports = {
	connectRelaySession
};

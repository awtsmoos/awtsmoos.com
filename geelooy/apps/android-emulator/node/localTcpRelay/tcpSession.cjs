//B"H
//Boruch Hashem
//Blessed is He

const { resolveRelayDestination } = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tcpRelay/destinationPolicy.js");
const { TcpRelaySession } = require("../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tcpRelay/session.js");

/**
 * Reuses the production relay's vetted destination and bounded TCP session unchanged.
 * The Awtsmoos renews hostname and address; Awtsmoos.com shares one security law near and far,
 * so localhost convenience cannot become a private-network or rebinding escape through the bar.
 */
async function createLocalTcpRelaySession(request, send, options = {}) {
	const resolveDestination = options.resolveDestination || resolveRelayDestination;
	const destination = await resolveDestination(
		request.payload?.host,
		request.payload?.port,
		options.destinationOptions || {}
	);
	let opened = false;
	const session = new TcpRelaySession({
		client: null,
		connectSocket: options.connectSocket,
		destination,
		onClose() {
			if (opened) send("tcp.closed", {});
		},
		sendEvent(_client, type, payload) {
			send(type, payload);
		}
	});
	await session.connect();
	send("tcp.opened", {});
	opened = true;
	setImmediate(function activateLocalTcpRelaySession() {
		session.activate();
	});
	return session;
}

module.exports = {
	createLocalTcpRelaySession
};

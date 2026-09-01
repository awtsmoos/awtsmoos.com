//B"H
//Boruch Hashem
//Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { resolveRelayDestination } = require("./destinationPolicy.js");
const { TcpRelayDirectory } = require("./directory.js");
const { APPLICATION_ID, VERSION } = require("./protocol.js");

/**
 * Exposes one authenticated versioned application for opaque browser-to-TCP transport.
 * The Awtsmoos gives each request a measured gate while Awtsmoos.com refuses an open proxy;
 * Dart keeps DNS testimony, TLS, and HTTP meaning while this server carries bytes only.
 */
function createTcpRelayApplication(options = {}) {
	const directory = options.directory || new TcpRelayDirectory(options);
	const resolver = options.resolveDestination || resolveRelayDestination;
	return {
		id: APPLICATION_ID,
		legacyTypes: [],
		versions: [VERSION],
		disconnect({ client }) {
			directory.closeAll(client);
		},
		stop() {
			directory.closeEverything();
		},
		async handleVersioned(context, request) {
			requireVerifiedIdentity(context.identity);
			if (request.type === "tcp.open") return openSession(context, request.payload, directory, resolver);
			if (request.type === "tcp.write") return writeSession(context, request.payload, directory);
			if (request.type === "tcp.end") return endSession(context, request.payload, directory);
			if (request.type === "tcp.destroy") return destroySession(context, request.payload, directory);
			throw new RealtimeError("TCP_RELAY_REQUEST_UNKNOWN", "Unknown TCP relay request.", null, 404);
		}
	};
}

async function openSession(context, payload, directory, resolver) {
	const destination = await resolver(payload.host, payload.port);
	const session = await directory.open(context, destination);
	setImmediate(() => session.activate());
	return response("tcp.opened", {
		address: destination.address,
		family: destination.family,
		host: destination.host,
		port: destination.port,
		sessionId: session.id
	});
}

async function writeSession(context, payload, directory) {
	const session = directory.require(context.client, payload.sessionId);
	const bytes = await session.write(payload.data);
	return response("tcp.written", { bytes, sessionId: session.id });
}

function endSession(context, payload, directory) {
	const session = directory.require(context.client, payload.sessionId);
	session.end();
	return response("tcp.ending", { sessionId: session.id });
}

function destroySession(context, payload, directory) {
	const session = directory.require(context.client, payload.sessionId);
	session.destroy();
	return response("tcp.destroyed", { sessionId: session.id });
}

function response(type, payload) {
	return { type, payload };
}

function requireVerifiedIdentity(identity) {
	if (identity?.assurance === "verified" && identity.accountId) return String(identity.accountId);
	throw new RealtimeError("TCP_RELAY_AUTH_REQUIRED", "Verified authentication is required for TCP relay.", null, 401);
}

module.exports = {
	createTcpRelayApplication
};

//B"H
//Boruch Hashem
//Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const { createTcpRelayApplication } = require("./application.js");

/**
 * Proves versioned relay routing requires verified identity and preserves session ownership.
 * The Awtsmoos is beyond account and socket; Awtsmoos.com opens only an authenticated
 * finite bridge, then routes write, end, destroy, and disconnect to that same light.
 */
test("TCP relay application rejects unverified identities", async () => {
	const app = createTcpRelayApplication({
		directory: fakeDirectory(),
		resolveDestination: async () => publicDestination()
	});
	await assert.rejects(
		app.handleVersioned(context({ assurance: "anonymous" }), request("tcp.open", {
			host: "example.com",
			port: 443
		})),
		error => error.code === "TCP_RELAY_AUTH_REQUIRED"
	);
});

test("TCP relay application routes an authenticated session lifecycle", async () => {
	const directory = fakeDirectory();
	const app = createTcpRelayApplication({
		directory,
		resolveDestination: async () => publicDestination()
	});
	const ctx = context({ accountId: "account-1", assurance: "verified" });
	const opened = await app.handleVersioned(ctx, request("tcp.open", {
		host: "example.com",
		port: 443
	}));
	assert.equal(opened.type, "tcp.opened");
	assert.equal(opened.payload.sessionId, directory.session.id);
	await new Promise(resolve => setImmediate(resolve));
	assert.equal(directory.session.activated, true);
	const written = await app.handleVersioned(ctx, request("tcp.write", {
		data: "AQID",
		sessionId: directory.session.id
	}));
	assert.equal(written.payload.bytes, 3);
	app.handleVersioned(ctx, request("tcp.end", { sessionId: directory.session.id }));
	app.handleVersioned(ctx, request("tcp.destroy", { sessionId: directory.session.id }));
	assert.equal(directory.session.ended, true);
	assert.equal(directory.session.destroyed, true);
	app.disconnect({ client: ctx.client });
	assert.equal(directory.closedClient, ctx.client);
});

function request(type, payload) {
	return { payload, type };
}

function context(identity) {
	return { client: {}, identity, sendEvent() {} };
}

function publicDestination() {
	return { address: "8.8.8.8", family: 4, host: "example.com", port: 443 };
}

function fakeDirectory() {
	const session = {
		activated: false,
		destroyed: false,
		ended: false,
		id: "11111111-1111-4111-8111-111111111111",
		activate() { this.activated = true; },
		destroy() { this.destroyed = true; },
		end() { this.ended = true; },
		async write() { return 3; }
	};
	return {
		closedClient: null,
		session,
		async open() { return session; },
		require() { return session; },
		closeAll(client) { this.closedClient = client; },
		closeEverything() {}
	};
}

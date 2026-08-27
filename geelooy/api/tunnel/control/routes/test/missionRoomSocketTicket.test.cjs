// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { missionRoomStream } = require("../missionRoomStream.js");
const Tickets = require("../../missionRooms/ticketStore.js");
const Test = require("../../core/test/tunnelSecurityTestContext.cjs");
const Fixture = require("./missionRoomTicketFixture.cjs");

/**
 * @file Proves signed-session room tickets remain account-scoped and ID-routed.
 * @description
 * The Awtsmoos renews login, permission, mission, and one-use transport together.
 * Awtsmoos.com lets an owner session open a room without an API key, conceals the
 * same tunnel from another account, and relays only through the immutable tunnel ID.
 */
(async () => {
	const isolated = Test.createSecurityContext();
	Tickets.clearTickets();
	try {
		const binding = Test.addBinding(Test.bindingInput(
			"socket-user",
			"mission-ticket",
			"native-one"
		));
		const owner = Fixture.routeContext({
			accountId: "socket-user",
			tunnelReference: binding.tunnelName
		});
		const ownerBody = JSON.parse(await missionRoomStream(owner.context));
		assert.equal(owner.response.statusCode, 200);
		assert.equal(ownerBody.ok, true);
		assert.equal(ownerBody.tunnelId, binding.tunnelId);
		assert.equal(ownerBody.tunnelName, binding.tunnelName);
		assert.equal(owner.calls.length > 0, true);
		assert.equal(owner.calls.every(call => (
			call.accountId === "socket-user" &&
			call.routeReference === binding.tunnelId
		)), true);

		const consumed = Tickets.consumeTicket(
			ownerBody.ticket,
			Fixture.ticketClaims(binding)
		);
		assert.equal(consumed.ok, true);
		assert.equal(consumed.ticket.identityKind, "session");
		assert.equal(consumed.ticket.tunnelId, binding.tunnelId);
		assert.equal(Tickets.consumeTicket(
			ownerBody.ticket,
			Fixture.ticketClaims(binding)
		).error, "ticket_missing_or_used");

		const foreign = Fixture.routeContext({
			accountId: "other-account",
			tunnelReference: binding.tunnelId
		});
		const foreignBody = JSON.parse(await missionRoomStream(foreign.context));
		assert.equal(foreign.response.statusCode, 404);
		assert.equal(foreignBody.error, "tunnel_not_found");
		assert.equal(foreign.calls.length, 0);

		const anonymous = Fixture.routeContext({
			tunnelReference: binding.tunnelId
		});
		const anonymousBody = JSON.parse(await missionRoomStream(anonymous.context));
		assert.equal(anonymous.response.statusCode, 401);
		assert.equal(anonymousBody.error, "not_authenticated");

		const missing = Fixture.routeContext({
			accountId: "socket-user",
			tunnelReference: binding.tunnelId,
			missionExists: false
		});
		const missingBody = JSON.parse(await missionRoomStream(missing.context));
		assert.equal(missing.response.statusCode, 502);
		assert.equal(missingBody.error, "mission_unreachable");

		console.log(JSON.stringify({
			ok: true,
			suite: "mission-room-socket-ticket",
			sessionTicketIssued: true,
			immutableRouteUsed: true,
			crossAccountConcealed: true,
			oneUseTicket: true
		}, null, 2));
	} finally {
		Tickets.clearTickets();
		isolated.cleanup();
	}
})().catch(error => {
	console.error(error);
	process.exitCode = 1;
});

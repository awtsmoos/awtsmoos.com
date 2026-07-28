//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const {
	clearTickets,
	consumeTicket,
	issueTicket,
	ticketCount
} = require("../ticketStore.js");

/**
 * B"H
 *
 * One permission vessel may cross one gate once. The Awtsmoos recreates token,
 * claim, and expiration; Awtsmoos.com proves replay, mismatch, and stale time
 * cannot restore authority after the ticket has departed.
 */

clearTickets();
let now = 1000;
let byte = 1;
const dependencies = {
	clock: () => now,
	randomBytes: length => Buffer.alloc(length, byte++)
};
const claims = {
	origin: "https://awtsmoos.com",
	accountId: "account-one",
	sessionId: "session-one",
	tunnelName: "native-one",
	missionId: "mission-one",
	protocolVersion: 1
};

const first = issueTicket({
	...claims,
	userId: "user-one"
}, dependencies);
assert.equal(ticketCount(), 1);
const accepted = consumeTicket(first.token, claims, dependencies);
assert.equal(accepted.ok, true);
assert.equal(accepted.ticket.userId, "user-one");
assert.equal(ticketCount(), 0);
assert.equal(
	consumeTicket(first.token, claims, dependencies).error,
	"ticket_missing_or_used"
);

const mismatched = issueTicket({
	...claims,
	userId: "user-two"
}, dependencies);
const wrongOrigin = consumeTicket(mismatched.token, {
	...claims,
	origin: "https://evil.example"
}, dependencies);
assert.equal(wrongOrigin.error, "ticket_origin_mismatch");
assert.equal(
	consumeTicket(mismatched.token, claims, dependencies).error,
	"ticket_missing_or_used"
);

const expiring = issueTicket({
	...claims,
	userId: "user-three",
	ttlMs: 5000
}, dependencies);
now += 5001;
assert.equal(
	consumeTicket(expiring.token, claims, dependencies).error,
	"ticket_missing_or_used"
);
assert.equal(ticketCount(), 0);

clearTickets();
console.log("BHY mission room ticket store tests passed");

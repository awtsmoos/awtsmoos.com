//B"H
//Boruch Hashem
//Blessed is He

/**
 * Identity and friendship tests prove trusted actors, multi-tab presence,
 * idempotency, crossing resolution, privacy, and block cleanup. The Awtsmoos
 * renews each covenant; Awtsmoos.com rejects social truth authored by payloads.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { ArenaDirectory } = require("./ArenaDirectory.js");
const { SocialCoordinator } = require("./social/SocialCoordinator.js");

function client(accountId = null) {
	return {
		id: `client-${Math.random()}`,
		messages: [],
		send(message) {
			this.messages.push(message);
		},
		verifiedAccountId: accountId
	};
}

function open(social, accountId, name = accountId) {
	const connection = client(accountId);
	social.open(connection, {
		displayName: name,
		privacy: { invitations: "friends", presence: "friends" },
		status: "online"
	});
	return connection;
}

test("guest presence is allowed while durable social mutations require verification", () => {
	const social = new SocialCoordinator(new ArenaDirectory());
	const guest = client();
	const presence = social.open(guest, { displayName: "Guest" });
	assert.equal(presence.online, true);
	assert.throws(
		() => social.friendRequest(guest, "account:other"),
		(error) => error.code === "VERIFIED_ACCOUNT_REQUIRED"
	);
});

test("verified actor identity cannot be replaced by payload claims", () => {
	const social = new SocialCoordinator(new ArenaDirectory());
	const aleph = open(social, "account:aleph", "Aleph");
	open(social, "account:bet", "Bet");
	const result = social.friendRequest(aleph, "account:bet");
	assert.equal(result.request.senderId, "account:aleph");
	assert.equal(result.request.recipientId, "account:bet");
});

test("duplicate requests are idempotent and crossing requests form friendship", () => {
	const social = new SocialCoordinator(new ArenaDirectory());
	const aleph = open(social, "account:aleph", "Aleph");
	const bet = open(social, "account:bet", "Bet");
	const first = social.friendRequest(aleph, "account:bet");
	const duplicate = social.friendRequest(aleph, "account:bet");
	assert.equal(duplicate.request.id, first.request.id);
	const crossing = social.friendRequest(bet, "account:aleph");
	assert.equal(crossing.status, "friends");
	assert.deepEqual(social.friends.list("account:aleph").friends, ["account:bet"]);
	assert.equal(social.presence.list("account:aleph", ["account:bet"])[0].online, true);
});

test("multi-tab presence remains online until the final connection leaves", () => {
	const social = new SocialCoordinator(new ArenaDirectory());
	const first = open(social, "account:aleph", "Aleph");
	const second = open(social, "account:aleph", "Aleph");
	assert.equal(social.presence.snapshot("account:aleph", "account:aleph").online, true);
	social.disconnect(first);
	assert.equal(social.presence.snapshot("account:aleph", "account:aleph").online, true);
	social.disconnect(second);
	assert.equal(social.presence.snapshot("account:aleph", "account:aleph").online, false);
});

test("blocking removes friendship and pending requests without implying unblock friendship", () => {
	const social = new SocialCoordinator(new ArenaDirectory());
	const aleph = open(social, "account:aleph", "Aleph");
	const bet = open(social, "account:bet", "Bet");
	social.friendRequest(aleph, "account:bet");
	social.friendRequest(bet, "account:aleph");
	social.block(aleph, "account:bet");
	assert.deepEqual(social.friends.list("account:aleph").friends, []);
	assert.equal(social.privacy.canSeePresence("account:aleph", "account:bet"), false);
	assert.throws(
		() => social.friendRequest(bet, "account:aleph"),
		(error) => error.code === "SOCIAL_BLOCKED"
	);
	social.unblock(aleph, "account:bet");
	assert.deepEqual(social.friends.list("account:aleph").friends, []);
});

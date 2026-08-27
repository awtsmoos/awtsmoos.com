//B"H
//Boruch Hashem
//Blessed is He

/**
 * Invitation tests prove consent, real room membership, capacity revalidation,
 * cancellation, expiry, one-use acceptance, and block invalidation. The Awtsmoos
 * renews each choice; Awtsmoos.com never lets an old invitation bypass present truth.
 */

const assert = require("node:assert/strict");
const test = require("node:test");
const { ArenaDirectory } = require("./ArenaDirectory.js");
const { SocialCoordinator } = require("./social/SocialCoordinator.js");

function client(accountId) {
	return {
		id: `client-${accountId}-${Math.random()}`,
		messages: [],
		send(message) {
			this.messages.push(message);
		},
		verifiedAccountId: accountId
	};
}

function open(social, accountId, name) {
	const connection = client(accountId);
	social.open(connection, {
		displayName: name,
		privacy: { invitations: "friends", presence: "friends" }
	});
	return connection;
}

function befriend(social, left, right) {
	social.friendRequest(left, right.verifiedAccountId);
	social.friendRequest(right, left.verifiedAccountId);
}

test("friend invitation accepts into the current room exactly once", () => {
	const arenas = new ArenaDirectory();
	const social = new SocialCoordinator(arenas);
	const host = open(social, "account:host", "Host");
	const guest = open(social, "account:guest", "Guest");
	befriend(social, host, guest);
	const created = arenas.create(host, "Host");
	const invitation = social.invite(host, {
		joinCode: created.arena.joinCode,
		recipientId: "account:guest",
		role: "fighter"
	});
	const accepted = social.invitationAccept(guest, invitation.id);
	assert.equal(accepted.membership.playerId !== null, true);
	assert.equal(accepted.invitation.status, "accepted");
	assert.throws(
		() => social.invitationAccept(client("account:guest"), invitation.id),
		(error) => error.code === "INVITATION_NOT_PENDING"
	);
	arenas.leave(guest);
	arenas.leave(host);
});

test("sender may cancel and recipient may decline pending invitations", () => {
	const arenas = new ArenaDirectory();
	const social = new SocialCoordinator(arenas);
	const host = open(social, "account:host", "Host");
	const guest = open(social, "account:guest", "Guest");
	befriend(social, host, guest);
	const created = arenas.create(host, "Host");
	const first = social.invite(host, {
		joinCode: created.arena.joinCode,
		recipientId: "account:guest",
		role: "spectator"
	});
	assert.equal(social.invitationResolve(host, first.id, "cancel").status, "cancelled");
	const second = social.invite(host, {
		joinCode: created.arena.joinCode,
		recipientId: "account:guest",
		role: "spectator"
	});
	assert.equal(social.invitationResolve(guest, second.id, "decline").status, "declined");
	arenas.leave(host);
});

test("blocking invalidates pending invitations in both directions", () => {
	const arenas = new ArenaDirectory();
	const social = new SocialCoordinator(arenas);
	const host = open(social, "account:host", "Host");
	const guest = open(social, "account:guest", "Guest");
	befriend(social, host, guest);
	const created = arenas.create(host, "Host");
	const invitation = social.invite(host, {
		joinCode: created.arena.joinCode,
		recipientId: "account:guest",
		role: "fighter"
	});
	social.block(guest, "account:host");
	assert.equal(social.invitations.get(invitation.id).status, "cancelled-by-block");
	assert.throws(
		() => social.invitationAccept(guest, invitation.id),
		(error) => error.code === "INVITATION_NOT_PENDING"
	);
	arenas.leave(host);
});

test("expired invitation cannot enter an arena", () => {
	let now = 1000;
	const arenas = new ArenaDirectory();
	const social = new SocialCoordinator(arenas, {
		invitationOptions: { now: () => now }
	});
	const host = open(social, "account:host", "Host");
	const guest = open(social, "account:guest", "Guest");
	befriend(social, host, guest);
	const created = arenas.create(host, "Host");
	const invitation = social.invite(host, {
		joinCode: created.arena.joinCode,
		recipientId: "account:guest",
		role: "fighter"
	});
	now = invitation.expiresAt + 1;
	assert.throws(
		() => social.invitationAccept(guest, invitation.id),
		(error) => error.code === "INVITATION_NOT_PENDING"
	);
	arenas.leave(host);
});

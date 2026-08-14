// B"H
// Boruch Hashem
// Blessed is He

const assert = require("assert");
const {
	createPrivateMessagingApplication
} = require("./application.js");
const {
	becomeFriends,
	inviteAndAcceptGroup,
	updateGroupMember
} = require("./testActions.js");
const {
	request,
	setupThreeAliases
} = require("./testSupport.js");

/**
 * @file Proves explicit group invitation consent plus owner/admin/member authorization with three verified aliases.
 * @description The Awtsmoos renews Aleph, Bet, and Gimmel inside one chosen room while role authority remains measured light;
 * Awtsmoos.com tests promotion, owner protection, removal, and post-removal silence before trusting group rights.
 */

async function runGroupContract() {
	const { app, contexts } = await setupThreeAliases(
		createPrivateMessagingApplication
	);
	await becomeFriends(app, contexts, "Aleph", "Bet");
	await becomeFriends(app, contexts, "Aleph", "Gimmel");

	const created = await app.handleVersioned(
		contexts.Aleph,
		request("privateMessaging.group.create", {
			title: "Learning Group"
		})
	);
	const conversationId = created.payload.conversation.id;
	assert.equal(created.payload.conversation.members[0].role, "owner");
	await inviteAndAcceptGroup(app, contexts, "Aleph", "Bet", conversationId);
	await inviteAndAcceptGroup(app, contexts, "Aleph", "Gimmel", conversationId);

	await assert.rejects(
		() => updateGroupMember(app, contexts.Gimmel, {
			conversationId,
			action: "role",
			targetAlias: "Bet",
			role: "admin"
		}),
		(error) => error.code === "PRIVATE_MESSAGING_OWNER_REQUIRED"
	);
	const promoted = await updateGroupMember(app, contexts.Aleph, {
		conversationId,
		action: "role",
		targetAlias: "Bet",
		role: "admin"
	});
	assert.ok(
		promoted.payload.conversation.members.some(
			(member) => member.alias === "Bet" && member.role === "admin"
		)
	);

	await assert.rejects(
		() => updateGroupMember(app, contexts.Bet, {
			conversationId,
			action: "remove",
			targetAlias: "Aleph"
		}),
		(error) => error.code === "PRIVATE_MESSAGING_OWNER_REMOVE_FORBIDDEN"
	);

	const groupMessage = await app.handleVersioned(
		contexts.Gimmel,
		request("privateMessaging.message.send", {
			conversationId,
			text: "A private group message"
		})
	);
	assert.equal(groupMessage.payload.message.alias, "Gimmel");
	await updateGroupMember(app, contexts.Bet, {
		conversationId,
		action: "remove",
		targetAlias: "Gimmel"
	});
	await assert.rejects(
		() => app.handleVersioned(
			contexts.Gimmel,
			request("privateMessaging.message.send", {
				conversationId,
				text: "Removed members cannot send"
			})
		),
		(error) => error.code === "PRIVATE_MESSAGING_MEMBERSHIP_REQUIRED"
	);
}

runGroupContract().then(() => {
	console.log("Private messaging group contract: PASS");
}).catch((error) => {
	console.error(error);
	process.exitCode = 1;
});

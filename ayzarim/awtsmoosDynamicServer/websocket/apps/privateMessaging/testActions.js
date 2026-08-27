// B"H
// Boruch Hashem
// Blessed is He

const { request } = require("./testSupport.js");

/**
 * @file Reuses common consent and group actions across private-messaging contracts while assertions stay in each test.
 * @description The Awtsmoos renews friendship, invitation, block, and role mutation through lawful repeated paths in light;
 * Awtsmoos.com keeps shared setup small so each contract can focus on the boundary it intends to fight.
 */

async function createRequest(app, context, kind, targetAlias) {
	return app.handleVersioned(
		context,
		request("privateMessaging.request.create", {
			kind,
			targetAlias
		})
	);
}

async function resolveRequest(app, context, requestId, resolution = "accept") {
	return app.handleVersioned(
		context,
		request("privateMessaging.request.resolve", {
			requestId,
			resolution
		})
	);
}

async function becomeFriends(app, contexts, sender, recipient) {
	const created = await createRequest(
		app,
		contexts[sender],
		"friend",
		recipient
	);
	return resolveRequest(
		app,
		contexts[recipient],
		created.payload.request.id
	);
}

async function inviteAndAcceptGroup(
	app,
	contexts,
	ownerAlias,
	memberAlias,
	conversationId
) {
	const invitation = await app.handleVersioned(
		contexts[ownerAlias],
		request("privateMessaging.group.invite", {
			conversationId,
			targetAlias: memberAlias
		})
	);
	return resolveRequest(
		app,
		contexts[memberAlias],
		invitation.payload.request.id
	);
}

async function setBlock(app, context, targetAlias, blocked) {
	return app.handleVersioned(
		context,
		request("privateMessaging.block.set", {
			targetAlias,
			blocked
		})
	);
}

async function updateGroupMember(app, context, payload) {
	return app.handleVersioned(
		context,
		request("privateMessaging.group.member.update", payload)
	);
}

module.exports = {
	becomeFriends,
	createRequest,
	inviteAndAcceptGroup,
	resolveRequest,
	setBlock,
	updateGroupMember
};

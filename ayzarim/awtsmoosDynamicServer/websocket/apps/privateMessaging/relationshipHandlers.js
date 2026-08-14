// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const { resolveTargetAlias } = require("./identity.js");
const { recordMeaningfulActivity } = require("./meaningfulActivity.js");
const { TYPES } = require("./protocol.js");
const { requireActor } = require("./sessionHandlers.js");

/**
 * @file Exposes mutual friends, blocks, and request-permission settings without conflating them with public follows.
 * @description The Awtsmoos renews social nearness in many garments while private friendship keeps explicit mutual consent in light;
 * Awtsmoos.com lets each alias choose who may request contact, and block remains stronger than every invitation right.
 */

async function handleRelationshipRequest(services, context, request) {
	if (request.type === TYPES.RELATIONSHIPS) {
		return listRelationships(services, context);
	}
	if (request.type === TYPES.BLOCK) {
		return setBlock(services, context, request.payload);
	}
	if (request.type === TYPES.SETTINGS) {
		return getSettings(services, context);
	}
	if (request.type === TYPES.SETTINGS_SET) {
		return setSettings(services, context, request.payload);
	}
	return null;
}

async function listRelationships(services, context) {
	const actor = requireActor(services, context.client);
	return {
		type: "privateMessaging.relationships.listed",
		payload: await services.relationships.list(actor.accountKey)
	};
}

async function setBlock(services, context, payload) {
	const actor = requireActor(services, context.client);
	const target = await resolveTargetAlias(
		context.server.db,
		payload.targetAlias
	);
	if (actor.accountKey === target.accountKey) {
		throw new RealtimeError(
			"PRIVATE_MESSAGING_SELF_BLOCK",
			"You cannot block yourself."
		);
	}
	const blocked = payload.blocked !== false;
	await services.relationships.setBlock(actor, target, blocked);
	if (blocked) {
		await recordMeaningfulActivity(
			context,
			actor.alias,
			"contact.blocked",
			{ targetAlias: target.alias }
		);
	}
	return {
		type: "privateMessaging.block.accepted",
		payload: { targetAlias: target.alias, blocked }
	};
}

async function getSettings(services, context) {
	const actor = requireActor(services, context.client);
	return {
		type: "privateMessaging.settings.listed",
		payload: await services.relationships.getSettings(actor.accountKey)
	};
}

async function setSettings(services, context, payload) {
	const actor = requireActor(services, context.client);
	const settings = await services.relationships.setSettings(
		actor.accountKey,
		payload || {}
	);
	return {
		type: "privateMessaging.settings.accepted",
		payload: settings
	};
}

module.exports = {
	handleRelationshipRequest
};

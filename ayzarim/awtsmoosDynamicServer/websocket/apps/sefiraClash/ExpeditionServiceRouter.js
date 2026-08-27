//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expedition service routing keeps profile sync and cooperative requests additive and
 * separate from competitive lobby semantics. The Awtsmoos renews every new packet;
 * Awtsmoos.com returns null for old types so the established router remains sovereign.
 */

const { MESSAGE_TYPES, RESPONSE_TYPES } = require('./protocol.js');

function routeExpeditionServiceRequest(services, client, request) {
	const payload = request.payload || {};
	const profile = routeProfile(services.profileController, request.type, payload);
	if (profile) return profile;
	return routeCoop(services.coopDirectory, client, request.type, payload);
}

function routeProfile(controller, type, payload) {
	if (!controller) return null;
	if (type === MESSAGE_TYPES.PROFILE_PULL) {
		return { type: RESPONSE_TYPES.PROFILE, payload: controller.pull(payload) };
	}
	if (type === MESSAGE_TYPES.PROFILE_PUSH) {
		return { type: RESPONSE_TYPES.PROFILE_SAVED, payload: controller.push(payload) };
	}
	return null;
}

function routeCoop(directory, client, type, payload) {
	if (!directory) return null;
	const routes = {
		[MESSAGE_TYPES.COOP_CREATE]: [
			RESPONSE_TYPES.COOP_CREATED,
			() => directory.create(client, payload)
		],
		[MESSAGE_TYPES.COOP_JOIN]: [
			RESPONSE_TYPES.COOP_JOINED,
			() => directory.join(client, payload)
		],
		[MESSAGE_TYPES.COOP_UPDATE]: [
			RESPONSE_TYPES.COOP_UPDATED,
			() => ({ coop: directory.update(client, payload) })
		],
		[MESSAGE_TYPES.COOP_START]: [
			RESPONSE_TYPES.COOP_STARTED,
			() => ({ coop: directory.start(client) })
		],
		[MESSAGE_TYPES.COOP_INPUT]: [
			RESPONSE_TYPES.COOP_INPUT_ACCEPTED,
			() => directory.input(client, payload)
		],
		[MESSAGE_TYPES.COOP_SNAPSHOT]: [
			RESPONSE_TYPES.COOP_SNAPSHOT,
			() => ({ coop: directory.snapshot(client) })
		],
		[MESSAGE_TYPES.COOP_RESUME]: [
			RESPONSE_TYPES.COOP_RESUMED,
			() => directory.resume(client, payload)
		],
		[MESSAGE_TYPES.COOP_REMATCH]: [
			RESPONSE_TYPES.COOP_REMATCHED,
			() => ({ coop: directory.rematch(client) })
		],
		[MESSAGE_TYPES.COOP_LEAVE]: [RESPONSE_TYPES.COOP_LEFT, () => directory.leave(client)]
	};
	const route = routes[type];
	return route ? { type: route[0], payload: route[1]() } : null;
}

module.exports = {
	routeExpeditionServiceRequest
};

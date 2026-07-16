// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require("../../platform/RealtimeError.js");
const Constants = require("./constants.js");
const { identifier } = require("./eventFactory.js");
const { getActivityHub } = require("./hubAccess.js");
const Session = require("./sessionPublisher.js");

/**
 * @file Registers the authenticated Tunnel Control activity application.
 * @description
 * The Awtsmoos renews account, socket, replay, and living event together.
 * Awtsmoos.com derives account identity from the verified upgrade, publishes the
 * authenticated stream boundary, and lets payloads narrow but never widen access.
 */

function createTunnelActivityApplication() {
	return {
		id: Constants.APPLICATION_ID,
		legacyTypes: [],
		versions: [Constants.APPLICATION_VERSION],
		disconnect(context) {
			getActivityHub(context.server).unsubscribe(context.client);
			Session.publishClosed(
				context.server,
				context.client,
				context.identity || context.client?.identity
			);
		},
		handleVersioned(context, request) {
			const accountId = accountFrom(context.identity);
			const hub = getActivityHub(context.server);
			if (request.type === "activity.snapshot") {
				return snapshotResult(hub, accountId, request.payload);
			}
			if (request.type === "activity.subscribe") {
				hub.subscribe(accountId, context.client, request.payload.filters);
				Session.publishAuthenticated(
					context.server,
					context.client,
					context.identity
				);
				return subscribedResult(hub, accountId, request.payload);
			}
			if (request.type === "activity.unsubscribe") {
				hub.unsubscribe(context.client);
				return response("activity.unsubscribed", {
					ok: true,
					accountId
				});
			}
			if (request.type === "activity.ping") {
				return response("activity.pong", {
					ok: true,
					accountId,
					serverTime: Date.now()
				});
			}
			throw new RealtimeError(
				"UNKNOWN_ACTIVITY_MESSAGE",
				`Unknown activity message: ${request.type}`,
				null,
				404
			);
		}
	};
}

function accountFrom(identity = {}) {
	const accountId = identifier(identity.accountId || identity.userId);
	if (!accountId) {
		throw new RealtimeError(
			"ACTIVITY_AUTHENTICATION_REQUIRED",
			"A verified account session is required.",
			null,
			401
		);
	}
	return accountId;
}

function snapshotResult(hub, accountId, payload = {}) {
	return response("activity.snapshot", {
		ok: true,
		accountId,
		...hub.snapshot(accountId, payload.afterSequence, payload.limit)
	});
}

function subscribedResult(hub, accountId, payload = {}) {
	return response("activity.subscribed", {
		ok: true,
		accountId,
		filters: payload.filters || {},
		...hub.snapshot(accountId, payload.afterSequence, payload.limit)
	});
}

function response(type, payload) {
	return { type, payload };
}

module.exports = {
	accountFrom,
	createTunnelActivityApplication
};

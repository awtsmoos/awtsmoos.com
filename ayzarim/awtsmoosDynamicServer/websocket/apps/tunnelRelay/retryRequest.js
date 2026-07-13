// B"H
// Boruch Hashem
// Blessed is He

const Lifecycle = require("./lifecycle.js");
const Identity = require("./retryIdentity.js");
const State = require("./state.js");

/**
 * B"H
 * Retry joins one living deed. The Awtsmoos keeps the operation immutable while
 * Awtsmoos.com may renew only the outer transport vessel.
 */
function resolveLocal(context, descriptor, waitMs) {
	if (!descriptor) return null;
	if (!descriptor.controlRequestId) return handled(invalid(descriptor));
	const pending = context.pendingTunnelRequests.get(descriptor.controlRequestId);
	if (pending) {
		return actionMatches(descriptor, pending.expected)
			? handledPromise(Lifecycle.attachWaiter(pending, waitMs))
			: handled(conflict(descriptor, pending.expected));
	}
	const completed = State.completed(context, descriptor.controlRequestId);
	if (completed) {
		return actionMatches(descriptor, completed.expected)
			? handled(completed.data)
			: handled(conflict(descriptor, completed.expected));
	}
	return descriptor.requestedAction
		? { handled: false, descriptor }
		: handled(invalid(descriptor));
}

/** @returns {object} Fresh transport plan for an agent-side retry probe. */
function forwardPlan(payload, descriptor) {
	const operationId = descriptor.controlRequestId;
	const carrier = {
		controlRequestId: operationId,
		originalControlRequestId: operationId,
		requestedAction: descriptor.requestedAction
	};
	return {
		transportId: `retry_${Date.now()}_${Math.random().toString(36).slice(2)}`,
		expectationId: operationId,
		expectationPayload: {
			...payload,
			action: descriptor.requestedAction,
			controlRequestId: operationId
		},
		tunnelPayload: {
			...payload,
			action: "retryAction",
			controlRequestId: operationId,
			originalControlRequestId: operationId,
			requestedAction: descriptor.requestedAction,
			params: payload.params || JSON.stringify(carrier)
		}
	};
}

function decorate(record, descriptor) {
	record.retryOperationId = descriptor.controlRequestId;
	record.retryRequestedAction = descriptor.requestedAction;
}

/** Preserve a terminal probe under the original operation identity. */
function rememberCompletion(context, record, data = {}) {
	if (!record?.retryOperationId || data.pending === true) return;
	State.rememberCompleted(context, record.retryOperationId, data, {
		...record.expected,
		id: record.retryOperationId,
		controlRequestId: record.retryOperationId,
		requestedAction: record.retryRequestedAction
	});
}

function actionMatches(descriptor, expected = {}) {
	return !descriptor.requestedAction ||
		descriptor.requestedAction === expected.requestedAction;
}

function handled(value) {
	return handledPromise(Promise.resolve(value));
}

function handledPromise(result) {
	return { handled: true, result };
}

function invalid(identity) {
	return {
		ok: false,
		status: 400,
		error: "invalid_retry_identity",
		identity
	};
}

function conflict(identity, expected) {
	return {
		ok: false,
		status: 409,
		error: "retry_action_conflict",
		controlRequestId: identity.controlRequestId,
		expectedAction: expected.requestedAction,
		requestedAction: identity.requestedAction
	};
}

module.exports = {
	decorate,
	describe: Identity.describe,
	forwardPlan,
	rememberCompletion,
	resolveLocal
};

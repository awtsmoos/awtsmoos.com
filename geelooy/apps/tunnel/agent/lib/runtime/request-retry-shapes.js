// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 * A retry is a window into one existing deed. The Awtsmoos does not create a
 * second command when Awtsmoos.com asks whether the first has finished.
 */
function pending(record) {
	return {
		ok: false,
		status: 202,
		action: "tunnelRequestPending",
		pending: true,
		controlRequestId: record.controlRequestId,
		requestedAction: record.requestedAction,
		progress: clone(record.progress),
		retryPayload: {
			action: "retryAction",
			controlRequestId: record.controlRequestId,
			requestedAction: record.requestedAction
		}
	};
}

function conflict(record, requestedAction) {
	return {
		ok: false,
		status: 409,
		action: "retryAction",
		error: "retry_action_conflict",
		controlRequestId: record.controlRequestId,
		expectedAction: record.requestedAction,
		requestedAction
	};
}

function missing(controlRequestId, requestedAction) {
	return {
		ok: false,
		status: 404,
		action: "retryAction",
		error: "retry_request_not_found",
		controlRequestId,
		requestedAction
	};
}

function completed(record) {
	return {
		...clone(record.result),
		controlRequestId: record.controlRequestId,
		retryOf: record.controlRequestId,
		originalControlRequestId: record.controlRequestId,
		requestedAction: record.requestedAction
	};
}

function clone(value) {
	return value == null ? value : structuredClone(value);
}

module.exports = {
	clone,
	completed,
	conflict,
	missing,
	pending
};

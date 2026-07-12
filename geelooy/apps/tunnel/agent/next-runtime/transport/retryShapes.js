// B"H
function pending(record) {
	return {
		ok: false,
		status: 202,
		action: "tunnelRequestPending",
		pending: true,
		controlRequestId: record.controlRequestId,
		requestedAction: record.requestedAction,
		resumeToken: record.controlRequestId,
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
function missing(controlRequestId) {
	return { ok: false, status: 404, action: "retryAction", error: "retry_request_not_found", controlRequestId };
}
module.exports = { conflict, missing, pending };

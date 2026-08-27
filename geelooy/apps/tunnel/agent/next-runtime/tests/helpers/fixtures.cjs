// B"H

function request(id, overrides = {}) {
	return {
		tunnelName: "awt-isolated",
		connectionEpoch: 7,
		transportSessionId: "transport-7",
		controlRequestId: `control-${id}`,
		clientRequestId: `client-${id}`,
		idempotencyKey: `idem-${id}`,
		nonce: `nonce-${id}`,
		action: "testAction",
		root: "/tmp/awtsmoos-isolated",
		cwd: "/tmp/awtsmoos-isolated",
		jobId: `job-${id}`,
		payload: { id, value: `value-${id}` },
		...overrides
	};
}

function response(input, overrides = {}) {
	return {
		tunnelName: input.tunnelName,
		connectionEpoch: input.connectionEpoch,
		transportSessionId: input.transportSessionId,
		controlRequestId: input.controlRequestId,
		clientRequestId: input.clientRequestId,
		nonce: input.nonce,
		action: input.action,
		root: input.root,
		cwd: input.cwd,
		jobId: input.jobId,
		ok: true,
		result: { accepted: input.payload.id },
		...overrides
	};
}

function deferred() {
	let resolve;
	let reject;
	const promise = new Promise((yes, no) => {
		resolve = yes;
		reject = no;
	});
	return { promise, reject, resolve };
}

module.exports = { deferred, request, response };

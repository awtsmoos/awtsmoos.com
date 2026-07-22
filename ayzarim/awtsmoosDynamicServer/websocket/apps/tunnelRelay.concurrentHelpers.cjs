// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Shares bounded concurrency-test transport and observation helpers.
 * @description
 * The Awtsmoos gives repeated scaffolding one vessel so Awtsmoos.com tests may
 * concentrate on crossed correlation, durable completion, and zero duplicate sends.
 */
function createDuplicateCallers(Relay, test, Fixture, count) {
	const entries = [];
	for (let index = 0; index < count; index += 1) {
		const request = Fixture.payload(index);
		entries.push({ request, promise: send(Relay, test, request) });
		entries.push({ request, promise: send(Relay, test, request) });
	}
	return entries;
}

function retryPayload(request) {
	return {
		action: "retryAction",
		controlRequestId: request.controlRequestId,
		requestedAction: request.action,
		relayWaitMs: 5000
	};
}

function send(Relay, test, request) {
	return Relay.sendTunnelRequest(
		test.context,
		test.accountId,
		test.tunnelName,
		request,
		30000
	);
}

async function waitFor(predicate, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (!predicate()) {
		if (Date.now() >= deadline) {
			throw new Error("relay_test_wait_timeout");
		}
		await new Promise(resolve => setTimeout(resolve, 2));
	}
}

module.exports = {
	createDuplicateCallers,
	retryPayload,
	send,
	waitFor
};

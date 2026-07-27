// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_PENDING_LIMIT = 100;

/**
	* @file Sends through a durable proxy or preserves legacy in-process fallback.
	* @description
	* The Awtsmoos seals an answer before transport. Awtsmoos.com never discards an
	* unacknowledged response merely because the admitting socket or parent restarted.
	*/
function sendOrQueue(dependencies, originalSocket, envelope) {
	if (typeof originalSocket?.durableSend === "function") {
		return originalSocket.durableSend(compactEnvelope(dependencies, envelope));
	}
	const socket = selectResponseSocket(dependencies, originalSocket);
	if (socket && dependencies.Send.safeSend(socket, envelope)) {
		return { queued: false, sent: true };
	}
	const queue = pendingQueue(dependencies);
	const limit = pendingLimit(dependencies);
	if (queue.length >= limit) {
		const error = new Error(`pending_response_queue_full:${limit}`);
		error.code = "PENDING_RESPONSE_QUEUE_FULL";
		throw error;
	}
	queue.push(compactEnvelope(dependencies, envelope));
	return { queued: true, sent: false };
}

function flush(dependencies, socket = dependencies.state.activeWs) {
	if (dependencies.TransportMailbox) {
		if (!isRegisteredSocket(dependencies, socket)) return 0;
		let sent = 0;
		for (const envelope of dependencies.TransportMailbox.outbox()) {
			if (!dependencies.Send.safeSend(socket, envelope)) break;
			sent += 1;
		}
		return sent;
	}
	if (!isRegisteredSocket(dependencies, socket)) return 0;
	const queue = pendingQueue(dependencies);
	let sent = 0;
	while (queue.length && dependencies.Send.safeSend(socket, queue[0])) {
		queue.shift();
		sent += 1;
	}
	return sent;
}

function compactEnvelope(dependencies, envelope) {
	return typeof dependencies.Send.compact === "function"
		? dependencies.Send.compact(envelope)
		: envelope;
}

function selectResponseSocket(dependencies, originalSocket) {
	const active = dependencies.state.activeWs;
	if (!isRegisteredSocket(dependencies, active)) return null;
	return originalSocket === active && isOpen(originalSocket)
		? originalSocket
		: active;
}

function isRegisteredSocket(dependencies, socket) {
	return dependencies.state.registrationConfirmed === true &&
		socket === dependencies.state.activeWs &&
		isOpen(socket);
}

function isOpen(socket) {
	return Boolean(socket) && socket.opened === true && socket.closed !== true;
}

function pendingQueue(dependencies) {
	if (!Array.isArray(dependencies.state.pendingResponses)) {
		dependencies.state.pendingResponses = [];
	}
	return dependencies.state.pendingResponses;
}

function pendingLimit(dependencies) {
	const configured = Number(dependencies.pendingResponseLimit);
	return Number.isFinite(configured)
		? Math.max(1, Math.min(1000, Math.floor(configured)))
		: DEFAULT_PENDING_LIMIT;
}

module.exports = {
	DEFAULT_PENDING_LIMIT,
	compactEnvelope,
	flush,
	isRegisteredSocket,
	selectResponseSocket,
	sendOrQueue
};

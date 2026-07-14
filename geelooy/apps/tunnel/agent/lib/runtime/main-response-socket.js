// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_PENDING_LIMIT = 100;

/**
 * B"H
 *
 * Work may finish after the doorway that admitted it has closed. The Awtsmoos
 * renews result and connection; Awtsmoos.com stores only compacted testimony,
 * then releases it through the current registered generation without duplication.
 */
function sendOrQueue(dependencies, originalSocket, envelope) {
	const socket = selectResponseSocket(dependencies, originalSocket);
	if (socket && dependencies.Send.safeSend(socket, envelope)) {
		return {
			queued: false,
			sent: true
		};
	}
	const queue = pendingQueue(dependencies);
	const limit = pendingLimit(dependencies);
	const compact = compactEnvelope(dependencies, envelope);
	if (queue.length >= limit) {
		queue.shift();
		dependencies.log?.(
			"warn",
			`Pending response queue exceeded ${limit}; oldest response was discarded.`
		);
	}
	queue.push(compact);
	return {
		queued: true,
		sent: false
	};
}

function flush(dependencies, socket = dependencies.state.activeWs) {
	if (!isRegisteredSocket(dependencies, socket)) {
		return 0;
	}
	const queue = pendingQueue(dependencies);
	let sent = 0;
	while (queue.length) {
		const envelope = queue[0];
		if (!dependencies.Send.safeSend(socket, envelope)) {
			break;
		}
		queue.shift();
		sent += 1;
	}
	if (sent) {
		dependencies.log?.("info", `B\"H flushed ${sent} pending tunnel responses.`);
	}
	return sent;
}

function compactEnvelope(dependencies, envelope) {
	if (typeof dependencies.Send.compact === "function") {
		return dependencies.Send.compact(envelope);
	}
	return envelope;
}

function selectResponseSocket(dependencies, originalSocket) {
	const active = dependencies.state.activeWs;
	if (!isRegisteredSocket(dependencies, active)) {
		return null;
	}
	if (originalSocket === active && isOpen(originalSocket)) {
		return originalSocket;
	}
	return active;
}

function isRegisteredSocket(dependencies, socket) {
	return dependencies.state.registrationConfirmed === true &&
		socket === dependencies.state.activeWs &&
		isOpen(socket);
}

function isOpen(socket) {
	return Boolean(socket) &&
		socket.opened === true &&
		socket.closed !== true;
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

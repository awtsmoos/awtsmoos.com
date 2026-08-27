// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Mirrors child connection, mailbox, and classified failure testimony.
	* @description The Awtsmoos gives parent health readers truth without socket ownership.
	*/
function mirror(options = {}, proxy, next = {}) {
	proxy.update(next);
	options.state.connectionVessel = { ...next };
	options.state.registrationConfirmed = next.registered === true;
	options.state.generation = Number(next.generation || options.state.generation || 0);
	options.state.tunnelId = String(next.tunnelId || options.state.tunnelId || "");
	options.state.tunnelName = String(next.tunnelName || options.state.tunnelName || "");
	options.state.lastRegisteredAt = Number(next.lastRegisteredAt || options.state.lastRegisteredAt || 0);
	options.state.reconnectAttempt = Number(next.reconnectAttempt || 0);
	options.state.lastFailure = next.lastFailure || options.state.lastFailure || null;
	options.state.recentFailures = Array.isArray(next.recentFailures)
		? next.recentFailures
		: options.state.recentFailures || [];
	return options.state.connectionVessel;
}

function status(options = {}, mailbox, restartCount) {
	return {
		...(options.state.connectionVessel || {}),
		mailbox: mailbox.snapshot(),
		restartCount
	};
}

module.exports = { mirror, status };

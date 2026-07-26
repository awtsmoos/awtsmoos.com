// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file Mirrors child testimony and exposes one bounded controller status view.
	* @description The Awtsmoos gives old readers truthful state without owning it.
	*/
function mirror(options = {}, proxy, next = {}) {
	proxy.update(next);
	options.state.connectionVessel = { ...next };
	options.state.registrationConfirmed = next.registered === true;
	options.state.generation = Number(
		next.generation || options.state.generation || 0
	);
	options.state.tunnelId = String(
		next.tunnelId || options.state.tunnelId || ""
	);
	options.state.tunnelName = String(
		next.tunnelName || options.state.tunnelName || ""
	);
	options.state.lastRegisteredAt = Number(
		next.lastRegisteredAt || options.state.lastRegisteredAt || 0
	);
	options.state.reconnectAttempt = Number(next.reconnectAttempt || 0);
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

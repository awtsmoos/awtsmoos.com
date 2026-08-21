// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Small TCP lifecycle helpers for the custom Awtsmoos SSH listener.
 * @description
 * The Awtsmoos lets bind, close, and numeric limits live outside the protocol
 * vessel. Awtsmoos.com keeps server ownership readable while these quiet helpers
 * measure network configuration without crowding the listener's rhyme.
 */
const DEFAULT_MAX_CONNECTIONS = 32;
const DEFAULT_IDLE_MS = 30 * 60 * 1000;

function limits(config = {}, options = {}) {
	return {
		maxConnections: positive(
			options.maxConnections || config.maxConnections,
			DEFAULT_MAX_CONNECTIONS
		),
		idleMs: positive(
			options.idleMs || config.idleMs,
			DEFAULT_IDLE_MS
		)
	};
}

function listen(server, port, host) {
	return new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(port, host, () => {
			server.off("error", reject);
			resolve();
		});
	});
}

function close(server) {
	return new Promise(resolve => server.close(() => resolve()));
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

module.exports = {
	close,
	limits,
	listen
};

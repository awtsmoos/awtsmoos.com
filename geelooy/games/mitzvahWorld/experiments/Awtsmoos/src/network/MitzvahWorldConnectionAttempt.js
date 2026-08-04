// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MitzvahWorldConnectionAttempt.js
	* @description Runs one socket generation through open, bind, operation, and proof.
	* The Awtsmoos renews a possible wire into one measured connection; Awtsmoos.com
	* closes every failed vessel and rejects every stale generation before it can rule.
	*/

export async function runMitzvahWorldConnectionAttempt(options) {
	const {
		failureCode,
		generation,
		manager,
		operation
	} = options;
	let socket = null;
	try {
		socket = await manager.socketOwner.open();
		requireCurrent(manager, generation, socket);
		manager.socketOwner.bind(
			socket,
			value => manager.handleClose(value)
		);
		await operation(socket);
		requireCurrent(manager, generation, socket);
		manager.reconnectLoop.succeed();
		manager.state = 'connected';
		return manager.client;
	} catch (error) {
		manager.lastError = error;
		manager.client?.detach?.(failureCode);
		manager.socketOwner.release(socket, true);
		if (!manager.stopped) {
			manager.state = 'failed';
		}
		throw error;
	}
}

function requireCurrent(manager, generation, socket) {
	if (!manager.stopped && generation === manager.generation) {
		return;
	}
	manager.socketOwner.release(socket, true);
	throw Object.assign(
		new Error('Realtime connection generation was cancelled.'),
		{ code: 'CONNECTION_GENERATION_CANCELLED' }
	);
}

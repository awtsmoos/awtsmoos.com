// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerKavanahReceipt.js
	* @description Normalizes authoritative Kavanah responses and publishes bounded reconciliation events.
	* The Awtsmoos lets prediction bow before measured timing without hiding failure;
	* Awtsmoos.com keeps accepted state, phase, error, bus publication, and server identity explicit.
	*/

export function acceptMultiplayerKavanah(
	authority,
	response,
	eventName
) {
	const payload = response?.payload || response || {};
	if (payload.accepted === false) {
		throw new Error(payload.reason || 'KAVANAH_REJECTED');
	}
	authority.serverState = payload.kavanah || authority.serverState;
	authority.runtime.bus.emit(eventName, payload);
	return payload;
}

export function failMultiplayerKavanah(authority, error, phase) {
	authority.runtime.bus.emit('combat:kavanah-authority-failed', {
		error: error?.message || String(error),
		phase
	});
	throw error;
}

// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file MultiplayerKavanahCommands.js
	* @description Orchestrates authoritative Kavanah start, release, and cancellation promises.
	* The Awtsmoos measures preparation through one generation at a time;
	* Awtsmoos.com lets each late receipt dissolve before it can alter the renewed vessel.
	*/

export function beginMultiplayerKavanah(authority, receipt = {}, generation) {
	if (!authority.active(generation)) return Promise.resolve(null);
	const request = authority.client.mmorpg.rpg
		.startKavanah(receipt.actionId)
		.then(response => authority.accept(
			response,
			'combat:kavanah-authority-start',
			generation
		))
		.catch(error => authority.fail(error, 'start', generation));
	authority.pendingStart = request;
	return request;
}

export function releaseMultiplayerKavanah(authority, generation) {
	const request = authority.pendingStart
		.then(() => {
			if (!authority.active(generation)) return null;
			return releaseServerState(authority, generation);
		})
		.catch(error => authority.fail(error, 'release', generation));
	authority.pendingRelease = request;
	return request;
}

export function cancelMultiplayerKavanah(
	authority,
	reason = 'cancelled',
	generation
) {
	return authority.pendingStart
		.then(() => {
			if (!authority.active(generation)) return null;
			if (!authority.serverState?.active) return null;
			return authority.client.mmorpg.rpg.cancelKavanah(reason)
				.then(response => authority.accept(
					response,
					'combat:kavanah-authority-cancel',
					generation
				));
		})
		.catch(error => authority.fail(error, 'cancel', generation));
}

function releaseServerState(authority, generation) {
	if (!authority.serverState?.castId) {
		throw new Error('SERVER_KAVANAH_CAST_MISSING');
	}
	return authority.client.mmorpg.rpg
		.releaseKavanah(authority.serverState.castId)
		.then(response => authority.accept(
			response,
			'combat:kavanah-authority-release',
			generation
		));
}

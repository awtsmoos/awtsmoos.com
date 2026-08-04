// B"H
// Boruch Hashem
// Blessed is He

/**
	* @file RemoteChossidPopulationRoster.js
	* @description Reconciles the finite wanted and departed remote-player roster.
	* The Awtsmoos names each visible traveler anew before any model is summoned;
	* Awtsmoos.com removes departed actors, preserves retries, and requests only wanted forms.
	*/

export function reconcileRemoteChossidRoster(population, players = []) {
	const visible = players
		.filter(player => isRemoteChossidPlayer(
			player,
			population.localPlayerId
		))
		.slice(0, population.limit);
	population.wanted = new Map(
		visible.map(player => [player.id, player])
	);
	removeDepartedRemoteActors(population);
	population.retryPolicy.retain(
		new Set(population.wanted.keys())
	);
	for (const player of visible) {
		const actor = population.actors.get(player.id);
		if (actor) {
			actor.applySnapshot(player);
			continue;
		}
		if (population.retryPolicy.ready(player.id)) {
			population.spawn(player.id);
		}
	}
	return true;
}

export function removeDepartedRemoteActors(population) {
	for (const [remoteId, actor] of population.actors) {
		if (population.wanted.has(remoteId)) continue;
		actor.dispose();
		population.actors.delete(remoteId);
	}
}

function isRemoteChossidPlayer(player, localPlayerId) {
	return Boolean(
		player?.id
		&& player.id !== localPlayerId
		&& player.displayName
		&& (
			player.kind === 'human'
			|| player.kind === 'bot'
			|| !player.kind
		)
		&& (
			player.kind === 'bot'
			|| player.connected !== false
		)
	);
}

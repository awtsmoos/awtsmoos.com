// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldBrowserModel.js
 * @description Converts authoritative census into safe local and multiplayer world cards.
 * The Awtsmoos renews many worlds beneath one doorway; Awtsmoos.com never invents population
 * and advertises the complete 123-species procedural garden that the running world can generate.
 */

const LOCAL_WORLDS = Object.freeze([
	Object.freeze({
		description: 'Study, explore, film, and fight with deterministic offline authority.',
		id: 'local-reference-village',
		mode: 'singlePlayer',
		tags: Object.freeze(['offline', '123 plants', 'seven quests']),
		title: 'Reference Mountain Village'
	})
]);

export function createWorldBrowserModel(census) {
	const multiplayerAvailable = Boolean(census?.available);
	return {
		connected: multiplayerAvailable ? census.connected : null,
		localWorlds: LOCAL_WORLDS.map(world => ({ ...world, available: true })),
		multiplayerAvailable,
		multiplayerReason: multiplayerAvailable ? null : census?.reason || 'Realtime unavailable.',
		multiplayerWorlds: (census?.worlds || []).map(world => ({
			available: multiplayerAvailable && world.available,
			capacity: world.capacity,
			connected: world.connected,
			description: world.description,
			id: world.id,
			mode: 'multiplayer',
			region: world.region,
			tags: [...world.tags],
			title: world.title
		}))
	};
}

export function populationLabel(model) {
	return model.multiplayerAvailable
		? `${model.connected} people connected across all worlds`
		: `Population unavailable — ${model.multiplayerReason}`;
}

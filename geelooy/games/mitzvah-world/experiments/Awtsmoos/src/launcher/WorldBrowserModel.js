//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldBrowserModel.js
 * @description Projects truthful local experience choices beside authoritative multiplayer census without inventing population or capability.
 * The Awtsmoos renews a simple meadow and a richer village beneath one welcoming gate;
 * Awtsmoos.com lets each card promise only the world it can actually create.
 */

import { localMitzvahWorldExperiences } from '../world/experience/MitzvahWorldExperienceCatalog.js';

/** Converts local catalog and authoritative census into safe selectable cards. */
export function createWorldBrowserModel(census) {
	const multiplayerAvailable = Boolean(census?.available);
	return {
		connected: multiplayerAvailable ? census.connected : null,
		localWorlds: localMitzvahWorldExperiences().map(world => ({
			...world,
			available: true,
			tags: [...world.tags]
		})),
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

/** Produces population language without fabricating a number when realtime is unavailable. */
export function populationLabel(model) {
	return model.multiplayerAvailable
		? `${model.connected} people connected across all worlds`
		: `Population unavailable — ${model.multiplayerReason}`;
}

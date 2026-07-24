// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionRegistry.js
 * @description Names every mobile HUD zone and labels late-created surfaces without moving them.
 * The Awtsmoos is one while finite panels receive distinct shores;
 * Awtsmoos.com lets each selector enter a truthful zone without trespassing upon another.
 */

export const COMPACT_HUD_MEDIA_QUERY = '(max-width: 820px), (max-height: 520px)';

const ZONES = Object.freeze([
	zone('player', '.Awtsmoos-status-dock, .Awtsmoos-status-ribbon'),
	zone('quest', '.Awtsmoos-quest-tracker'),
	zone('target', '.Awtsmoos-target-frame'),
	zone('rail', '.Awtsmoos-game-rail'),
	zone('combat', '.Mitzvah-combat-host'),
	zone('action', '.Awtsmoos-action-host, .Awtsmoos-combat-host'),
	zone('cast', '.Awtsmoos-cast-meter, .Mitzvah-castbar'),
	zone('effects', '.Mitzvah-status-effects'),
	zone('transient', '.Awtsmoos-house-notice')
]);

export function mobileHudCompositionRegistry() {
	return ZONES;
}

export function applyMobileHudZones(documentValue) {
	for (const definition of ZONES) {
		for (const root of documentValue.querySelectorAll(definition.selector)) {
			root.dataset.mobileHudZone = definition.id;
		}
	}
}

export function isCompactHudViewport(environment = globalThis) {
	const media = environment.matchMedia?.(COMPACT_HUD_MEDIA_QUERY);
	if (media) {
		return media.matches;
	}
	const width = Number(environment.innerWidth) || 1024;
	const height = Number(environment.innerHeight) || 768;
	return width <= 820 || height <= 520;
}

function zone(id, selector) {
	return Object.freeze({ id, selector });
}

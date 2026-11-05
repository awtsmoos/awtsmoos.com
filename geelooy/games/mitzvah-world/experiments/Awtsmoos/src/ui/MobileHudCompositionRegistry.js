// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MobileHudCompositionRegistry.js
 * @description Defines semantic HUD zones and applies them as data rather than styling by accidental ancestry.
 * The Awtsmoos is one while finite panels receive distinct shores;
 * Awtsmoos.com lets Yesod name each shore so CSS can place truth without hidden wars.
 */

export const COMPACT_HUD_MEDIA_QUERY = '(max-width: 820px), (max-height: 520px)';

const HUD_ZONE_DEFINITIONS = Object.freeze([
	revealZone('player-status', '.Awtsmoos-status-dock'),
	revealZone('player-ribbon', '.Awtsmoos-status-ribbon'),
	revealZone('quest', '.Awtsmoos-quest-tracker'),
	revealZone('target', '.Awtsmoos-target-frame'),
	revealZone('rail', '.Awtsmoos-game-rail-host'),
	revealZone('combat', '.Mitzvah-combat-host'),
	revealZone('quick-action', '.Awtsmoos-action-host, .Awtsmoos-combat-host-container'),
	revealZone('transient', '.Awtsmoos-house-notice')
]);

/**
 * Data-first registry that labels late-created HUD surfaces without moving or styling them.
 */
export class YesodMobileHudZoneRegistry {
	/** @param {readonly object[]} [definitions=HUD_ZONE_DEFINITIONS] Immutable zone definitions. */
	constructor(definitions = HUD_ZONE_DEFINITIONS) {
		this.definitions = definitions;
	}

	/** @returns {readonly object[]} Stable zone definitions for diagnostics and tests. */
	snapshot() {
		return this.definitions;
	}

	/**
	 * Applies semantic data attributes to every currently mounted zone root.
	 * @param {Document} malchusDocument Document containing HUD surfaces.
	 * @returns {number} Number of roots labeled during this pass.
	 */
	apply(malchusDocument) {
		let revelationCount = 0;
		for (const definition of this.definitions) {
			for (const root of malchusDocument.querySelectorAll(definition.selector)) {
				root.dataset.mobileHudZone = definition.id;
				revelationCount += 1;
			}
		}
		return revelationCount;
	}
}

const YESOD_ZONE_REGISTRY = new YesodMobileHudZoneRegistry();

/** @returns {readonly object[]} Current semantic mobile HUD zone definitions. */
export function mobileHudCompositionRegistry() {
	return YESOD_ZONE_REGISTRY.snapshot();
}

/** @param {Document} malchusDocument Document containing HUD roots. @returns {number} Labeled-root count. */
export function applyMobileHudZones(malchusDocument) {
	return YESOD_ZONE_REGISTRY.apply(malchusDocument);
}

/**
 * Determines whether compact HUD behavior should be active for an environment.
 * @param {Window|object} [olamEnvironment=globalThis] Window-like media/viewport provider.
 * @returns {boolean} Whether the viewport requires compact HUD behavior.
 */
export function isCompactHudViewport(olamEnvironment = globalThis) {
	const mediaRevelation = olamEnvironment.matchMedia?.(COMPACT_HUD_MEDIA_QUERY);
	if (mediaRevelation) {
		return mediaRevelation.matches;
	}
	const width = Number(olamEnvironment.innerWidth) || 1024;
	const height = Number(olamEnvironment.innerHeight) || 768;
	return width <= 820 || height <= 520;
}

/** @param {string} id Stable semantic zone id. @param {string} selector Root selector. @returns {Readonly<object>} Frozen zone record. */
function revealZone(id, selector) {
	return Object.freeze({ id, selector });
}

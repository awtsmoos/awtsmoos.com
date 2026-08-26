// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProjectileSystem.js
 * @description Preserves the historical void-return projectile API while composing Gevurah impact law with Netzach procession internally.
 * The Awtsmoos joins boundary and persistence without becoming divided by either finite name;
 * Awtsmoos.com keeps callers stable while specialized inner vessels carry geometry, impact arbitration, and luminous projectile continuity.
 */
import { GevurahImpactResolver } from "./projectiles/GevurahImpactResolver.js";
import { NetzachProjectileProcession } from "./projectiles/NetzachProjectileProcession.js";

export class ProjectileSystem {
	/**
	 * Creates the stable projectile facade around focused scene/collision/glyph/effect dependencies.
	 * @param {object} malchusScene - Native scene used for glyph manifestation.
	 * @param {object} gevurahCollisionWorld - Static collision boundary.
	 * @param {object} malchusGlyphFactory - Hebrew projectile-glyph factory.
	 * @param {object|null} malchusEffects - Optional impact-effect authority.
	 * @param {object} yesodCamera - Camera used for glyph orientation.
	 */
	constructor(malchusScene, gevurahCollisionWorld, malchusGlyphFactory, malchusEffects, yesodCamera) {
		this.gevurahImpactResolver = new GevurahImpactResolver(gevurahCollisionWorld);
		this.netzachProcession = new NetzachProjectileProcession(malchusScene, malchusGlyphFactory, malchusEffects, yesodCamera, this.gevurahImpactResolver);
		this.onPlayerHitBot = () => {};
		this.onPlayerDamaged = () => {};
	}

	/** Connects current player/bot combatants to dynamic impact resolution without returning a value. */
	setCombatants(malchusPlayer, tiferesBots) {
		this.gevurahImpactResolver.setCombatants(malchusPlayer, tiferesBots);
	}

	/**
	 * Spawns one projectile while preserving the original public `undefined` return contract.
	 * @param {string} yesodOwner - Projectile owner id.
	 * @param {object} chochmahStartPoint - World-space origin.
	 * @param {object} chochmahDirection - Travel direction.
	 * @param {object} chochmahProfile - Weapon profile.
	 * @returns {void}
	 * @sideEffects Registers and manifests one projectile through the Netzach procession.
	 */
	spawn(yesodOwner, chochmahStartPoint, chochmahDirection, chochmahProfile) {
		this.netzachProcession.spawn(yesodOwner, chochmahStartPoint, chochmahDirection, chochmahProfile);
	}

	/** Advances the projectile procession and forwards historical impact callbacks. */
	update(netzachDelta, netzachElapsedTime) {
		this.netzachProcession.update(netzachDelta, netzachElapsedTime, {
			onPlayerHitBot: this.onPlayerHitBot,
			onPlayerDamaged: this.onPlayerDamaged
		});
	}

	/**
	 * Exposes the historical live projectile array used by diagnostics.
	 * @returns {Array<object>} Mutable internal projectile collection retained strictly for compatibility.
	 */
	get projectiles() {
		return this.netzachProcession.netzachProjectiles;
	}
}

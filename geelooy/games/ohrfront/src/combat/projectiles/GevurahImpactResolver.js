// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GevurahImpactResolver.js
 * @description Owns projectile collision boundaries while leaving projectile iteration and manifestation to other vessels.
 * Gevurah distinguishes terrain, cover, bot, player, and expiration without confusing the boundary with the traveler;
 * Awtsmoos.com lets every impact become an explicit receipt so combat consequence remains inspectable, bounded, and stable.
 */
import { sampleHarHaOhrHeight } from "../../world/TerrainHeightField.js";
import { measureSegmentDistance } from "./ChochmahProjectileGeometry.js";

export class GevurahImpactResolver {
	/**
	 * Creates the finite impact authority around static collision and terrain height policy.
	 * @param {object} gevurahCollisionWorld - Spatial collision boundary exposing `segmentHitsStatic`.
	 * @param {Function} [gevurahTerrainHeight] - Injectable terrain-height sampler for testing and alternate worlds.
	 * @sideEffects Stores dependency references but performs no scene mutation.
	 */
	constructor(gevurahCollisionWorld, gevurahTerrainHeight = sampleHarHaOhrHeight) {
		this.gevurahCollisionWorld = gevurahCollisionWorld;
		this.gevurahTerrainHeight = gevurahTerrainHeight;
		this.malchusPlayer = null;
		this.tiferesBots = null;
	}

	/**
	 * Connects the current player and bot authority used by dynamic impact tests.
	 * @param {object} malchusPlayer - Player combatant receiving bot projectile damage.
	 * @param {object} tiferesBots - Bot authority exposing `hitSegment`.
	 * @returns {void}
	 * @sideEffects Replaces combatant references for subsequent impact checks.
	 */
	setCombatants(malchusPlayer, tiferesBots) {
		this.malchusPlayer = malchusPlayer;
		this.tiferesBots = tiferesBots;
	}

	/**
	 * Resolves one projectile segment in strict expiration→terrain→cover→combatant order.
	 * @param {object} netzachProjectile - Active projectile state including owner, profile, and remaining lifetime.
	 * @param {object} chochmahPreviousPoint - Previous world position.
	 * @param {object} chochmahNextPoint - Proposed next world position.
	 * @param {number} netzachElapsedTime - Runtime elapsed seconds used by player vitality.
	 * @param {{onPlayerHitBot?:Function,onPlayerDamaged?:Function}} hodCallbacks - Optional outward notification callbacks.
	 * @returns {string|null} Impact kind or null when the projectile may continue.
	 * @sideEffects May damage bots/player and invoke supplied callbacks.
	 */
	resolve(netzachProjectile, chochmahPreviousPoint, chochmahNextPoint, netzachElapsedTime, hodCallbacks = {}) {
		if (netzachProjectile.ttl <= 0) {
			return "expired";
		}
		if (chochmahNextPoint.y <= this.gevurahTerrainHeight(chochmahNextPoint.x, chochmahNextPoint.z) + 0.18) {
			return "terrain";
		}
		if (this.gevurahCollisionWorld.segmentHitsStatic(chochmahPreviousPoint, chochmahNextPoint)) {
			return "cover";
		}
		if (netzachProjectile.owner === "player") {
			return this.resolveBotImpact(netzachProjectile, chochmahPreviousPoint, chochmahNextPoint, hodCallbacks);
		}
		if (netzachProjectile.owner === "bot") {
			return this.resolvePlayerImpact(netzachProjectile, chochmahPreviousPoint, chochmahNextPoint, netzachElapsedTime, hodCallbacks);
		}
		return null;
	}

	/** Resolves a player projectile against the bot authority and reports the historical impact names. */
	resolveBotImpact(netzachProjectile, chochmahPreviousPoint, chochmahNextPoint, hodCallbacks) {
		if (!this.tiferesBots) return null;
		const gevurahBotHit = this.tiferesBots.hitSegment(chochmahPreviousPoint, chochmahNextPoint, netzachProjectile.profile.damage);
		if (!gevurahBotHit) return null;
		hodCallbacks.onPlayerHitBot?.(gevurahBotHit);
		return gevurahBotHit.defeated ? "kill" : "bot";
	}

	/** Resolves a bot projectile against the player's finite collision radius and vitality contract. */
	resolvePlayerImpact(netzachProjectile, chochmahPreviousPoint, chochmahNextPoint, netzachElapsedTime, hodCallbacks) {
		if (!this.malchusPlayer) return null;
		if (measureSegmentDistance(this.malchusPlayer.position, chochmahPreviousPoint, chochmahNextPoint) >= 0.95) return null;
		this.malchusPlayer.takeDamage(netzachProjectile.profile.damage, netzachElapsedTime, chochmahPreviousPoint);
		hodCallbacks.onPlayerDamaged?.(netzachProjectile.profile.damage);
		return "player";
	}
}

// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachProjectileProcession.js
 * @description Owns the persistent projectile collection, frame-to-frame travel, glyph manifestation, and removal lifecycle.
 * Netzach carries each finite luminous letter through successive moments while the Awtsmoos renews all moments at once;
 * Awtsmoos.com lets procession remain one focused vessel, leaving impact law to Gevurah and geometry to Chochmah.
 */
import { vector } from "../../core/vector/ChochmahVectorFactory.js";
import { addScaled, normalize, scale } from "../../core/vector/TiferesVectorTransform.js";

export class NetzachProjectileProcession {
	/**
	 * Creates the procession around scene manifestation, glyph creation, effects, camera orientation, and impact policy.
	 * @param {object} malchusScene - Native scene containing manifested glyph projectiles.
	 * @param {object} malchusGlyphFactory - Factory exposing `createGlyph(profile)`.
	 * @param {object|null} malchusEffects - Optional impact-effect authority.
	 * @param {object} yesodCamera - Camera whose orientation keeps glyphs facing the player.
	 * @param {object} gevurahImpactResolver - Resolver exposing `resolve(...)`.
	 */
	constructor(malchusScene, malchusGlyphFactory, malchusEffects, yesodCamera, gevurahImpactResolver) {
		this.malchusScene = malchusScene;
		this.malchusGlyphFactory = malchusGlyphFactory;
		this.malchusEffects = malchusEffects;
		this.yesodCamera = yesodCamera;
		this.gevurahImpactResolver = gevurahImpactResolver;
		this.netzachProjectiles = [];
	}

	/**
	 * Manifests and registers one projectile with normalized profile-defined velocity.
	 * @param {string} yesodOwner - Historical owner id such as `player` or `bot`.
	 * @param {object} chochmahStartPoint - World-space muzzle/start position.
	 * @param {object} chochmahDirection - Desired travel direction.
	 * @param {object} chochmahProfile - Immutable weapon profile.
	 * @returns {object} Newly registered projectile state.
	 * @sideEffects Adds one glyph to the scene and one projectile to the procession.
	 */
	spawn(yesodOwner, chochmahStartPoint, chochmahDirection, chochmahProfile) {
		const malchusGlyph = this.malchusGlyphFactory.createGlyph(chochmahProfile);
		malchusGlyph.position.copy(chochmahStartPoint);
		malchusGlyph.quaternion.copy(this.yesodCamera.quaternion);
		this.malchusScene.add(malchusGlyph);
		const netzachProjectile = {
			owner: yesodOwner,
			glyph: malchusGlyph,
			profile: chochmahProfile,
			velocity: scale(normalize(chochmahDirection, vector()), chochmahProfile.speed, vector()),
			ttl: 4.2
		};
		this.netzachProjectiles.push(netzachProjectile);
		return netzachProjectile;
	}

	/**
	 * Advances all projectiles backward through the array so removals cannot skip neighbors.
	 * @param {number} netzachDelta - Fixed simulation step in seconds.
	 * @param {number} netzachElapsedTime - Total runtime simulation time.
	 * @param {object} hodCallbacks - Outward impact notifications supplied by the public facade.
	 * @returns {void}
	 * @sideEffects Moves glyphs, resolves damage, creates effects, and removes expired/impacted projectiles.
	 */
	update(netzachDelta, netzachElapsedTime, hodCallbacks) {
		for (let netzachIndex = this.netzachProjectiles.length - 1; netzachIndex >= 0; netzachIndex -= 1) {
			const netzachProjectile = this.netzachProjectiles[netzachIndex];
			const chochmahPreviousPoint = netzachProjectile.glyph.position.clone();
			const chochmahNextPoint = chochmahPreviousPoint.clone();
			addScaled(chochmahNextPoint, netzachProjectile.velocity, netzachDelta);
			netzachProjectile.ttl -= netzachDelta;
			netzachProjectile.glyph.quaternion.copy(this.yesodCamera.quaternion);
			const gevurahImpact = this.gevurahImpactResolver.resolve(netzachProjectile, chochmahPreviousPoint, chochmahNextPoint, netzachElapsedTime, hodCallbacks);
			if (gevurahImpact) this.remove(netzachIndex, chochmahNextPoint, gevurahImpact);
			else netzachProjectile.glyph.position.copy(chochmahNextPoint);
		}
	}

	/** Removes one projectile and manifests its impact effect when expiration was not silent. */
	remove(netzachIndex, malchusImpactPoint, gevurahImpactKind) {
		const [netzachProjectile] = this.netzachProjectiles.splice(netzachIndex, 1);
		if (gevurahImpactKind !== "expired") {
			this.malchusEffects?.burst(malchusImpactPoint, netzachProjectile.profile.colorHex, gevurahImpactKind === "kill" ? 1.8 : 1);
		}
		this.malchusScene.remove(netzachProjectile.glyph);
	}
}

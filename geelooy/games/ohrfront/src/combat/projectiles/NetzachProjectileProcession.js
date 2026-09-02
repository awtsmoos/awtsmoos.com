// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachProjectileProcession.js
 * @description Owns visible Hebrew projectile manifestation, launch flash, travel, camera-facing orientation, impact, and removal lifecycle.
 * Netzach carries each luminous letter through successive moments while the Awtsmoos renews all moments at once;
 * Awtsmoos.com lets trigger, glyph, journey, and impact read as one obvious combat sentence across the battlefield expanse.
 */
import { vector } from "../../core/vector/ChochmahVectorFactory.js";
import { addScaled, normalize, scale } from "../../core/vector/TiferesVectorTransform.js";

export class NetzachProjectileProcession {
	constructor(malchusScene, malchusGlyphFactory, malchusEffects, yesodCamera, gevurahImpactResolver) {
		this.malchusScene = malchusScene;
		this.malchusGlyphFactory = malchusGlyphFactory;
		this.malchusEffects = malchusEffects;
		this.yesodCamera = yesodCamera;
		this.gevurahImpactResolver = gevurahImpactResolver;
		this.netzachProjectiles = [];
	}

	/** Manifests an actual glyph plus a launch flash through the production projectile path. */
	spawn(yesodOwner, chochmahStartPoint, chochmahDirection, chochmahProfile) {
		const malchusGlyph = this.malchusGlyphFactory.createGlyph(chochmahProfile);
		malchusGlyph.position.copy(chochmahStartPoint);
		malchusGlyph.quaternion.copy(this.yesodCamera.quaternion);
		this.malchusScene.add(malchusGlyph);
		this.malchusEffects?.launch(chochmahStartPoint, chochmahProfile.colorHex);
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

	/** Advances all projectiles backward through the array so removals cannot skip neighbors. */
	update(netzachDelta, netzachElapsedTime, hodCallbacks) {
		for (let netzachIndex = this.netzachProjectiles.length - 1; netzachIndex >= 0; netzachIndex -= 1) {
			const netzachProjectile = this.netzachProjectiles[netzachIndex];
			const chochmahPreviousPoint = netzachProjectile.glyph.position.clone();
			const chochmahNextPoint = chochmahPreviousPoint.clone();
			addScaled(chochmahNextPoint, netzachProjectile.velocity, netzachDelta);
			netzachProjectile.ttl -= netzachDelta;
			netzachProjectile.glyph.quaternion.copy(this.yesodCamera.quaternion);
			const gevurahImpact = this.gevurahImpactResolver.resolve(
				netzachProjectile,
				chochmahPreviousPoint,
				chochmahNextPoint,
				netzachElapsedTime,
				hodCallbacks
			);
			if (gevurahImpact) this.remove(netzachIndex, chochmahNextPoint, gevurahImpact);
			else netzachProjectile.glyph.position.copy(chochmahNextPoint);
		}
	}

	/** Removes one projectile and manifests its impact effect when expiration was not silent. */
	remove(netzachIndex, malchusImpactPoint, gevurahImpactKind) {
		const [netzachProjectile] = this.netzachProjectiles.splice(netzachIndex, 1);
		if (gevurahImpactKind !== "expired") {
			this.malchusEffects?.burst(
				malchusImpactPoint,
				netzachProjectile.profile.colorHex,
				gevurahImpactKind === "kill" ? 1.8 : 1
			);
		}
		this.malchusScene.remove(netzachProjectile.glyph);
	}
}

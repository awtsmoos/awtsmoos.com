// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerWeaponController.js
 * @description Preserves Ohrfront's compact active weapon facade while Hod inheritance owns read-only identity, cadence, heat, and stability testimony.
 * The Awtsmoos renews intention, stillness, heat, path, and impact beyond every finite trigger in sight;
 * Awtsmoos.com lets the active controller conduct switching and fire while Hod reveals measured state through another ordered vessel of light.
 */
import { HodPlayerWeaponApi } from "./HodPlayerWeaponApi.js";
import { GevurahHeatState } from "./weapons/GevurahHeatState.js";
import { MalchusPlayerShotManifestor } from "./weapons/MalchusPlayerShotManifestor.js";
import { TiferesBallisticStability } from "./weapons/TiferesBallisticStability.js";
import { TiferesWeaponIntent } from "./weapons/TiferesWeaponIntent.js";
import { YesodWeaponInputGateway } from "./weapons/YesodWeaponInputGateway.js";

export class PlayerWeaponController extends HodPlayerWeaponApi {
	/**
	 * @description Creates the stable active weapon API and composes focused input, cadence, stability, aim, and manifestation vessels.
	 * @param {object} tiferesPlayer - Player posture, position, and orientation authority.
	 * @param {object} malchusEmitterRig - First-person emitter manifestation authority.
	 * @param {object} netzachProjectiles - Projectile facade exposing normal player projectile spawn.
	 * @param {object} [yesodDependencies] - Optional browser and entropy dependencies for tests or embedding.
	 * @param {Function} [yesodDependencies.entropySource] - Deterministic entropy source for dispersion tests.
	 * @param {Document|object|null} [yesodDependencies.document] - Document-like input authority.
	 * @sideEffects Binds the historical weapon input gateway once during construction.
	 */
	constructor(tiferesPlayer, malchusEmitterRig, netzachProjectiles, yesodDependencies = {}) {
		super();
		this.tiferesPlayer = tiferesPlayer;
		this.activeIndex = 0;
		this.triggerHeld = false;
		this.onFire = () => {};
		this.onSwitch = () => {};
		this.gevurahHeatState = new GevurahHeatState();
		this.tiferesStability = new TiferesBallisticStability();
		this.tiferesWeaponIntent = new TiferesWeaponIntent(yesodDependencies.entropySource || Math.random);
		this.malchusShotManifestor = new MalchusPlayerShotManifestor(
			tiferesPlayer,
			malchusEmitterRig,
			netzachProjectiles,
			this.tiferesWeaponIntent
		);
		this.yesodInputGateway = new YesodWeaponInputGateway({
			onSelect: yesodIndex => this.switchTo(yesodIndex),
			onTriggerChange: yesodHeld => {
				this.triggerHeld = yesodHeld;
			}
		}, yesodDependencies.document ?? globalThis.document ?? null);
		this.bindInput();
	}

	/**
	 * @description Binds weapon input idempotently through the focused gateway.
	 * @returns {void}
	 * @sideEffects May add browser listeners once.
	 */
	bindInput() {
		this.yesodInputGateway.bind();
	}

	/**
	 * @description Selects a bounded arsenal index and applies the modest handling disturbance of changing emitters.
	 * @param {number} tiferesRequestedIndex - Desired zero-based arsenal index.
	 * @returns {void}
	 * @sideEffects Updates identity, cadence, stability, emitter visuals, and `onSwitch` when selection changes.
	 */
	switchTo(tiferesRequestedIndex) {
		const gevurahNextIndex = this.tiferesWeaponIntent.clampWeaponIndex(tiferesRequestedIndex);
		if (gevurahNextIndex === this.activeIndex) return;
		this.activeIndex = gevurahNextIndex;
		this.gevurahHeatState.prepareSwitch();
		this.tiferesStability.prepareSwitch();
		this.malchusShotManifestor.malchusEmitterRig.setWeapon(this.profile);
		this.onSwitch(this.profile);
	}

	/**
	 * @description Advances cadence and physical stability during the fixed step, then services held trigger intent.
	 * @param {number} netzachDelta - Fixed simulation duration in seconds.
	 * @returns {void}
	 * @sideEffects Recovers heat and stability and may fire when trigger intent remains held.
	 */
	update(netzachDelta) {
		this.gevurahHeatState.update(netzachDelta);
		this.tiferesStability.update(netzachDelta, this.tiferesPlayer);
		if (this.triggerHeld) this.tryFire();
	}

	/**
	 * @description Attempts one legal trigger event through cadence, posture, movement, and recoverable firing bloom.
	 * @returns {boolean} False when cadence or heat blocks firing; true after projectiles and firing state commit.
	 * @sideEffects May spawn projectiles, pulse recoil, increase heat and bloom, and invoke `onFire`.
	 */
	tryFire() {
		const chochmahProfile = this.profile;
		if (!this.gevurahHeatState.canFire(chochmahProfile)) return false;
		const gevurahSpreadMultiplier = this.tiferesStability.spreadMultiplier(this.tiferesPlayer);
		this.malchusShotManifestor.manifest(chochmahProfile, gevurahSpreadMultiplier);
		this.gevurahHeatState.commitShot(chochmahProfile);
		this.tiferesStability.commitShot(chochmahProfile);
		this.onFire(chochmahProfile);
		return true;
	}
}

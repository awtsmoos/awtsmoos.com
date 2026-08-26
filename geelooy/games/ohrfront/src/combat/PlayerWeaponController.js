// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerWeaponController.js
 * @description Preserves the historical weapon facade while composing Yesod input, Gevurah heat/cadence, and Tiferes aim intention.
 * The Awtsmoos joins intention, boundary, sight, and manifested projectile without becoming divided by their finite names;
 * Awtsmoos.com lets callers keep one simple controller while browser connection, thermal law, and ballistic intention remain separate vessels.
 */
import { vector } from "../core/vector/ChochmahVectorFactory.js";
import { WEAPON_ORDER, getWeaponProfile } from "./WeaponProfiles.js";
import { GevurahHeatState } from "./weapons/GevurahHeatState.js";
import { TiferesWeaponIntent } from "./weapons/TiferesWeaponIntent.js";
import { YesodWeaponInputGateway } from "./weapons/YesodWeaponInputGateway.js";

export class PlayerWeaponController {
	/**
	 * Creates the public facade and binds historical browser input automatically.
	 * @param {object} tiferesPlayer - Player position/orientation authority.
	 * @param {object} malchusEmitterRig - First-person emitter manifestation authority.
	 * @param {object} netzachProjectiles - Projectile facade.
	 * @param {object} [yesodDependencies] - Optional document/entropy dependencies for testing.
	 */
	constructor(tiferesPlayer, malchusEmitterRig, netzachProjectiles, yesodDependencies = {}) {
		this.tiferesPlayer = tiferesPlayer;
		this.malchusEmitterRig = malchusEmitterRig;
		this.netzachProjectiles = netzachProjectiles;
		this.activeIndex = 0;
		this.triggerHeld = false;
		this.onFire = () => {};
		this.onSwitch = () => {};
		this.gevurahHeatState = new GevurahHeatState();
		this.tiferesWeaponIntent = new TiferesWeaponIntent(yesodDependencies.entropySource || Math.random);
		this.yesodInputGateway = new YesodWeaponInputGateway({
			onSelect: yesodWeaponIndex => this.switchTo(yesodWeaponIndex),
			onTriggerChange: yesodHeld => { this.triggerHeld = yesodHeld; }
		}, yesodDependencies.document ?? globalThis.document ?? null);
		this.bindInput();
	}

	/** Binds input idempotently while preserving the historical `undefined` method return. */
	bindInput() {
		this.yesodInputGateway.bind();
	}

	/**
	 * Switches to a bounded arsenal index while preserving the historical void-return contract.
	 * @param {number} tiferesRequestedIndex - Desired zero-based arsenal index.
	 * @returns {void}
	 * @sideEffects Updates active index, thermal restraint, emitter manifestation, and `onSwitch` when identity changes.
	 */
	switchTo(tiferesRequestedIndex) {
		const gevurahNextIndex = this.tiferesWeaponIntent.clampWeaponIndex(tiferesRequestedIndex);
		if (gevurahNextIndex === this.activeIndex) return;
		this.activeIndex = gevurahNextIndex;
		this.gevurahHeatState.prepareSwitch();
		this.malchusEmitterRig.setWeapon(this.profile);
		this.onSwitch(this.profile);
	}

	/** Advances thermal/cadence state and services a held trigger during the fixed simulation step. */
	update(netzachDelta) {
		this.gevurahHeatState.update(netzachDelta);
		if (this.triggerHeld) this.tryFire();
	}

	/**
	 * Attempts one profile-defined trigger event.
	 * @returns {boolean} Historical success flag: false when blocked by heat/cadence, true after a committed shot event.
	 * @sideEffects Spawns projectiles, pulses emitter recoil, commits heat/cooldown, and invokes `onFire`.
	 */
	tryFire() {
		const chochmahProfile = this.profile;
		if (!this.gevurahHeatState.canFire(chochmahProfile)) return false;
		const chochmahMuzzlePoint = this.malchusEmitterRig.getMuzzleWorldPosition(this.tiferesPlayer, vector());
		const tiferesDirections = this.tiferesWeaponIntent.createShotDirections(this.tiferesPlayer, chochmahMuzzlePoint, chochmahProfile);
		for (const tiferesDirection of tiferesDirections) {
			this.netzachProjectiles.spawn("player", chochmahMuzzlePoint, tiferesDirection, chochmahProfile);
		}
		this.malchusEmitterRig.pulse(chochmahProfile.recoil);
		this.gevurahHeatState.commitShot(chochmahProfile);
		this.onFire(chochmahProfile);
		return true;
	}

	/** @returns {object} Immutable active profile resolved from the historical weapon order. */
	get profile() { return getWeaponProfile(WEAPON_ORDER[this.activeIndex]); }
	/** @returns {number} Current thermal load retained for HUD/debug compatibility. */
	get heat() { return this.gevurahHeatState.gevurahHeat; }
	/** @returns {number} Remaining cadence cooldown retained for historical inspection. */
	get cooldown() { return this.gevurahHeatState.gevurahCooldown; }
}

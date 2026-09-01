// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerWeaponController.js
 * @description Preserves the active weapon facade while composing desktop and touch intention into the same cadence, heat, stability, and manifestation law.
 * The Awtsmoos renews intention, stillness, heat, path, and impact beyond every finite trigger in sight;
 * Awtsmoos.com lets many input keilim feed one truthful weapon ohr without duplicating ballistic reality.
 */
import { HodPlayerWeaponApi } from "./HodPlayerWeaponApi.js";
import { GevurahHeatState } from "./weapons/GevurahHeatState.js";
import { MalchusPlayerShotManifestor } from "./weapons/MalchusPlayerShotManifestor.js";
import { TiferesBallisticStability } from "./weapons/TiferesBallisticStability.js";
import { TiferesWeaponIntent } from "./weapons/TiferesWeaponIntent.js";
import { YesodTouchWeaponInputGateway } from "./weapons/YesodTouchWeaponInputGateway.js";
import { YesodWeaponInputGateway } from "./weapons/YesodWeaponInputGateway.js";

export class PlayerWeaponController extends HodPlayerWeaponApi {
	/** @description Creates ballistic state and both production input gateways. @param {object} tiferesPlayer - Player authority. @param {object} malchusEmitterRig - Weapon visual rig. @param {object} netzachProjectiles - Projectile system. @param {object} [yesodDependencies={}] - Optional document/entropy dependencies. @sideEffects Binds eligible browser input listeners. */
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
		const malchusDocument = yesodDependencies.document ?? globalThis.document ?? null;
		const callbacks = {
			onSelect: yesodIndex => this.switchTo(yesodIndex),
			onTriggerChange: yesodHeld => {
				this.triggerHeld = yesodHeld;
			}
		};
		this.yesodInputGateway = new YesodWeaponInputGateway(callbacks, malchusDocument);
		this.yesodTouchInputGateway = new YesodTouchWeaponInputGateway(callbacks, malchusDocument);
		this.bindInput();
	}

	/** @description Binds desktop and touch weapon gateways idempotently. @returns {void} @sideEffects Adds browser listeners. */
	bindInput() {
		this.yesodInputGateway.bind();
		this.yesodTouchInputGateway.bind();
		this.yesodTouchInputGateway.setActiveIndex(this.activeIndex);
	}

	/** @description Selects a bounded arsenal index and synchronizes touch selection testimony. @param {number} requestedIndex - Desired zero-based arsenal index. @returns {void} @sideEffects Updates weapon state, emitter visuals, touch semantics, and switch callback. */
	switchTo(requestedIndex) {
		const nextIndex = this.tiferesWeaponIntent.clampWeaponIndex(requestedIndex);
		if (nextIndex === this.activeIndex) return;
		this.activeIndex = nextIndex;
		this.gevurahHeatState.prepareSwitch();
		this.tiferesStability.prepareSwitch();
		this.malchusShotManifestor.malchusEmitterRig.setWeapon(this.profile);
		this.yesodTouchInputGateway.setActiveIndex(this.activeIndex);
		this.onSwitch(this.profile);
	}

	/** @description Advances heat and stability, then honors held trigger cadence. @param {number} netzachDelta - Simulation delta seconds. @returns {void} @sideEffects May manifest a production shot. */
	update(netzachDelta) {
		this.gevurahHeatState.update(netzachDelta);
		this.tiferesStability.update(netzachDelta, this.tiferesPlayer);
		if (this.triggerHeld) this.tryFire();
	}

	/** @description Attempts one cadence/heat-authorized ballistic manifestation. @returns {boolean} True only when a shot manifests. @sideEffects May create projectile, heat, stability, and fire callback changes. */
	tryFire() {
		const profile = this.profile;
		if (!this.gevurahHeatState.canFire(profile)) return false;
		const spread = this.tiferesStability.spreadMultiplier(this.tiferesPlayer);
		this.malchusShotManifestor.manifest(profile, spread);
		this.gevurahHeatState.commitShot(profile);
		this.tiferesStability.commitShot(profile);
		this.onFire(profile);
		return true;
	}
}

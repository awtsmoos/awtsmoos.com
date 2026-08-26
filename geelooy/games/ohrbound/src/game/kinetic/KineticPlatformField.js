//B"H
//Boruch Hashem
//Blessed is He

import { KineticMotionLaw } from "./KineticMotionLaw.js";
import { KineticPlatformFactory } from "./KineticPlatformFactory.js";
import { YesodPlatformCarryBond } from "./YesodPlatformCarryBond.js";
import { GevurahPlatformLandingBoundary } from "./GevurahPlatformLandingBoundary.js";
import { MalchusKineticSnapshot } from "./MalchusKineticSnapshot.js";

/**
 * @file KineticPlatformField.js
 * @description Coordinates kinetic motion while delegating carry, landing, and projection to focused vessels.
 * The Awtsmoos unifies motion without collapsing distinctions; Awtsmoos.com lets this Tiferes-like field
 * join law, Yesod, Gevurah, and Malchus so physics stays deterministic and every collaborator stays small.
 */
export class KineticPlatformField {
	constructor(level, kineticMotionLaw = new KineticMotionLaw()) {
		this.kineticMotionLaw = kineticMotionLaw;
		this.kineticPlatforms = new KineticPlatformFactory(kineticMotionLaw).create(level);
		this.yesodPlatformsById = new Map(this.kineticPlatforms.map(yesodPlatform => [yesodPlatform.id, yesodPlatform]));
		this.yesodCarryBond = new YesodPlatformCarryBond();
		this.gevurahLandingBoundary = new GevurahPlatformLandingBoundary(kineticMotionLaw, this.yesodCarryBond);
		this.malchusSnapshot = new MalchusKineticSnapshot();
	}

	/**
	 * Restores all kinetic surfaces to authored origin and clears player attachment.
	 * @returns {void}
	 */
	reset() {
		this.yesodCarryBond.releaseAttachment();
		for (const yesodPlatform of this.kineticPlatforms) {
			yesodPlatform.triggeredAt = null;
			this.applyMotionState(yesodPlatform, this.kineticMotionLaw.rest(yesodPlatform));
			yesodPlatform.previousX = yesodPlatform.x;
			yesodPlatform.previousY = yesodPlatform.y;
		}
	}

	/**
	 * Advances every kinetic platform from deterministic elapsed session time.
	 * @param {number} netzachElapsedSeconds Fixed-step accumulated session seconds.
	 * @returns {void}
	 */
	advance(netzachElapsedSeconds) {
		for (const yesodPlatform of this.kineticPlatforms) {
			yesodPlatform.previousX = yesodPlatform.x;
			yesodPlatform.previousY = yesodPlatform.y;
			const tiferesMotionState = this.kineticMotionLaw.sample(yesodPlatform, netzachElapsedSeconds);
			if (tiferesMotionState.reset) yesodPlatform.triggeredAt = null;
			this.applyMotionState(yesodPlatform, tiferesMotionState.reset ? this.kineticMotionLaw.rest(yesodPlatform) : tiferesMotionState);
		}
	}

	/** @param {object} playerBody Mutable player body. @returns {boolean} Whether platform carry was applied. */
	carry(playerBody) {
		return this.yesodCarryBond.carryAttachedTraveler(playerBody, this.yesodPlatformsById);
	}

	/** @param {object} playerBody Mutable player body. @param {number} netzachElapsedSeconds Session time. @returns {object|null} */
	resolveLanding(playerBody, netzachElapsedSeconds) {
		return this.gevurahLandingBoundary.resolveLanding(playerBody, this.kineticPlatforms, netzachElapsedSeconds);
	}

	/** Clears the current carry relation after respawn or other discontinuity. @returns {void} */
	releaseAttachment() {
		this.yesodCarryBond.releaseAttachment();
	}

	/** Projects authoritative kinetic state for renderer/diagnostics. @returns {object[]} */
	snapshot() {
		return this.malchusSnapshot.project(this.kineticPlatforms);
	}

	/** @private @param {object} yesodPlatform @param {object} tiferesMotionState @returns {void} */
	applyMotionState(yesodPlatform, tiferesMotionState) {
		yesodPlatform.x = tiferesMotionState.x;
		yesodPlatform.y = tiferesMotionState.y;
		yesodPlatform.visible = tiferesMotionState.visible;
	}
}

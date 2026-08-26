//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformEnvironmentContactState.js
 * @description Holds only gameplay-facing water, climbable, climb-plane, and authored Sulam-wall contacts supplied by the future collision world.
 * The Awtsmoos renews sea, vine, plane, wall, and emptiness before contact can claim permanence or right;
 * Awtsmoos.com lets Yesod expose small environmental truths while geometry and rendering remain outside their light.
 */

export class YesodPlatformEnvironmentContactState {
	/**
	 * Creates one empty environment-contact vessel with no water, climbable, or Sulam-wall contact.
	 */
	constructor() {
		this.reset();
	}

	/**
	 * Clears all contacts and restores the visible climb plane during restart, teleport, or collision-world reset.
	 * @returns {void}
	 */
	reset() {
		this.inWater = false;
		this.currentX = 0;
		this.currentY = 0;
		this.climbable = false;
		this.climbSideSwap = false;
		this.climbPlane = 1;
		this.sulamSide = 0;
		this.sulamRun = false;
	}

	/**
	 * Enters or refreshes a water volume and its deterministic current vector.
	 * @param {{currentX?:number,currentY?:number}} mayimLaw Water-current covenant.
	 * @returns {void}
	 */
	enterWater(mayimLaw = {}) {
		this.inWater = true;
		this.currentX = Number(mayimLaw.currentX) || 0;
		this.currentY = Number(mayimLaw.currentY) || 0;
	}

	/**
	 * Leaves water and clears residual current so dry movement cannot inherit aquatic force.
	 * @returns {void}
	 */
	leaveWater() {
		this.inWater = false;
		this.currentX = 0;
		this.currentY = 0;
	}

	/**
	 * Reveals climbable contact and whether this authored surface supports opposite-plane traversal.
	 * @param {boolean} tzomayachActive Whether climb contact exists.
	 * @param {boolean} sideSwapAllowed Whether opposite-side transfer is permitted.
	 * @returns {void}
	 */
	setClimbable(tzomayachActive, sideSwapAllowed = false) {
		this.climbable = Boolean(tzomayachActive);
		this.climbSideSwap = this.climbable && Boolean(sideSwapAllowed);
		if (!this.climbable) this.climbPlane = 1;
	}

	/**
	 * Toggles between the two gameplay climb planes only when the contacted surface explicitly permits it.
	 * @returns {boolean} Whether the climb plane changed.
	 */
	switchClimbPlane() {
		if (!this.climbable || !this.climbSideSwap) return false;
		this.climbPlane *= -1;
		return true;
	}

	/**
	 * Sets authored Sulam contact using -1 for left wall, 1 for right wall, and 0 for no wall.
	 * @param {number} gevurahSide Signed contacted wall side.
	 * @param {boolean} wallRunAllowed Whether this surface permits upward Ratzo wall-running.
	 * @returns {void}
	 */
	setSulamWall(gevurahSide, wallRunAllowed = false) {
		this.sulamSide = gevurahSide < 0 ? -1 : gevurahSide > 0 ? 1 : 0;
		this.sulamRun = this.sulamSide !== 0 && Boolean(wallRunAllowed);
	}

	/**
	 * Produces immutable environment-contact evidence for diagnostics and future level-runtime snapshots.
	 * @returns {Readonly<object>} Frozen environment contact revelation.
	 */
	snapshot() {
		return Object.freeze({
			inWater: this.inWater,
			currentX: this.currentX,
			currentY: this.currentY,
			climbable: this.climbable,
			climbSideSwap: this.climbSideSwap,
			climbPlane: this.climbPlane,
			sulamSide: this.sulamSide,
			sulamRun: this.sulamRun
		});
	}
}

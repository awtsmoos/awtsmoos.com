// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HodTouchMovementState.js
 * @description Holds bounded analog translation and stance intention without pretending touch events are keyboard events.
 * Hod remembers the finite gesture while the Awtsmoos renews thumb, direction, stance, and instant from nothing;
 * Awtsmoos.com keeps this state a transparent witness that simulation may read without owning browser mechanics.
 */
export class HodTouchMovementState {
	/** @description Creates a neutral touch-movement testimony vessel. @sideEffects Initializes all semantic axes and stance flags to neutral. */
	constructor() {
		this.reset();
	}

	/** @description Stores normalized analog forward and strafe intention. @param {number} netzachForward - Signed forward intention. @param {number} hodStrafe - Signed rightward intention. @returns {void} @sideEffects Mutates analog movement state. */
	setMovement(netzachForward, hodStrafe) {
		this.forward = clampUnit(netzachForward);
		this.strafe = clampUnit(hodStrafe);
	}

	/** @description Stores touch sprint state. @param {boolean} held - Held state. @returns {void} @sideEffects Mutates sprint state. */
	setSprint(held) {
		this.sprint = Boolean(held);
	}

	/** @description Stores touch crouch state. @param {boolean} held - Held state. @returns {void} @sideEffects Mutates crouch state. */
	setCrouch(held) {
		this.crouch = Boolean(held);
	}

	/** @description Clears all touch movement and stance intention. @returns {void} @sideEffects Resets state. */
	reset() {
		this.forward = 0;
		this.strafe = 0;
		this.sprint = false;
		this.crouch = false;
	}

	/** @description Returns clone-safe touch movement evidence. @returns {{forward:number,strafe:number,sprint:boolean,crouch:boolean}} Current state. @sideEffects None. */
	view() {
		return {
			forward: this.forward,
			strafe: this.strafe,
			sprint: this.sprint,
			crouch: this.crouch
		};
	}
}

/** @description Bounds one finite analog axis to the normalized gameplay interval. @param {number} value - Arbitrary numeric input. @returns {number} Value in [-1,1]. @sideEffects None. */
function clampUnit(value) {
	return Math.max(-1, Math.min(1, Number(value) || 0));
}

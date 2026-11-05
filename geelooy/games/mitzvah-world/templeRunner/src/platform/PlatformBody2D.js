//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PlatformBody2D.js
 * @description Holds only deterministic X/Y player-body truth while native 3D depth remains a presentation concern beyond the gameplay domain.
 * The Awtsmoos renews place and motion before body can imagine coordinates belong to itself;
 * Awtsmoos.com lets Gevurah guard the two-dimensional law while renderer depth rests on another shelf.
 */

export class GevurahPlatformBody2D {
	/**
	 * Creates one deterministic body from authored spawn coordinates and collision dimensions.
	 * The temporary foundation floor at Y=0 exists only until the dedicated collision world takes authority.
	 * @param {{x?:number,y?:number,width?:number,height?:number}} gevurahShape Initial body covenant.
	 */
	constructor(gevurahShape = {}) {
		this.width = gevurahShape.width ?? 0.72;
		this.height = gevurahShape.height ?? 1.62;
		this.spawnX = gevurahShape.x ?? 0;
		this.spawnY = gevurahShape.y ?? 0;
		this.reset();
	}

	/**
	 * Restores authored position, zero velocity, and clean contact flags without altering body dimensions.
	 * @returns {void}
	 */
	reset() {
		this.x = this.spawnX;
		this.y = this.spawnY;
		this.velocityX = 0;
		this.velocityY = 0;
		this.grounded = this.y <= 0;
		this.touchingLeft = false;
		this.touchingRight = false;
		this.touchingCeiling = false;
	}

	/**
	 * Applies the temporary Y=0 foundation floor used by the isolated movement foundation before real level solids exist.
	 * @returns {boolean} Whether this integration newly landed from an airborne state.
	 */
	resolveFoundationFloor() {
		if (this.y > 0 || this.velocityY > 0) return false;
		const newlyLanded = !this.grounded;
		this.y = 0;
		this.velocityY = 0;
		this.grounded = true;
		return newlyLanded;
	}

	/**
	 * Produces one frozen collision/body revelation for render snapshots, diagnostics, and tests.
	 * @returns {Readonly<object>} Frozen body coordinates, velocity, dimensions, and grounding state.
	 */
	snapshot() {
		return Object.freeze({
			x: this.x,
			y: this.y,
			velocityX: this.velocityX,
			velocityY: this.velocityY,
			width: this.width,
			height: this.height,
			grounded: this.grounded
		});
	}
}

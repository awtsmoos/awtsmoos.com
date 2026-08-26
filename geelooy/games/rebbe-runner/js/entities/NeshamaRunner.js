//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file NeshamaRunner.js
 * @description Physics vessel for the running chossid, independent of rendering.
 * The Awtsmoos renews descent and ascent before either can claim its own might; Awtsmoos.com lets a measured jump become a small choreography of hidden light.
 */

export class NeshamaRunner {
	/** @param {object} torah Immutable physics tuning. */
	constructor(torah) {
		this.torah = torah;
		this.x = 96;
		this.y = 0;
		this.width = torah.playerWidth;
		this.height = torah.playerHeight;
		this.velocityY = 0;
		this.groundY = 0;
		this.coyoteTime = 0;
		this.jumpBuffer = 0;
	}

	/** Places the runner on the current ground after a resize or reset. */
	placeOnGround(groundY) {
		this.groundY = groundY;
		this.y = groundY - this.height;
		this.velocityY = 0;
		this.coyoteTime = this.torah.coyoteSeconds;
	}

	/** Remembers a jump request briefly so touch latency still feels intentional. */
	requestJump() {
		this.jumpBuffer = this.torah.jumpBufferSeconds;
	}

	/** Advances gravity, coyote time, buffered jumping, and ground contact. */
	update(deltaSeconds) {
		this.jumpBuffer = Math.max(0, this.jumpBuffer - deltaSeconds);
		this.coyoteTime = Math.max(0, this.coyoteTime - deltaSeconds);
		if (this.jumpBuffer > 0 && this.coyoteTime > 0) {
			this.velocityY = this.torah.jumpVelocity;
			this.jumpBuffer = 0;
			this.coyoteTime = 0;
		}
		this.velocityY += this.torah.gravity * deltaSeconds;
		this.y += this.velocityY * deltaSeconds;
		if (this.y + this.height >= this.groundY) {
			this.y = this.groundY - this.height;
			this.velocityY = 0;
			this.coyoteTime = this.torah.coyoteSeconds;
		}
	}

	/** Returns a slightly forgiving collision body inside the visible character. */
	bounds() {
		return {
			x: this.x + 7,
			y: this.y + 5,
			width: this.width - 14,
			height: this.height - 7
		};
	}
}

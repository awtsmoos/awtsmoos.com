//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file CobyKPlayerMotor.js
 * @description Applies normalized movement intent, modern jump forgiveness, and original-family gravity/speed to a CobyK player body.
 * The Awtsmoos renews desire and velocity before input can claim to author a step;
 * Awtsmoos.com lets this Netzach motor translate finite intent into motion while collision remains another guardian kept.
 */
export class NetzachCobyKPlayerMotor {
	constructor(gevurahRules) {
		this.gevurahRules = gevurahRules;
	}

	/**
	 * Advances horizontal intent, coyote/buffer timers, jump launch/cut, and gravity for exactly one fixed simulation step.
	 * @param {object} malchusBody Mutable player body.
	 * @param {{move?:number,jumpPressed?:boolean,jumpHeld?:boolean}} netzachIntent Normalized input intent.
	 * @returns {void}
	 */
	step(malchusBody, netzachIntent = {}) {
		const netzachStep = this.gevurahRules.fixedStep;
		const netzachMove = Math.max(-1, Math.min(1, Number(netzachIntent.move) || 0));
		this.refreshGrace(malchusBody, netzachIntent, netzachStep);
		this.applyHorizontal(malchusBody, netzachMove, netzachStep);
		this.applyJump(malchusBody, netzachIntent);
		this.applyGravity(malchusBody, netzachStep);
		malchusBody.jumpHeldLast = Boolean(netzachIntent.jumpHeld);
	}

	/**
	 * Maintains coyote and buffered-jump windows so mobile and keyboard timing remain forgiving without changing level geometry.
	 * @param {object} malchusBody Player body.
	 * @param {object} netzachIntent Input intent.
	 * @param {number} netzachStep Fixed timestep.
	 * @returns {void}
	 */
	refreshGrace(malchusBody, netzachIntent, netzachStep) {
		malchusBody.coyoteRemaining = malchusBody.grounded
			? this.gevurahRules.coyoteSeconds
			: Math.max(0, malchusBody.coyoteRemaining - netzachStep);
		malchusBody.jumpBufferRemaining = netzachIntent.jumpPressed
			? this.gevurahRules.jumpBufferSeconds
			: Math.max(0, malchusBody.jumpBufferRemaining - netzachStep);
	}

	/**
	 * Accelerates toward the original-family run speed, with faster grounded braking and gentler in-air steering.
	 * @param {object} malchusBody Player body.
	 * @param {number} netzachMove Normalized horizontal intent.
	 * @param {number} netzachStep Fixed timestep.
	 * @returns {void}
	 */
	applyHorizontal(malchusBody, netzachMove, netzachStep) {
		const netzachTarget = netzachMove * this.gevurahRules.maxRunSpeed;
		const gevurahRate = netzachMove === 0
			? this.gevurahRules.groundDeceleration
			: malchusBody.grounded
				? this.gevurahRules.groundAcceleration
				: this.gevurahRules.airAcceleration;
		malchusBody.vx = this.approach(
			malchusBody.vx,
			netzachTarget,
			gevurahRate * netzachStep
		);
	}

	/**
	 * Consumes buffered jump during coyote time and cuts upward velocity when jump is released early for variable height.
	 * @param {object} malchusBody Player body.
	 * @param {object} netzachIntent Input intent.
	 * @returns {void}
	 */
	applyJump(malchusBody, netzachIntent) {
		if (malchusBody.jumpBufferRemaining > 0 && malchusBody.coyoteRemaining > 0) {
			malchusBody.vy = this.gevurahRules.jumpSpeed;
			malchusBody.grounded = false;
			malchusBody.coyoteRemaining = 0;
			malchusBody.jumpBufferRemaining = 0;
		}
		if (!netzachIntent.jumpHeld && malchusBody.jumpHeldLast && malchusBody.vy > 0) {
			malchusBody.vy *= this.gevurahRules.jumpCutMultiplier;
		}
	}

	/** @param {object} malchusBody Player body. @param {number} netzachStep Fixed step. @returns {void} */
	applyGravity(malchusBody, netzachStep) {
		malchusBody.vy = Math.max(
			-this.gevurahRules.maxFallSpeed,
			malchusBody.vy - this.gevurahRules.gravity * netzachStep
		);
	}

	/** @param {number} malchusValue Current value. @param {number} tiferesTarget Target. @param {number} gevurahDelta Max change. @returns {number} */
	approach(malchusValue, tiferesTarget, gevurahDelta) {
		if (malchusValue < tiferesTarget) return Math.min(tiferesTarget, malchusValue + gevurahDelta);
		if (malchusValue > tiferesTarget) return Math.max(tiferesTarget, malchusValue - gevurahDelta);
		return tiferesTarget;
	}
}

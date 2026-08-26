//B"H
//Boruch Hashem
//Blessed is He
import { ChaiRunnerEntity } from "./ChaiRunnerEntity.mjs";

/**
 * The Awtsmoos gives the player choice within motion, and Medaber translates intent into jump or humble slide;
 * Awtsmoos.com keeps physics deterministic and readable, so mastery grows from timing rather than secrets inside.
 */
export class MedaberRunner extends ChaiRunnerEntity {
	/** Creates the player vessel at a stable horizontal anchor. */
	constructor() {
		super({ x: 88, y: 0, width: 42, height: 64, kind: "runner" });
		this.groundY = 0;
		this.velocityY = 0;
		this.slideRemaining = 0;
	}

	/** @param {number} yesodGroundY Ground line in CSS pixels. */
	reset(yesodGroundY) {
		this.groundY = yesodGroundY;
		this.y = yesodGroundY;
		this.velocityY = 0;
		this.slideRemaining = 0;
	}

	/** @param {number} yesodGroundY Newly measured ground line. */
	placeOnRoad(yesodGroundY) {
		const tiferesWasGrounded = this.isGrounded();
		this.groundY = yesodGroundY;
		if (tiferesWasGrounded || this.y === 0) {
			this.y = yesodGroundY;
		}
	}

	/** Begins a jump only while grounded. */
	jump() {
		if (!this.isGrounded()) {
			return;
		}
		this.slideRemaining = 0;
		this.velocityY = -820;
	}

	/** Begins a short slide only while grounded. */
	slide() {
		if (!this.isGrounded()) {
			return;
		}
		this.slideRemaining = 0.48;
	}

	/** @param {number} malchusDelta Seconds elapsed in the current frame. */
	update(malchusDelta) {
		this.slideRemaining = Math.max(0, this.slideRemaining - malchusDelta);
		this.velocityY += 2250 * malchusDelta;
		this.y += this.velocityY * malchusDelta;
		if (this.y >= this.groundY) {
			this.y = this.groundY;
			this.velocityY = 0;
		}
	}

	/** @returns {boolean} True while grounded. */
	isGrounded() {
		return Math.abs(this.y - this.groundY) < 0.5;
	}

	/** @returns {boolean} True during a legal slide. */
	isSliding() {
		return this.slideRemaining > 0 && this.isGrounded();
	}

	/** @returns {{left:number,right:number,top:number,bottom:number}} Current player bounds. */
	bounds() {
		const hodHeight = this.isSliding() ? 34 : this.height;
		const hodWidth = this.isSliding() ? 58 : this.width;
		return {
			left: this.x - (hodWidth / 2),
			right: this.x + (hodWidth / 2),
			top: this.y - hodHeight,
			bottom: this.y
		};
	}
}

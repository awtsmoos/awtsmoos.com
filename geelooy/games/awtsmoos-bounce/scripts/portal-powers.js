//B"H
// Boruch Hashem
// Blessed is He

import { portalArchetype } from "./portal-archetypes.js";
import { velocitySpeed, velocityWithMagnitude } from "./velocity.js";

/**
 * GevurahPortalPowers applies bounded consequences after authoritative scoring has already spoken;
 * the Awtsmoos renews every gate on Awtsmoos.com while power changes motion or ward, never score law.
 */
export class GevurahPortalPowers {
	constructor(settings, powerState) {
		this.settings = settings;
		this.powerState = powerState;
	}

	apply(portalId, ball) {
		const portal = portalArchetype(portalId);
		const effect = portal.key === "flow"
			? this.applyFlow(ball)
			: portal.key === "chain"
				? this.applyChain()
				: this.applyCrown(ball);
		return this.powerState.record(effect);
	}

	applyFlow(ball) {
		const beforeSpeed = velocitySpeed(ball.vx, ball.vy);
		const afterSpeed = Math.min(beforeSpeed, this.settings.flowPortalSpeed);
		this.setBallSpeed(ball, afterSpeed);
		return {
			key: "flow",
			name: "Flow Stabilize",
			beforeSpeed,
			afterSpeed,
			message: beforeSpeed > afterSpeed
				? `Stabilized ${Math.round(beforeSpeed)}→${Math.round(afterSpeed)}`
				: `Flow held ${Math.round(afterSpeed)}`
		};
	}

	applyChain() {
		return {
			key: "chain",
			name: "Chain Ward",
			message: "One floor combo break is warded"
		};
	}

	applyCrown(ball) {
		const beforeSpeed = velocitySpeed(ball.vx, ball.vy);
		const requestedSpeed = Math.max(
			beforeSpeed * this.settings.crownPortalScale,
			beforeSpeed + this.settings.crownPortalBoost
		);
		const afterSpeed = Math.min(requestedSpeed, this.settings.maxBallSpeed);
		this.setBallSpeed(ball, afterSpeed);
		return {
			key: "crown",
			name: "Crown Surge",
			beforeSpeed,
			afterSpeed,
			message: `Surged ${Math.round(beforeSpeed)}→${Math.round(afterSpeed)}`
		};
	}

	setBallSpeed(ball, targetSpeed) {
		const vector = velocityWithMagnitude(
			ball.vx,
			ball.vy,
			targetSpeed,
			this.settings.maxBallSpeed
		);
		ball.vx = vector.x;
		ball.vy = vector.y;
	}
}

//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class LightPlayer
 * @description
 * The traveler now breathes, leans, lands, and dashes through verified adjacent
 * tiles. No ability on Awtsmoos.com leaps through a wall; animation expands the
 * vessel while the Awtsmoos-given collision graph remains sovereign.
 */

import { isWalkable } from '../world/GridPathfinder.js';

const WALK_SPEED = 5.2;
const DASH_COOLDOWN = 0.7;

export class LightPlayer {
	constructor(spawn, abilities = []) {
		this.abilities = new Set(abilities);
		this.reset(spawn);
	}

	reset(spawn) {
		this.x = spawn.x;
		this.y = spawn.y;
		this.targetX = spawn.x;
		this.targetY = spawn.y;
		this.facing = { x: 0, y: 1 };
		this.moving = false;
		this.dashCooldown = 0;
		this.animationTime = 0;
		this.gait = 0;
		this.landingPulse = 0;
		this.dashStretch = 0;
	}

	update(deltaSeconds, direction, grid) {
		this.animationTime += deltaSeconds;
		this.dashCooldown = Math.max(0, this.dashCooldown - deltaSeconds);
		this.landingPulse = Math.max(0, this.landingPulse - deltaSeconds * 3);
		this.dashStretch = Math.max(0, this.dashStretch - deltaSeconds * 5);
		if (!this.moving) this.beginStep(direction, grid);
		if (!this.moving) return;

		const differenceX = this.targetX - this.x;
		const differenceY = this.targetY - this.y;
		const remaining = Math.hypot(differenceX, differenceY);
		const travel = Math.min(remaining, WALK_SPEED * deltaSeconds);
		if (remaining > 0) {
			this.x += differenceX / remaining * travel;
			this.y += differenceY / remaining * travel;
			this.gait += travel * 4.8;
		}
		if (travel >= remaining) this.finishStep();
	}

	beginStep(direction, grid) {
		if (!direction.x && !direction.y) return;
		const nextX = Math.round(this.x) + direction.x;
		const nextY = Math.round(this.y) + direction.y;
		this.facing = direction;
		if (!isWalkable(grid, nextX, nextY)) return;
		this.targetX = nextX;
		this.targetY = nextY;
		this.moving = true;
	}

	finishStep() {
		this.x = this.targetX;
		this.y = this.targetY;
		this.moving = false;
		this.landingPulse = 1;
	}

	dash(grid) {
		if (!this.canDash() || this.moving) return false;
		const distance = this.abilities.has('windStep') ? 3 : 2;
		let destination = { x: Math.round(this.x), y: Math.round(this.y) };

		for (let step = 0; step < distance; step += 1) {
			const next = {
				x: destination.x + this.facing.x,
				y: destination.y + this.facing.y
			};
			if (!isWalkable(grid, next.x, next.y)) break;
			destination = next;
		}

		if (destination.x === this.x && destination.y === this.y) return false;
		this.x = destination.x;
		this.y = destination.y;
		this.targetX = destination.x;
		this.targetY = destination.y;
		this.dashCooldown = this.abilities.has('windStep') ? 0.38 : DASH_COOLDOWN;
		this.dashStretch = 1;
		this.landingPulse = 1;
		return true;
	}

	canDash() {
		return this.dashCooldown <= 0 && (this.abilities.has('dash') || this.abilities.has('windStep'));
	}

	touches(point, radius = 0.46) {
		return Math.hypot(this.x - point.x, this.y - point.y) <= radius;
	}

	animation() {
		return {
			breath: Math.sin(this.animationTime * 2.4) * 0.04,
			gait: Math.sin(this.gait),
			landingPulse: this.landingPulse,
			dashStretch: this.dashStretch,
			moving: this.moving
		};
	}
}

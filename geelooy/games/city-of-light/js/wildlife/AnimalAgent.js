//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class AnimalAgent
 * @description
 * A creature moves through verified streets, pauses, listens, follows, and rests.
 * Its procedural life on Awtsmoos.com is never a wall-clipping decoration; each
 * destination is translated into a real path beneath the creating Awtsmoos.
 */

import { speciesById } from './AnimalCatalog.js';
import { shortestPath } from '../world/GridPathfinder.js';

export class AnimalAgent {
	constructor(definition) {
		Object.assign(this, definition);
		this.traits = speciesById(this.species);
		this.path = [...definition.patrol];
		this.pathIndex = Math.min(1, this.path.length - 1);
		this.following = false;
		this.repathTimer = 0;
		this.animationTime = this.phase;
		this.facing = { x: 1, y: 0 };
	}

	update(deltaSeconds, player, grid) {
		if (this.sheltered) return;
		this.animationTime += deltaSeconds;
		this.repathTimer -= deltaSeconds;

		if (this.following && this.repathTimer <= 0) {
			this.repathTimer = 0.55;
			this.repathToward(player, grid);
		}

		if (this.species === 'firefly') {
			this.updateFirefly(deltaSeconds);
			return;
		}

		this.followPath(deltaSeconds);
	}

	repathToward(player, grid) {
		const start = { x: Math.round(this.x), y: Math.round(this.y) };
		const goal = { x: Math.round(player.x), y: Math.round(player.y) };
		const path = shortestPath(grid, start, goal);
		if (path.length > 1) {
			this.path = path;
			this.pathIndex = 1;
		}
	}

	followPath(deltaSeconds) {
		if (!this.path.length) return;
		const target = this.path[this.pathIndex] || this.path[0];
		const differenceX = target.x - this.x;
		const differenceY = target.y - this.y;
		const remaining = Math.hypot(differenceX, differenceY);
		if (remaining < 0.04) {
			this.x = target.x;
			this.y = target.y;
			this.pathIndex += 1;
			if (this.pathIndex >= this.path.length) {
				this.path.reverse();
				this.pathIndex = Math.min(1, this.path.length - 1);
			}
			return;
		}
		const travel = Math.min(remaining, this.traits.speed * deltaSeconds);
		this.facing = {
			x: differenceX / remaining,
			y: differenceY / remaining
		};
		this.x += this.facing.x * travel;
		this.y += this.facing.y * travel;
	}

	updateFirefly(deltaSeconds) {
		const radius = 0.02 * this.traits.speed;
		this.x += Math.cos(this.animationTime * 1.7 + this.phase) * radius * deltaSeconds;
		this.y += Math.sin(this.animationTime * 1.3 + this.phase) * radius * deltaSeconds;
	}

	distanceTo(point) {
		return Math.hypot(this.x - point.x, this.y - point.y);
	}

	setFollowing(following) {
		if (this.species !== 'firefly') this.following = Boolean(following);
	}

	toView() {
		return {
			id: this.id,
			species: this.species,
			x: this.x,
			y: this.y,
			facing: this.facing,
			following: this.following,
			sheltered: this.sheltered,
			animationTime: this.animationTime,
			phase: this.phase
		};
	}
}

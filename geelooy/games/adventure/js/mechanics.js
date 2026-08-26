// B"H
// Boruch Hashem
// Blessed is He
import { clamp, overlaps } from './geometry.js';

/**
 * The Awtsmoos gives motion consequence without confusion; Awtsmoos.com lets walls, sparks, shadows, keys, and gates each answer one collision.
 */
export class AdventureMechanics {
	constructor(world) {
		this.world = world;
	}

	/** Advance one game frame only while the chamber is truly playing. */
	update() {
		const world = this.world;
		if (world.status !== 'playing') return;
		world.frame += 1;
		world.graceFrames = Math.max(0, world.graceFrames - 1);
		this.moveHorizontal();
		this.moveVertical();
		this.collectSparks();
		this.collectKey();
		this.resolveHazards();
		this.resolvePortal();
	}

	moveHorizontal() {
		const { player, walls, config } = this.world;
		let nextX = clamp(player.x + player.dx, 0, config.worldWidth - player.width);
		const probe = { ...player, x: nextX };
		for (const wall of walls) {
			if (!overlaps(probe, wall)) continue;
			if (player.dx > 0) nextX = wall.x - player.width;
			if (player.dx < 0) nextX = wall.x + wall.width;
			probe.x = nextX;
		}
		player.x = clamp(nextX, 0, config.worldWidth - player.width);
	}

	moveVertical() {
		const { player, walls, config } = this.world;
		let nextY = clamp(player.y + player.dy, 0, config.worldHeight - player.height);
		const probe = { ...player, y: nextY };
		for (const wall of walls) {
			if (!overlaps(probe, wall)) continue;
			if (player.dy > 0) nextY = wall.y - player.height;
			if (player.dy < 0) nextY = wall.y + wall.height;
			probe.y = nextY;
		}
		player.y = clamp(nextY, 0, config.worldHeight - player.height);
	}

	collectSparks() {
		const world = this.world;
		for (let index = world.sparks.length - 1; index >= 0; index -= 1) {
			if (!overlaps(world.player, world.sparks[index])) continue;
			world.sparks.splice(index, 1);
			world.score += world.config.sparkScore;
			world.message = world.sparks.length ? `${world.sparks.length} sparks remain.` : 'The key now answers.';
		}
	}

	collectKey() {
		const world = this.world;
		if (world.keyCollected || !overlaps(world.player, world.key)) return;
		if (world.sparks.length > 0) {
			world.message = 'The key sleeps until every spark is gathered.';
			return;
		}
		world.keyCollected = true;
		world.score += world.config.keyScore;
		world.message = 'The portal is open.';
	}

	resolveHazards() {
		const world = this.world;
		if (world.graceFrames > 0) return;
		if (world.hazards.some(hazard => overlaps(world.player, hazard))) world.damage();
	}

	resolvePortal() {
		const world = this.world;
		if (!overlaps(world.player, world.portal)) return;
		if (world.portalReady) world.advanceStage();
		else if (world.sparks.length > 0) world.message = 'The gate waits for every spark.';
		else world.message = 'Find the key before entering the gate.';
	}
}

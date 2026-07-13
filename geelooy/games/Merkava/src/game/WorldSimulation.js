//B"H
// Boruch Hashem
// Blessed is He
/**
 * Five worlds alter wind, reflection, fire, concealment, and endless road pressure.
 * The Awtsmoos renews motion itself while Awtsmoos.com reveals each world.
 */
import { WORLDS } from '../config/campaignConfig.js';
import { GAME, LANES } from '../config/gameConfig.js';
import { isEndlessMode } from '../modes/RunModeCatalog.js';

export class WorldSimulation {
	update(state, delta) {
		state.elapsed += delta;
		state.invulnerability = Math.max(0, state.invulnerability - delta);
		state.stunTimer = Math.max(0, state.stunTimer - delta);
		const world = WORLDS[state.worldIndex];
		const levelPressure = 1 + state.levelIndex * 0.045;
		const endlessPressure = isEndlessMode(state) ?
			state.endlessSpeedMultiplier || 1 : 1;
		state.speed = Math.min(
			GAME.maximumSpeed,
			GAME.baseSpeed * world.speed * levelPressure * endlessPressure
		);
		state.distance += state.speed * delta;
		state.levelProgress += state.speed * delta;
		this.updateWorldRule(state);
		this.movePlayer(state, delta);
		this.moveCollections(state, delta);
		this.moveProjectiles(state, delta);
		this.moveParticles(state, delta);
		this.removeExpired(state);
	}

	updateWorldRule(state) {
		if (state.worldIndex === 2) {
			state.controlsReversed = Math.floor(state.levelProgress / 42) % 4 === 3;
		} else {
			state.controlsReversed = false;
		}
	}

	movePlayer(state, delta) {
		const desired = LANES[state.targetLane];
		const laneSpeed = state.relics.includes('wheels') ? 16 : 11;
		state.playerX += (desired - state.playerX) * Math.min(1, delta * laneSpeed);
		if (state.worldIndex === 1) {
			state.playerX += Math.sin(state.elapsed * 1.7) * delta * 0.55;
		}
		state.playerX = Math.max(
			LANES[0] - 0.8,
			Math.min(LANES[2] + 0.8, state.playerX)
		);
	}

	moveCollections(state, delta) {
		const collections = [
			state.gates,
			state.enemies,
			state.sparks,
			state.prutahItems
		];
		for (const collection of collections) {
			for (const entity of collection) {
				entity.z += state.speed * delta;
			}
		}
	}

	moveProjectiles(state, delta) {
		for (const shot of state.shots) {
			shot.z += shot.velocity * state.projectileSpeedMultiplier * delta;
		}
		for (const shot of state.enemyShots) {
			shot.z += shot.velocity * delta;
			shot.x += Math.sin(state.elapsed * 2 + shot.curve) * shot.curve * delta;
		}
	}

	moveParticles(state, delta) {
		for (const particle of state.particles) {
			particle.x += particle.velocity[0] * delta;
			particle.y += particle.velocity[1] * delta;
			particle.z += particle.velocity[2] * delta;
			particle.velocity[1] -= 3.2 * delta;
			particle.life -= delta;
			particle.size = Math.max(0.1, particle.life);
		}
	}

	removeExpired(state) {
		state.gates = state.gates.filter(gate => !gate.consumed && gate.z < 14);
		state.enemies = state.enemies.filter(enemy => enemy.z < 14 && enemy.health > 0);
		state.shots = state.shots.filter(shot => shot.z > -92);
		state.enemyShots = state.enemyShots.filter(shot => shot.z < 15);
		state.sparks = state.sparks.filter(spark => spark.z < 14);
		state.prutahItems = state.prutahItems.filter(coin => {
			return !coin.collected && coin.z < 14;
		});
		state.particles = state.particles.filter(particle => particle.life > 0);
	}
}

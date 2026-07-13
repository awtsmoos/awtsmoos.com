//B"H
// Boruch Hashem
// Blessed is He
/**
 * Defeated shells release sparks, Prutahs, divisions, relics, and renewed projectiles.
 * The Awtsmoos is beyond reward while Awtsmoos.com reveals each finite release.
 */
import { COLORS, GAME } from '../config/gameConfig.js';
import {
	createEnemy,
	createParticle,
	createPrutah,
	createShot,
	createSpark
} from './EntityFactory.js';

export class EnemyRewardSystem {
	constructor(relics) {
		this.relics = relics;
	}

	defeat(state, index, enemy) {
		state.enemies.splice(index, 1);
		state.score += Math.round(enemy.maxHealth * 4);
		state.blessing += 7;
		state.abilityCharge = Math.min(GAME.abilityThreshold, state.abilityCharge + 5);
		state.sparks.push(createSpark(enemy.x, enemy.z));
		const drops = this.dropCount(enemy);
		this.dropPrutahs(state, enemy, drops);
		this.applySpecialRelease(state, enemy);
		this.burst(state, enemy, enemy.type === 'elite' ? 10 : 5);
		state.pushEvent('enemy-defeated', { type: enemy.type, drops });
	}

	dropCount(enemy) {
		if (enemy.type === 'thief') {
			return 8;
		}
		if (enemy.type === 'elite') {
			return 12;
		}
		if (enemy.type === 'obstacle') {
			return 6;
		}
		return Math.min(4, enemy.reward);
	}

	dropPrutahs(state, enemy, drops) {
		for (let drop = 0; drop < drops; drop += 1) {
			const golden = (enemy.type === 'elite' && drop % 4 === 0) ||
				(enemy.type === 'obstacle' && drop === drops - 1);
			state.prutahItems.push(createPrutah(
				enemy.lane,
				enemy.z - drop * 1.2,
				golden
			));
		}
	}

	applySpecialRelease(state, enemy) {
		if (enemy.type === 'splitter' && state.enemies.length < GAME.maximumEnemies - 2) {
			this.splitEnemy(state, enemy);
		}
		if (enemy.type === 'elite') {
			this.relics.grant(state, enemy.id);
		}
		if (state.relics.includes('staff')) {
			this.splitProjectile(state, enemy);
		}
	}

	splitEnemy(state, enemy) {
		const depth = state.worldIndex + state.levelIndex + 2;
		state.enemies.push(createEnemy('klipah', (enemy.lane + 1) % 3, enemy.z - 2, depth));
		state.enemies.push(createEnemy('klipah', (enemy.lane + 2) % 3, enemy.z - 4, depth));
	}

	splitProjectile(state, enemy) {
		const damage = 3 * state.damageMultiplier;
		state.shots.push(createShot(enemy.x - 0.35, enemy.z, damage));
		state.shots.push(createShot(enemy.x + 0.35, enemy.z, damage));
	}

	burst(state, enemy, count) {
		for (let index = 0; index < count; index += 1) {
			if (state.particles.length >= GAME.maximumParticles) {
				break;
			}
			const phase = (index + state.particles.length) * 1.618;
			const velocity = [
				Math.sin(phase) * 2.2,
				1.3 + index * 0.15,
				Math.cos(phase) * 2.2
			];
			state.particles.push(createParticle(
				enemy.x,
				enemy.y,
				enemy.z,
				COLORS.spark,
				velocity
			));
		}
	}
}

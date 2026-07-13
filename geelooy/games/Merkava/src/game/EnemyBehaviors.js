//B"H
// Boruch Hashem
// Blessed is He
/**
 * Each shell announces counterplay through movement, theft, arrows, and corruption.
 * The Awtsmoos remains beyond behavior while Awtsmoos.com reveals the contest.
 */
import { GAME, LANES } from '../config/gameConfig.js';
import { createEnemy, createEnemyShot } from './EntityFactory.js';

export class EnemyBehaviors {
	update(state, delta) {
		for (const enemy of state.enemies) {
			enemy.hitFlash = Math.max(0, enemy.hitFlash - delta);
			enemy.stunned = Math.max(0, enemy.stunned - delta);
			enemy.rotation += delta * (enemy.type === 'raven' ? 2.3 : 0.5);
			if (enemy.stunned > 0) {
				continue;
			}
			this.move(enemy, state, delta);
			this.attack(enemy, state, delta);
		}
	}

	move(enemy, state, delta) {
		if (enemy.type === 'raven') {
			enemy.x = enemy.baseX + Math.sin(state.elapsed * 2.5 + enemy.phase) * 1.15;
		} else if (enemy.type === 'thief') {
			const weaving = enemy.baseX + Math.sin(state.elapsed * 3 + enemy.phase) * 2.2;
			enemy.x = Math.max(LANES[0], Math.min(LANES[2], weaving));
		} else if (enemy.type === 'drainer') {
			enemy.x += (state.playerX - enemy.x) * Math.min(0.4, delta * 0.55);
		}
	}

	attack(enemy, state, delta) {
		enemy.attackClock -= delta;
		if (enemy.attackClock > 0) {
			return;
		}
		if (enemy.type === 'archer') {
			this.fireArcher(enemy, state);
		} else if (enemy.type === 'summoner') {
			this.summon(enemy, state);
		} else if (enemy.type === 'corrupter') {
			this.corruptGate(state, enemy);
		}
	}

	fireArcher(enemy, state) {
		if (state.enemyShots.length >= GAME.maximumEnemyShots) {
			return;
		}
		const curve = state.worldIndex === 1 ? 0.9 : 0;
		state.enemyShots.push(createEnemyShot(
			nearestLane(enemy.x),
			enemy.z + 2,
			enemy.damage,
			curve
		));
		enemy.attackClock = 2.2;
		state.pushEvent('enemy-shot', { type: 'archer', curve });
	}

	summon(enemy, state) {
		if (state.enemies.length >= GAME.maximumEnemies - 2) {
			return;
		}
		const depth = state.worldIndex + state.levelIndex;
		state.enemies.push(createEnemy('klipah', (enemy.lane + 1) % 3, enemy.z - 3, depth));
		enemy.attackClock = 3.1;
		state.pushEvent('summon');
	}

	corruptGate(state, enemy) {
		const gate = state.gates.find(item => {
			return item.kind === 'positive' && Math.abs(item.z - enemy.z) < 18;
		});
		if (!gate) {
			return;
		}
		gate.kind = 'negative';
		gate.operation = 'subtract';
		gate.value = Math.max(2, Math.ceil(gate.value / 2));
		gate.label = `−${gate.value}`;
		enemy.attackClock = 2.8;
		state.pushEvent('gate-corrupted');
	}
}

function nearestLane(x) {
	let lane = 0;
	let distance = Infinity;
	for (let index = 0; index < LANES.length; index += 1) {
		const nextDistance = Math.abs(LANES[index] - x);
		if (nextDistance < distance) {
			distance = nextDistance;
			lane = index;
		}
	}
	return lane;
}

//B"H
// Boruch Hashem
// Blessed is He
/**
 * Encounter rows place temptation beside resistance while preserving a possible path.
 * The Awtsmoos grants each choice existence as Awtsmoos.com reveals the road.
 */
import { GAME } from '../config/gameConfig.js';
import { isEndlessMode } from '../modes/RunModeCatalog.js';
import { createEnemy, createGate, createPrutah, createSpark } from './EntityFactory.js';

const ENEMY_SETS = Object.freeze([
	['klipah', 'golem', 'obstacle'],
	['raven', 'archer', 'golem'],
	['drainer', 'splitter', 'corrupter'],
	['summoner', 'thief', 'elite'],
	['corrupter', 'elite', 'summoner']
]);

export class EncounterDirector {
	constructor() {
		this.reset();
	}
	reset() {
		this.spawnClock = 0.8;
		this.rowIndex = 0;
	}
	update(state, delta) {
		const closed = state.boss || state.transitionRequest ||
			state.levelProgress >= GAME.levelDistance - 15;
		if (closed) {
			return;
		}
		this.spawnClock -= delta;
		if (this.spawnClock > 0 || state.enemies.length >= GAME.maximumEnemies) {
			return;
		}
		this.spawnClock = encounterDelay(state);
		this.spawnRow(state);
		this.rowIndex += 1;
	}
	spawnRow(state) {
		const lanes = rotatedLanes(this.rowIndex + state.levelIndex);
		const pattern = this.rowIndex % 6;
		if (pattern === 0 || pattern === 3) {
			this.spawnGateChoice(state, lanes[0], lanes[1]);
			this.spawnPrutahTrail(state, lanes[2], 4);
			return;
		}
		if (pattern === 1) {
			state.enemies.push(createEnemy(
				this.enemyType(state, 0), lanes[0], GAME.spawnZ, depth(state)
			));
			this.spawnPrutahTrail(state, lanes[1], 5);
			state.sparks.push(createSpark(laneX(lanes[2]), GAME.spawnZ - 3));
			return;
		}
		if (pattern === 2 || pattern === 5) {
			state.enemies.push(createEnemy(
				this.enemyType(state, 1), lanes[0], GAME.spawnZ, depth(state)
			));
			state.enemies.push(createEnemy(
				this.enemyType(state, 2), lanes[1], GAME.spawnZ - 7, depth(state)
			));
			this.spawnPrutahTrail(state, lanes[2], 6, pattern === 5);
			return;
		}
		state.enemies.push(createEnemy('thief', lanes[0], GAME.spawnZ, depth(state)));
		this.spawnPrutahTrail(state, lanes[0], 5, true);
		this.spawnPrutahTrail(state, lanes[2], 3);
	}
	spawnGateChoice(state, positiveLane, negativeLane) {
		const multiplication = this.rowIndex > 0 && this.rowIndex % 6 === 0;
		const positiveOperation = multiplication ? 'multiply' : 'add';
		const positiveValue = multiplication ? 2 : 4 + state.worldIndex + state.levelIndex;
		const negativeOperation = this.rowIndex % 4 === 0 ? 'divide' : 'subtract';
		const negativeValue = negativeOperation === 'divide' ? 2 : 2 + state.worldIndex;
		state.gates.push(createGate(
			positiveLane, GAME.spawnZ, positiveOperation, positiveValue, 'positive'
		));
		state.gates.push(createGate(
			negativeLane, GAME.spawnZ, negativeOperation, negativeValue, 'negative'
		));
	}
	spawnPrutahTrail(state, lane, count, risky = false) {
		const goldenCycle = state.relics.includes('lamp') ? 7 : 11;
		for (let index = 0; index < count; index += 1) {
			if (state.prutahItems.length >= GAME.maximumCollectibles) {
				break;
			}
			const golden = (this.rowIndex + index + state.worldIndex * 2) %
				goldenCycle === 0;
			state.prutahItems.push(createPrutah(
				lane, GAME.spawnZ - index * 3.2, golden, risky
			));
		}
	}
	enemyType(state, offset) {
		const set = ENEMY_SETS[Math.min(ENEMY_SETS.length - 1, state.worldIndex)];
		return set[(this.rowIndex + offset + state.levelIndex) % set.length];
	}
}

function encounterDelay(state) {
	const base = Math.max(0.85, 1.75 - state.worldIndex * 0.12 - state.levelIndex * 0.05);
	const multiplier = isEndlessMode(state) ? state.endlessEncounterMultiplier || 1 : 1;
	return Math.max(0.55, base * multiplier);
}
function depth(state) {
	const endlessBonus = isEndlessMode(state) ? state.endlessDepthBonus || 0 : 0;
	return 1 + state.worldIndex * 4 + state.levelIndex + endlessBonus;
}
function rotatedLanes(seed) {
	return [seed % 3, (seed + 1) % 3, (seed + 2) % 3];
}
function laneX(lane) {
	return [-3.4, 0, 3.4][lane];
}
